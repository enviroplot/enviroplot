import * as _ from 'lodash';
import utils from '../../utils';

import helper from '../reportHelper';
import commonSectionsRenderer from '../commonSectionsRenderer';
import * as constants from '../../constants/constants';
import * as literals from '../../constants/literals';
import {AddWorksheetOptions, Workbook, Worksheet} from 'exceljs';
import extras from '../../calculations/extras';

const path = utils.loadModule('path');

export default {
  generateTripBlankTranspose,
  addTripBlankTable, //for test
};

const workSheetPropsQaQc: Partial<AddWorksheetOptions> = {
  views: [{state: 'frozen', xSplit: 0, ySplit: 3}],
};

async function generateTripBlankTranspose(
  wb: Workbook,
  dataFolderPath: string,
  sortedUnitsAndGroupedReportItems: SortedAndGroupedReportItems,
  samples: Sample[],
  chemicalGroups: ChemicalGroup[],
  selectedGroupsKeys: string[],
  sessionParameters: SessionParameters
) {
  const ws = wb.addWorksheet(literals.tb, workSheetPropsQaQc);

  const tbTitle: string = extras.isWaterAssessment(sessionParameters) ? literals.tbTitleWater : literals.tbTitleSoil;

  commonSectionsRenderer.addSheetHeader(ws, tbTitle);

  let nextTableStartRow = 7;

  sortedUnitsAndGroupedReportItems.units.forEach((units) => {
    const tableDataByUnit = sortedUnitsAndGroupedReportItems.reportItems[units] as ReportItem[];

    nextTableStartRow = addTripBlankTable(
      ws,
      nextTableStartRow,
      units,
      tableDataByUnit,
      samples,
      chemicalGroups,
      selectedGroupsKeys,
      sessionParameters
    );

    nextTableStartRow = nextTableStartRow + 3;
  });

  const logoPath = path.join(dataFolderPath, constants.logoPath);
  commonSectionsRenderer.addLogo(wb, ws, logoPath);
}

//Helper functions

function addTripBlankTable(
  ws: Worksheet,
  startRowNumber: number,
  units: string,
  reportItems: ReportItem[],
  samples: Sample[],
  chemicalGroups: ChemicalGroup[],
  reportGroups: string[],
  sessionParameters: SessionParameters
) {
  const chemicalsColumnNumber = 0;
  const startContentColumnNumber = 2;

  const tableGroups: ChemicalGroup[] = [];

  helper.setRowHeight(ws, chemicalsColumnNumber, constants.rowHeight.chemicalsHeader);

  for (const group of chemicalGroups) {
    if (reportGroups.includes(group.code)) {
      tableGroups.push(group);
    }
  }

  addHeadersVertically(ws, startRowNumber, chemicalsColumnNumber, reportItems, sessionParameters, tableGroups);

  const result = addSamplesColumns(
    ws,
    startRowNumber,
    startContentColumnNumber,
    units,
    reportItems,
    samples,
    sessionParameters
  );

  return result;
}

function addHeadersVertically(
  ws: Worksheet,
  startRowNumber: number,
  columnNumber: number,
  reportItems: ReportItem[],
  sessionParameters: SessionParameters,
  tableGroups: ChemicalGroup[]
) {
  const headersData: KeyLabelItem[] = [
    {key: 'dpSampleId', label: literals.sampleId},
    {key: 'sampleDate', label: literals.sampleDate},
    {key: 'sampleMedia', label: literals.sampleMedia},
    {key: 'sampleType', label: literals.sampleType},
    {key: 'units', label: literals.units},
  ];

  let currentRowNumber = startRowNumber;

  headersData.forEach((item, index) => {
    currentRowNumber = startRowNumber + index;
    const titleFirstCellAddress = helper.getCellAddress(currentRowNumber, columnNumber);
    const titleLastCellAddress = helper.getCellAddress(currentRowNumber, columnNumber + 1);

    helper.setCell(
      ws,
      titleFirstCellAddress,
      item.label,
      constants.fontSize.header,
      false,
      helper.getMiddleCenterAlignment(true),
      helper.getHairBorderAround()
    );

    ws.mergeCells(`${titleFirstCellAddress}:${titleLastCellAddress}`);
  });

  currentRowNumber++;

  commonSectionsRenderer.addReportGroupsVertical(ws, currentRowNumber, columnNumber, reportItems, tableGroups);

  commonSectionsRenderer.addReportChemicalsVertical(
    ws,
    currentRowNumber,
    columnNumber + 1,
    reportItems,
    sessionParameters
  );

  const labReportNumberRowNumber = startRowNumber + reportItems.length + headersData.length;

  ws.mergeCells(
    `${helper.getCellAddress(labReportNumberRowNumber, columnNumber)}:${helper.getCellAddress(
      labReportNumberRowNumber,
      columnNumber + 1
    )}`
  );

  helper.setCell(
    ws,
    helper.getCellAddress(labReportNumberRowNumber, columnNumber),
    literals.labReportNo,
    constants.fontSize.header,
    false,
    helper.getMiddleCenterAlignment(true),
    helper.getHairBorderAround()
  );
}

function addSamplesColumns(
  ws: Worksheet,
  rowNumber: number,
  columnNumber: number,
  units: string,
  reportItems: ReportItem[],
  samples: Sample[],
  sessionParameters: SessionParameters
) {
  let lastRowNumber = 0;
  let currentColumnNumber = columnNumber;

  for (const sample of samples) {
    const sampleId = sample.labSampleId;
    let currentRowNumber = rowNumber;

    helper.setCell(
      ws,
      helper.getCellAddress(currentRowNumber, currentColumnNumber),
      sample.dpSampleId,
      constants.fontSize.content,
      false,
      helper.getMiddleCenterAlignment(true),
      helper.getHairBorderAround()
    );

    currentRowNumber++;

    helper.setCell(
      ws,
      helper.getCellAddress(currentRowNumber, currentColumnNumber),
      sample.dateSampled,
      constants.fontSize.content,
      false,
      helper.getMiddleCenterAlignment(true),
      helper.getHairBorderAround()
    );
    currentRowNumber++;

    helper.setCell(
      ws,
      helper.getCellAddress(currentRowNumber, currentColumnNumber),
      extras.isWaterAssessment(sessionParameters) ? literals.water : literals.soil,
      constants.fontSize.content,
      false,
      helper.getMiddleCenterAlignment(true),
      helper.getHairBorderAround()
    );
    currentRowNumber++;

    helper.setCell(
      ws,
      helper.getCellAddress(currentRowNumber, currentColumnNumber),
      sample.matrixType,
      constants.fontSize.content,
      false,
      helper.getMiddleCenterAlignment(true),
      helper.getHairBorderAround()
    );
    currentRowNumber++;

    helper.setCell(
      ws,
      helper.getCellAddress(currentRowNumber, currentColumnNumber),
      units,
      constants.fontSize.content,
      false,
      helper.getMiddleCenterAlignment(true),
      helper.getHairBorderAround()
    );
    currentRowNumber++;

    for (const chemical of reportItems) {
      const chemicalSamples = chemical.reportCells;
      const chemicalData = chemicalSamples[sampleId];

      const cellAddress = helper.getCellAddress(currentRowNumber, currentColumnNumber);

      commonSectionsRenderer.addChemicalValue(ws, cellAddress, chemicalData, sessionParameters, true);

      currentRowNumber++;
    }

    helper.setCell(
      ws,
      helper.getCellAddress(currentRowNumber, currentColumnNumber),
      sample.labReportNo,
      constants.fontSize.content,
      false,
      helper.getMiddleCenterAlignment(true),
      helper.getHairBorderAround()
    );

    if (!lastRowNumber) lastRowNumber = currentRowNumber - 1;

    currentRowNumber++;
    currentColumnNumber++;
  }
  return lastRowNumber;
}
