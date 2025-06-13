import * as _ from 'lodash';
import utils from '../../utils';

import helper from '../reportHelper';
import commonSectionsRenderer from '../commonSectionsRenderer';
import * as constants from '../../constants/constants';
import * as literals from '../../constants/literals';
import {AddWorksheetOptions, Workbook, Worksheet} from 'exceljs';
import extras from '../../calculations/extras';
import tripSpikeSheetHelper from './tripSpikeSheetHelper';

const path = utils.loadModule('path');

export default {
  generateTripSpikeSheetTranspose,
  addTripSpikeTable, //for tests
};

const workSheetPropsQaQc: Partial<AddWorksheetOptions> = {
  views: [{state: 'frozen', xSplit: 0, ySplit: 3}],
};

async function generateTripSpikeSheetTranspose(
  wb: Workbook,
  dataFolderPath: string,
  samples: Sample[],
  tableData: ReportItem[],
  btexGroup: Chemical[],
  sessionParameters: SessionParameters
) {
  let startRowNumber = 6;
  const startColumnNumber = 0;

  const ws = wb.addWorksheet(literals.ts, workSheetPropsQaQc);

  const title = extras.isWaterAssessment(sessionParameters) ? literals.tsTitleWater : literals.tsTitleSoil;

  commonSectionsRenderer.addSheetHeader(ws, title);

  const presentChemicals = tableData.filter((x) => !x.isCalculable).map((x) => x.code);

  const btexChemicals = btexGroup.filter((x) => presentChemicals.includes(x.code));

  const sortedUnitsAndGroupedReportItems = extras.getSortedByUnits(
    tableData,
    extras.isWasteAssessment(sessionParameters)
  );

  sortedUnitsAndGroupedReportItems.units.forEach((units) => {
    const tableDataByUnit = sortedUnitsAndGroupedReportItems.reportItems[units] as ReportItem[];

    const tbTsData: IHasUnit[] = getTsData(samples, tableDataByUnit, btexChemicals, sessionParameters);

    addTripSpikeTable(ws, startRowNumber, startColumnNumber, tbTsData, btexChemicals);

    startRowNumber = startRowNumber + tbTsData.length + 8;
  });

  const logoPath = path.join(dataFolderPath, constants.logoPath);
  commonSectionsRenderer.addLogo(wb, ws, logoPath);
}

function addTripSpikeTable(
  ws: Worksheet,
  startRowNumber: number,
  columnNumber: number,
  data: any[],
  btexChemicals: any
) {
  const headersData = tripSpikeSheetHelper.getHeadersData(btexChemicals);
  headersData.forEach((item, index) => {
    let currentRowNumber = startRowNumber + index;
    const titleCellAddress = helper.getCellAddress(currentRowNumber, columnNumber);

    helper.setCell(
      ws,
      titleCellAddress,
      item.label,
      constants.fontSize.header,
      false,
      helper.getMiddleCenterAlignment(false, null),
      helper.getHairBorderAround()
    );
  });

  commonSectionsRenderer.addSimpleTableContentVertical(ws, startRowNumber, columnNumber, data, headersData);
}

//Helper functions

function getTsData(
  sampleData: Sample[],
  reportItems: ReportItem[],
  btexChemicals: Chemical[],
  sessionParameters: SessionParameters
): any[] {
  const result: any[] = [];
  const itemsLookup = _.keyBy(reportItems, (x) => x.code);

  const btexCodes = btexChemicals.map((x) => x.code);

  for (let i = 0; i < sampleData.length; i++) {
    const sample = sampleData[i];

    const item: any = {
      dpSampleId: sample.dpSampleId,
      sampleMedia: extras.isWaterAssessment(sessionParameters) ? literals.water : literals.soil,
      sampleType: sample.matrixType,
      sampleDate: sample.dateSampled,
      labReportNo: sample.labReportNo,
    };

    for (const code of btexCodes) {
      if (!itemsLookup[code]) continue;
      const previewValue = itemsLookup[code].reportCells[sample.labSampleId];
      const value = getReportValue(previewValue);
      if (value !== '-') {
        item[code] = value;
      } else {
        item[code] = 0;
      }
    }

    result.push(item);
  }
  return result;
}

function getReportValue(previewValue: ReportCellWithLimits) {
  if (!previewValue) return literals.noValue;

  return previewValue.prefix === ValuePrefixType.Less ? `<${previewValue.value}` : previewValue.value;
}
