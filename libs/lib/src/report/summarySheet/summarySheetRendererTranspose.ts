import * as _ from 'lodash';
import utils from '../../utils';

import helper from '../reportHelper';
import extras from '../../calculations/extras';
import commonSectionsRenderer from '../commonSectionsRenderer';

import * as literals from '../../constants/literals';
import * as constants from '../../constants/constants';
import notesRenderer from './notesRenderer';
import legendRenderer from './legendRenderer';
import wasteSectionsRenderer from './wasteSectionsRenderer';
import {AddWorksheetOptions, Workbook, Worksheet} from 'exceljs';
import waterSectionRenderer from './waterSectionRenderer';
import reportHelper from '../reportHelper';

const path = utils.loadModule('path');

export default {
  renderSummarySheetTransposed,
  addTableHeader, //for tests
  addPqlValue, //for tests
  setColumnsWidths, //for tests
  addChemicalValues, //for tests
  addCriteriaTitles, //for tests
  addUnitPqlRowHeader, //for tests
  addSampleIdsAndSampleDateHeader, //for tests
  addReportTableHeader, //for tests
};

const workSheetProps: Partial<AddWorksheetOptions> = {
  views: [{state: 'frozen', xSplit: 0, ySplit: 8}],
};

async function renderSummarySheetTransposed(
  workBook: Workbook,
  seedData: SoilAssessmentCalculationData | GwCalculationData | WasteClassificationCalculationData,
  dataFolderPath: string,
  reportItems: ReportItem[],
  samples: Sample[],
  tableGroups: ChemicalGroup[],
  selectedTableGroupsKeys: string[],
  tableNumber: number,
  sessionParameters: SessionParameters,
  isPhenolsPresent: boolean
) {
  const startRowNumber = 6;
  const startColumnIndex = 0;
  const reportChemicalsCellIndex = startColumnIndex + 1;
  const pqlColumnIndex = startColumnIndex + 2;
  const unitsColumnIndex = startColumnIndex + 3;
  const startCriteriaColumnIndex = startColumnIndex + 4;
  const pqlUnitsRowNumber = startRowNumber + 1;
  const startContentRowNumber = startRowNumber + 3;

  let startContentColumnIndex = startCriteriaColumnIndex;

  const titleData = helper.getSummarySheetTitle(reportItems, tableGroups, selectedTableGroupsKeys, tableNumber);

  const ws = workBook.addWorksheet(titleData.sheetName, workSheetProps);
  ws.views = [...workSheetProps.views, {showGridLines: false}]; //remove all borders

  setColumnsWidths(ws, startColumnIndex, reportChemicalsCellIndex, unitsColumnIndex);

  commonSectionsRenderer.addSheetHeader(ws, titleData.sheetTitle);

  const logoPath = path.join(dataFolderPath, constants.logoPath);
  commonSectionsRenderer.addLogo(workBook, ws, logoPath);

  commonSectionsRenderer.addReportGroupsVertical(ws, startContentRowNumber, startColumnIndex, reportItems, tableGroups);

  commonSectionsRenderer.addReportChemicalsVertical(
    ws,
    startContentRowNumber,
    reportChemicalsCellIndex,
    reportItems,
    sessionParameters
  );

  commonSectionsRenderer.addReportUnitsVertical(ws, startContentRowNumber, unitsColumnIndex, reportItems);

  addPqlValue(ws, startContentRowNumber, pqlColumnIndex, reportItems);

  if (extras.isWaterAssessment(sessionParameters)) {
    startContentColumnIndex = waterSectionRenderer.generateWaterSpecificSectionsTranspose(
      ws,
      startRowNumber,
      startContentRowNumber,
      startCriteriaColumnIndex,
      sessionParameters,
      reportItems,
      seedData as GwCalculationData
    );
  }

  // eslint-disable-next-line prefer-const
  let {lastRowNumber, lastColumnIndex} = addChemicalValues(
    ws,
    startContentRowNumber,
    startContentColumnIndex,
    reportItems,
    samples,
    sessionParameters
  );

  if (extras.isWasteAssessment(sessionParameters)) {
    await wasteSectionsRenderer.generateWasteSpecificSectionsVertical(
      ws,
      startRowNumber,
      lastColumnIndex,
      reportItems,
      sessionParameters
    );

    lastRowNumber = await legendRenderer.addWasteLegend(ws, lastRowNumber, startColumnIndex);
    lastRowNumber = lastRowNumber + 2;
  }

  addReportTableHeader(
    ws,
    samples,
    startRowNumber,
    startColumnIndex,
    startContentColumnIndex,
    pqlColumnIndex,
    unitsColumnIndex,
    pqlUnitsRowNumber,
    startContentRowNumber
  );

  notesRenderer.addNotes(ws, lastRowNumber, startColumnIndex, sessionParameters, seedData, isPhenolsPresent);
}

function addReportTableHeader(
  ws: Worksheet,
  samples: Sample[],
  rowNumber: number,
  startColumnIndex: number,
  startContentColumnIndex: number,
  pqlCellIndex: number,
  unitsCellIndex: number,
  pqlUnitsRowNumber: number,
  contentRowNumber: number
) {
  let lastCellIndex = Math.max(pqlCellIndex, unitsCellIndex);

  addUnitPqlRowHeader(ws, pqlUnitsRowNumber, pqlCellIndex, unitsCellIndex);

  lastCellIndex++;

  lastCellIndex = addSampleIdsAndSampleDateHeader(
    ws,
    samples,
    rowNumber + 1,
    startColumnIndex,
    startContentColumnIndex
  );

  //Set border around all cells in header

  for (let k = rowNumber; k < contentRowNumber; k++) {
    helper.setHairBorderAroundCellsByColumn(ws, k, startColumnIndex, lastCellIndex);
  }
  return startContentColumnIndex;
}

function addSampleIdsAndSampleDateHeader(
  ws: Worksheet,
  samples: Sample[],
  sampleIdRowNumber: number,
  startColumnIndex: number,
  startContentColumnIndex: number
) {
  const dateRowNumber = sampleIdRowNumber + 1;

  // 1. adding 'Sample ID' and 'Sample Date' cells (beginning of the header)

  addTableHeader(ws, literals.sampleId, sampleIdRowNumber, startColumnIndex);
  addTableHeader(ws, literals.sampleDate, dateRowNumber, startColumnIndex);

  // 2. adding values cells (rest of the header)

  let lastIndex = startContentColumnIndex;

  for (const sample of samples) {
    helper.setCell(
      ws,
      helper.getCellAddress(sampleIdRowNumber, lastIndex),
      sample.dpSampleId,
      constants.fontSize.content,
      false,
      helper.getMiddleCenterAlignment()
    );
    helper.setCell(
      ws,
      helper.getCellAddress(dateRowNumber, lastIndex),
      sample.dateSampled,
      constants.fontSize.content,
      false,
      helper.getMiddleCenterAlignment()
    );
    lastIndex++;
  }

  return lastIndex;
}

function addUnitPqlRowHeader(ws: Worksheet, rowNumber: number, pqlCellIndex: number, unitsCellIndex: number) {
  const pqlUnitHeaderRowNumber = rowNumber + 1;
  addTableHeader(ws, literals.pql, pqlUnitHeaderRowNumber, pqlCellIndex);
  addTableHeader(ws, literals.units, pqlUnitHeaderRowNumber, unitsCellIndex);
}

function addCriteriaTitles(
  ws: Worksheet,
  sessionParameters: SessionParameters,
  gwCriteria: any[],
  rowNumber: number,
  cellIndex: number
) {
  let lastCellIndex = cellIndex;

  for (const code of sessionParameters.criteria) {
    const firstCellAddress = helper.getCellAddress(rowNumber, lastCellIndex);
    const lastCellAddress = helper.getCellAddress(rowNumber + 2, lastCellIndex);
    ws.mergeCells(`${firstCellAddress}:${lastCellAddress}`);

    const criteria = _.find(gwCriteria, ['code', code]);

    if (!criteria) return null;

    const title = helper.getGwCriteriaTitle(code, criteria.name, sessionParameters);

    const cell = helper.setCell(
      ws,
      firstCellAddress,
      title,
      constants.fontSize.header,
      false,
      helper.getCenterAlignment(),
      helper.getHairBorderAround()
    );

    const displayOptions = {
      backgroundColor: criteria.color,
    };

    if (displayOptions) {
      helper.applyCellDisplayOptions(cell, displayOptions);
    }
    lastCellIndex++;
  }

  return lastCellIndex;
}

function addChemicalValues(
  ws: Worksheet,
  rowNumber: number,
  cellIndex: number,
  reportItems: ReportItem[],
  samples: Sample[],
  sessionParameters: SessionParameters
) {
  let currentIndex = cellIndex;
  for (const chemical of reportItems) {
    currentIndex = cellIndex;
    for (const sample of samples) {
      const sampleId = sample.labSampleId;

      const chemicalSamples = chemical.reportCells;
      const chemicalData = chemicalSamples[sampleId];

      const cellAddress = helper.getCellAddress(rowNumber, currentIndex);
      commonSectionsRenderer.addChemicalValue(ws, cellAddress, chemicalData, sessionParameters);
      currentIndex++;
    }
    rowNumber++;
  }
  return {lastRowNumber: rowNumber, lastColumnIndex: currentIndex};
}

function addTableHeader(ws: Worksheet, label: string, rowNumber: number, cellIndex: number) {
  helper.setCell(
    ws,
    helper.getCellAddress(rowNumber, cellIndex),
    label,
    constants.fontSize.header,
    false,
    helper.getMiddleCenterAlignment(),
    helper.getHairBorderAround()
  );
}

function addPqlValue(ws: Worksheet, rowNumber: number, pqlCellIndex: number, reportItems: ReportItem[]) {
  for (const item of reportItems) {
    const firstCell = helper.getCellAddress(rowNumber, pqlCellIndex);
    const formattedPqlValue = reportHelper.formatNumberIfGreaterThan1000(item.pqlValue);

    const value = item.pqlPrefix === ValuePrefixType.Less ? `<${formattedPqlValue}` : formattedPqlValue;

    helper.setCell(
      ws,
      firstCell,
      value,
      constants.fontSize.content,
      false,
      helper.getMiddleCenterAlignment(),
      helper.getHairBorderAround()
    );
    rowNumber++;
  }
}

function setColumnsWidths(
  ws: Worksheet,
  startCellIndex: number,
  reportChemicalsCellIndex: number,
  unitsCellIndex: number
) {
  helper.setColumnWidth(ws, startCellIndex, 20);
  helper.setColumnWidth(ws, reportChemicalsCellIndex, 25);
  helper.setColumnWidth(ws, unitsCellIndex, 10);
}
