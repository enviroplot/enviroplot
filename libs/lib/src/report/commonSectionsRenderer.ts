import * as _ from 'lodash';

import {Workbook, Worksheet} from 'exceljs';

import * as CONSTANTS from '../constants/constants';
import * as literals from '../constants/literals';
import helper from './reportHelper';
import extras from '../calculations/extras';
import notesRenderer from './summarySheet/notesRenderer';
import reportHelper from './reportHelper';

export default {
  addSheetHeader,
  addLogo,
  addReportChemicalsHorizontal,
  addReportGroupsHorizontal,
  addReportUnitsHorizontal,
  addReportPQLHorizontal,
  addReportChemicalsVertical,
  addReportGroupsVertical,
  addReportUnitsVertical,
  addSimpleTableContentHorizontal,
  addSimpleTableContentVertical,
  addChemicalValue,
  addReportFooter,
  addProjectDetails, //for tests
  mergeNestedColumns, //for tests
};

function addSheetHeader(ws: Worksheet, headerText: string) {
  helper.setRowHeight(ws, 2, CONSTANTS.rowHeight.emptyHeaderRow);

  helper.setRowHeight(ws, 3, CONSTANTS.rowHeight.titleHeaderRow);

  helper.setCell(ws, 'A3', headerText, 12, false, helper.getAlignment('top', 'left'));

  helper.hideRow(ws, 4);

  helper.setRowHeight(ws, 5, CONSTANTS.rowHeight.emptyHeaderRow);
}

async function addReportChemicalsHorizontal(
  ws: Worksheet,
  rowNumber: number,
  columnIndex: number,
  reportItems: IHasChemicalDetail[],
  sessionParameters: SessionParameters,
  numberOfNestedColumns: number = 1
) {
  helper.setRowHeight(ws, rowNumber, CONSTANTS.rowHeight.chemicalsHeader);

  for (let index = 0; index < columnIndex; index++) {
    const cellAddress = helper.getCellAddress(rowNumber, index);
    const cell = ws.getCell(cellAddress);
    cell.border = helper.getHairBorderAround();
  }

  for (const item of reportItems) {
    for (let nestedColumnIndex = 0; nestedColumnIndex <= numberOfNestedColumns; nestedColumnIndex++) {
      const nestedColumn = ws.getColumn(columnIndex + nestedColumnIndex);
      nestedColumn.width = CONSTANTS.columnWidth.common / numberOfNestedColumns;
    }
    const firstCell = helper.getCellAddress(rowNumber, columnIndex);
    mergeNestedColumns(ws, rowNumber, columnIndex, numberOfNestedColumns, firstCell);

    columnIndex += numberOfNestedColumns;
    const cellValue = helper.getChemicalTitle(item, sessionParameters);

    helper.setCell(
      ws,
      firstCell,
      cellValue,
      CONSTANTS.fontSize.header,
      false,
      helper.getMiddleCenterAlignment(true, 90),
      helper.getHairBorderAround()
    );
  }
}

async function addReportPQLHorizontal(
  ws: Worksheet,
  rowNumber: number,
  columnIndex: number,
  reportItems: ReportItem[],
  numberOfNestedColumns: number = 1
) {
  helper.setRowHeight(ws, rowNumber, CONSTANTS.rowHeight.content);

  const titleCellAddress = helper.getCellAddress(rowNumber, columnIndex - 1);

  helper.setCell(
    ws,
    titleCellAddress,
    literals.pql,
    CONSTANTS.fontSize.content,
    false,
    helper.getMiddleCenterAlignment(),
    helper.getHairBorderAround()
  );

  for (let index = 0; index < columnIndex; index++) {
    const cellName = helper.getCellAddress(rowNumber, index);
    const cell = ws.getCell(cellName);
    cell.border = helper.getHairBorderAround();
  }

  for (const item of reportItems) {
    const firstCell = helper.getCellAddress(rowNumber, columnIndex);
    mergeNestedColumns(ws, rowNumber, columnIndex, numberOfNestedColumns, firstCell);
    columnIndex += numberOfNestedColumns;
    const value =
      item.pqlPrefix === ValuePrefixType.Less
        ? `<${item.pqlValue}`
        : reportHelper.formatNumberIfGreaterThan1000(item.pqlValue);

    helper.setCell(
      ws,
      firstCell,
      value,
      CONSTANTS.fontSize.content,
      false,
      helper.getMiddleCenterAlignment(),
      helper.getHairBorderAround()
    );
  }
}

function addReportUnitsHorizontal(
  ws: Worksheet,
  rowNumber: number,
  columnIndex: number,
  reportItems: ReportItem[],
  showDepthColumn: boolean,
  numberOfNestedColumns: number = 1
) {
  ws.getRow(rowNumber);
  helper.setRowHeight(ws, rowNumber, CONSTANTS.rowHeight.header);

  let startCell = 0;

  const addHeader = (label: string) => {
    helper.setCell(
      ws,
      helper.getCellAddress(rowNumber, startCell),
      label,
      CONSTANTS.fontSize.header,
      false,
      helper.getMiddleCenterAlignment(),
      helper.getHairBorderAround()
    );
    startCell++;
  };

  addHeader(literals.sampleId);

  if (showDepthColumn) {
    addHeader(literals.depth);
  }

  addHeader(literals.sampleDate);

  for (const item of reportItems) {
    const firstCellAddress = helper.getCellAddress(rowNumber, columnIndex);
    mergeNestedColumns(ws, rowNumber, columnIndex, numberOfNestedColumns, firstCellAddress);
    columnIndex += numberOfNestedColumns;

    helper.setCell(
      ws,
      firstCellAddress,
      item.units,
      CONSTANTS.fontSize.header,
      false,
      helper.getMiddleCenterAlignment(),
      helper.getHairBorderAround()
    );
  }
}

function addSimpleTableContentHorizontal(
  ws: Worksheet,
  rowNumberHeader: number,
  startColumnIndex: number,
  contentData: any,
  headersData: KeyLabelItem[]
) {
  contentData.forEach((contentItem: any, rowIndex: number) => {
    const rowNumberCurrent = rowNumberHeader + 1 + rowIndex;
    helper.setRowHeight(ws, rowNumberCurrent, CONSTANTS.rowHeight.content);
    let columnNumberCurrent = startColumnIndex;
    for (var headersItem of headersData) {
      const cellAddress = helper.getCellAddress(rowNumberCurrent, columnNumberCurrent);
      helper.setCell(
        ws,
        cellAddress,
        contentItem[headersItem.key],
        CONSTANTS.fontSize.content,
        false,
        helper.getMiddleCenterAlignment(),
        helper.getHairBorderAround()
      );
      columnNumberCurrent++;
    }
  });
}

function addSimpleTableContentVertical(
  ws: Worksheet,
  rowNumber: number,
  startColumnNumber: number,
  contentData: any,
  headersData: KeyLabelItem[]
) {
  contentData.forEach((contentItem: any, columnNumber: number) => {
    const columnNumberCurrent = startColumnNumber + 1 + columnNumber;
    helper.setRowHeight(ws, columnNumberCurrent, CONSTANTS.rowHeight.content);
    let rowNumberCurrent = rowNumber;
    for (var headersItem of headersData) {
      const cellAddress = helper.getCellAddress(rowNumberCurrent, columnNumberCurrent);
      helper.setCell(
        ws,
        cellAddress,
        contentItem[headersItem.key],
        CONSTANTS.fontSize.content,
        false,
        helper.getMiddleCenterAlignment(),
        helper.getHairBorderAround()
      );
      rowNumberCurrent++;
    }
  });
}

function addLogo(wb: Workbook, ws: Worksheet, path: string) {
  const imageId = wb.addImage({
    filename: path,
    extension: 'png',
  });

  helper.setRowHeight(ws, 1, 36);

  ws.addImage(imageId, {
    tl: {col: 0, row: 0},
    ext: {width: 231, height: 57}, // height and width in pixels for 96dpi;
  });
}

function addReportGroupsHorizontal(
  ws: Worksheet,
  groupsRowNumber: number,
  startColumnIndex: number,
  reportItems: IHasChemicalDetail[],
  tableGroups: ChemicalGroup[],
  nestedColumnsNumber: number = 1
) {
  helper.setRowHeight(ws, groupsRowNumber, CONSTANTS.rowHeight.chemicalsGroups);

  const groupLookup = _.groupBy(reportItems, (item) => {
    return item.group;
  });

  tableGroups = _.sortBy(tableGroups, 'sortOrder');

  for (let index = 0; index < startColumnIndex; index++) {
    const cellName = helper.getCellAddress(groupsRowNumber, index);
    const cell = ws.getCell(cellName);
    cell.border = helper.getHairBorderAround();
  }

  for (const group of tableGroups) {
    const reportItems = groupLookup[group.code];
    if (!reportItems) continue;
    const numberOfReportItems = reportItems.length;

    const firstCell = helper.getCellAddress(groupsRowNumber, startColumnIndex);
    const lastIndex = startColumnIndex + numberOfReportItems * nestedColumnsNumber - 1;
    const lastCell = helper.getCellAddress(groupsRowNumber, lastIndex);
    startColumnIndex += numberOfReportItems * nestedColumnsNumber;

    ws.mergeCells(`${firstCell}:${lastCell}`);

    const value = group.name;

    helper.setCell(
      ws,
      firstCell,
      value,
      CONSTANTS.fontSize.header,
      false,
      helper.getMiddleCenterAlignment(),
      helper.getHairBorderAround()
    );
  }
}

function addChemicalValue(
  ws: Worksheet,
  cellAddress: string,
  cellItem: ReportCellWithLimits,
  sessionParameters: SessionParameters,
  dontAddExceedanceColors?: boolean
) {
  if (cellItem === undefined) {
    cellItem = {
      value: ValueAbbreviations.Dash,
      prefix: ValuePrefixType.ExactValue,
      isAsbestosValue: false,
      isAsbestosDetected: false,
      highlightDetection: false,
      displayOptions: {},
    };
  }

  const isNoData = cellItem.value === ValueAbbreviations.NoData;
  if (isNoData) cellItem.value = ValueAbbreviations.Dash;

  let value = cellItem.prefix === ValuePrefixType.Less ? `<${cellItem.value}` : cellItem.value;

  if (value === 'NaN') value = ValueAbbreviations.Dash;

  const needsBottom =
    (extras.isWaterAssessment(sessionParameters) &&
      sessionParameters.reportOutputFormat === ReportOutputFormat.TRANSPOSED_OUTPUT_FORMAT) ||
    cellItem.isAsbestosValue ||
    sessionParameters.reportOutputFormat === ReportOutputFormat.STANDARD_OUTPUT_FORMAT
      ? true
      : false;
  const border = helper.getBorderStyle('hair', {left: true, right: true, top: true, bottom: needsBottom});

  const cell = helper.setCell(
    ws,
    cellAddress,
    reportHelper.formatNumberIfGreaterThan1000(value),
    CONSTANTS.fontSize.doubleRowContent,
    sessionParameters.highlightAllDetections && cellItem.highlightDetection,
    helper.getMiddleCenterAlignment(),
    border
  );

  if (isNoData) return;

  if (dontAddExceedanceColors || !cellItem.displayOptions) return;

  helper.applyCellDisplayOptions(cell, cellItem.displayOptions);
}

function mergeNestedColumns(
  ws: Worksheet,
  rowNumber: number,
  columnIndex: number,
  numberOfNestedColumns: number,
  firstCellAddress: string
) {
  if (numberOfNestedColumns > 1) {
    const lastCellAddress = helper.getCellAddress(rowNumber, columnIndex + numberOfNestedColumns - 1);

    ws.mergeCells(`${firstCellAddress}:${lastCellAddress}`);
  }
}

function addReportFooter(
  ws: Worksheet,
  lastRow: number,
  startColumnIndex: number,
  seedData: SoilAssessmentCalculationData | GwCalculationData | WasteClassificationCalculationData,
  sessionParameters: SessionParameters,
  isPhenolsPresent: boolean
) {
  const lastPageColumnIndex = helper.getColumnNumberByWidth(ws, CONSTANTS.pageWidth);

  notesRenderer.addNotes(ws, lastRow, startColumnIndex, sessionParameters, seedData, isPhenolsPresent);

  addProjectDetails(ws, sessionParameters.projectDetails, lastPageColumnIndex);
}

function addProjectDetails(ws: Worksheet, projectDetails: ProjectDetails, lastColumn: number) {
  let rowNumber = ws.lastRow.number + 5;

  const addProjectDetailsRow = (firstColumnValue: string, secondColumnValue: string) => {
    const halfOfWidth = Math.floor(lastColumn / 2);

    ws.mergeCells(rowNumber, 0, rowNumber, halfOfWidth);
    ws.mergeCells(rowNumber, halfOfWidth + 1, rowNumber, lastColumn);

    const firstCellAddress = helper.getCellAddress(rowNumber, 1);

    helper.setCell(ws, firstCellAddress, firstColumnValue);

    const secondCellAddress = helper.getCellAddress(rowNumber, halfOfWidth + 1);

    const alignment = helper.getAlignment('right');

    helper.setCell(ws, secondCellAddress, secondColumnValue, CONSTANTS.fontSize.content, false, alignment);
    rowNumber++;
  };

  addProjectDetailsRow(projectDetails.type, projectDetails.number);
  addProjectDetailsRow(projectDetails.location, projectDetails.date);
}

function addReportGroupsVertical(
  ws: Worksheet,
  rowNumber: number,
  groupsColumnNumber: number,
  reportItems: IHasChemicalDetail[],
  tableGroups: ChemicalGroup[]
) {
  const groupLookup = _.groupBy(reportItems, (item) => {
    return item.group;
  });

  tableGroups = _.sortBy(tableGroups, 'sortOrder');

  for (const group of tableGroups) {
    const reportItems = groupLookup[group.code];
    if (!reportItems) continue;
    const numberOfReportItems = reportItems.length;

    const firstCellAddress = helper.getCellAddress(rowNumber, groupsColumnNumber);
    const lastRowNumber = rowNumber + numberOfReportItems - 1;
    const lastCellAddress = helper.getCellAddress(lastRowNumber, groupsColumnNumber);
    rowNumber += numberOfReportItems;

    if (firstCellAddress !== lastCellAddress) {
      ws.mergeCells(`${firstCellAddress}:${lastCellAddress}`);
    }
    const value = group.name;

    helper.setCell(
      ws,
      firstCellAddress,
      value,
      CONSTANTS.fontSize.header,
      false,
      helper.getLeftCenterAlignment(),
      helper.getHairBorderAround()
    );
  }
}

function addReportChemicalsVertical(
  ws: Worksheet,
  rowNumber: number,
  chemicalsColumnNumber: number,
  reportItems: IHasChemicalDetail[],
  sessionParameters: SessionParameters
) {
  for (const item of reportItems) {
    const firstCell = helper.getCellAddress(rowNumber, chemicalsColumnNumber);
    rowNumber++;

    const cellValue = helper.getChemicalTitle(item, sessionParameters);

    helper.setCell(
      ws,
      firstCell,
      cellValue,
      CONSTANTS.fontSize.content,
      false,
      helper.getLeftCenterAlignment(),
      helper.getHairBorderAround()
    );
  }
  return rowNumber;
}

function addReportUnitsVertical(
  ws: Worksheet,
  rowNumber: number,
  unitsColumnNumber: number,
  reportItems: RpdReportItem[]
) {
  for (const item of reportItems) {
    const cellAddress = helper.getCellAddress(rowNumber, unitsColumnNumber);
    rowNumber++;
    helper.setCell(
      ws,
      cellAddress,
      item.units,
      CONSTANTS.fontSize.content,
      false,
      helper.getMiddleCenterAlignment(),
      helper.getHairBorderAround()
    );
  }
}
