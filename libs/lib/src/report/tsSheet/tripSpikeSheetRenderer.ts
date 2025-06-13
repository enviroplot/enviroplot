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
  generateTripSpikeSheet,
  addTripSpikeTable, //for tests
};

const workSheetPropsQaQc: Partial<AddWorksheetOptions> = {
  views: [{state: 'frozen', xSplit: 0, ySplit: 3}],
};

async function generateTripSpikeSheet(
  wb: Workbook,
  dataFolderPath: string,
  samples: Sample[],
  reportItems: ReportItem[],
  btexGroup: Chemical[],
  sessionParameters: SessionParameters
) {
  const headerRowNumber = 6;
  const startColumnIndex = 0;

  const ws = wb.addWorksheet(literals.ts, workSheetPropsQaQc);

  const title = extras.isWaterAssessment(sessionParameters) ? literals.tsTitleWater : literals.tsTitleSoil;

  commonSectionsRenderer.addSheetHeader(ws, title);

  const presentChemicals = reportItems.filter((x) => !x.isCalculable).map((x) => x.code);

  const btexChemicals = btexGroup.filter((x) => presentChemicals.includes(x.code));

  const tbTsData: any[] = tripSpikeSheetHelper.getTsData(samples, reportItems, btexChemicals, sessionParameters);

  addTripSpikeTable(ws, headerRowNumber, startColumnIndex, tbTsData, btexChemicals);

  const logoPath = path.join(dataFolderPath, constants.logoPath);
  commonSectionsRenderer.addLogo(wb, ws, logoPath);
}

function addTripSpikeTable(
  ws: Worksheet,
  headerRowNumber: number,
  startColumnIndex: number,
  data: any[],
  btexChemicals: any
) {
  helper.setRowHeight(ws, headerRowNumber, constants.rowHeight.chemicalsHeader);

  const headersData = tripSpikeSheetHelper.getHeadersData(btexChemicals);
  headersData.forEach((item, columnIndex) => {
    helper.setColumnWidth(ws, columnIndex, constants.columnWidth.common);
    const titleCellAddress = helper.getCellAddress(headerRowNumber, columnIndex);
    const notChemicalsHeaders = columnIndex <= 3 || columnIndex === headersData.length - 1;
    const textRotation = notChemicalsHeaders ? null : 90;
    const columnWidth = notChemicalsHeaders ? constants.columnWidth.sampleId : constants.columnWidth.common;
    helper.setColumnWidth(ws, columnIndex, columnWidth);

    helper.setCell(
      ws,
      titleCellAddress,
      item.label,
      constants.fontSize.header,
      false,
      helper.getMiddleCenterAlignment(false, textRotation),
      helper.getHairBorderAround()
    );
  });

  commonSectionsRenderer.addSimpleTableContentHorizontal(ws, headerRowNumber, startColumnIndex, data, headersData);
}

//Helper functions
