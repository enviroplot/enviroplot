import * as _ from 'lodash';

import helper from '../reportHelper';
import * as constants from '../../constants/constants';
import * as literals from '../../constants/literals';
import {Worksheet} from 'exceljs';
import reportHelper from '../reportHelper';

export default {
  generateWasteSpecificSectionsHorizontal,
  generateWasteSpecificSectionsVertical,
  addSummaryStatisticsVertical, //for tests
  addSummaryStatisticsHorizontal, //for tests
  addWcCriteriaHorizontal, //for tests
  addWcCriteriaVertical, //for tests
  addStatColumn, //for tests
  getDisplayOptionsFromExtraField, //for tests
  getValueFromExtraField, //for tests
  addStatRow, //for tests
  addColumnTitle, //for tests
  addRowTitle, //for tests
  addCriteriaColumn, //for tests
  getDisplayValue, //for tests
  addCriteriaRow, //for tests
  addSectionHeader, //for tests
};

function generateWasteSpecificSectionsVertical(
  ws: Worksheet,
  startRowNumber: number,
  lastColumnIndex: number,
  reportItems: ReportItem[],
  sessionParameters: SessionParameters
) {
  const displayOptions = sessionParameters.displayOptions;
  if (displayOptions.showSummaryStatistics || displayOptions.showStatisticalInfoForContaminants) {
    lastColumnIndex = addSummaryStatisticsVertical(ws, startRowNumber, lastColumnIndex, reportItems, displayOptions);
    lastColumnIndex++;
  }

  const criteriaDetailsByChemical: CriteriaDetailsByChemical[] = helper.getCriteriaDetailsByChemical(
    reportItems,
    AssessmentType.Waste
  );

  lastColumnIndex = addWcCriteriaVertical(ws, startRowNumber, lastColumnIndex, reportItems, criteriaDetailsByChemical);
}

function generateWasteSpecificSectionsHorizontal(
  ws: Worksheet,
  lastTableRow: number,
  lastContentColumnIndex: number,
  startColumnIndex: number,
  startContentColumnIndex: number,
  reportItems: ReportItem[],
  sessionParameters: SessionParameters
) {
  const displayOptions = sessionParameters.displayOptions;

  const criteriaDetailsByChemical: CriteriaDetailsByChemical[] = helper.getCriteriaDetailsByChemical(
    reportItems,
    AssessmentType.Waste
  );

  if (displayOptions.showSummaryStatistics || displayOptions.showStatisticalInfoForContaminants) {
    lastTableRow = addSummaryStatisticsHorizontal(
      ws,
      lastTableRow,
      startColumnIndex,
      startContentColumnIndex,
      lastContentColumnIndex,
      reportItems,
      displayOptions
    );
  }

  lastTableRow = addWcCriteriaHorizontal(
    ws,
    lastTableRow,
    startColumnIndex,
    startContentColumnIndex,
    lastContentColumnIndex,
    reportItems,
    criteriaDetailsByChemical
  );

  return lastTableRow;
}

function addSummaryStatisticsVertical(
  ws: Worksheet,
  startRowNumber: number,
  lastColumnIndex: number,
  reportItems: ReportItem[],
  displayOptions: ReportDisplayOptions
) {
  let currentColumnIndex = lastColumnIndex;
  const headerRowNumber = startRowNumber;
  const statisticsHeaderRowNumber = startRowNumber + 1;

  if (displayOptions.showSummaryStatistics) {
    addStatColumn(ws, statisticsHeaderRowNumber, currentColumnIndex, reportItems, literals.min);
    currentColumnIndex++;
    addStatColumn(ws, statisticsHeaderRowNumber, currentColumnIndex, reportItems, literals.max);
    currentColumnIndex++;
    addStatColumn(ws, statisticsHeaderRowNumber, currentColumnIndex, reportItems, literals.mean);
    currentColumnIndex++;
  }
  currentColumnIndex = currentColumnIndex - 1;

  if (displayOptions.showStatisticalInfoForContaminants) {
    currentColumnIndex++;
    addStatColumn(
      ws,
      statisticsHeaderRowNumber,
      currentColumnIndex,
      reportItems,
      'standardDeviation',
      literals.standardDeviation
    );
    currentColumnIndex++;
    addStatColumn(ws, statisticsHeaderRowNumber, currentColumnIndex, reportItems, 'ucl', literals.ucl95);
  }
  addSectionHeader(ws, headerRowNumber, lastColumnIndex, currentColumnIndex, literals.summaryStatistics);
  return currentColumnIndex;
}

function addSummaryStatisticsHorizontal(
  ws: Worksheet,
  lastRowNumber: number,
  startColumnIndex: number,
  startContentColumnIndex: number,
  lastContentColumnIndex: number,
  reportItems: ReportItem[],
  displayOptions: ReportDisplayOptions
) {
  addSectionHeader(ws, lastRowNumber, startColumnIndex, lastContentColumnIndex, literals.summaryStatistics);

  if (displayOptions.showSummaryStatistics) {
    lastRowNumber++;
    addStatRow(ws, lastRowNumber, startColumnIndex, startContentColumnIndex, reportItems, literals.min);
    lastRowNumber++;
    addStatRow(ws, lastRowNumber, startColumnIndex, startContentColumnIndex, reportItems, literals.max);
    lastRowNumber++;
    addStatRow(ws, lastRowNumber, startColumnIndex, startContentColumnIndex, reportItems, literals.mean);
  }

  if (displayOptions.showStatisticalInfoForContaminants) {
    lastRowNumber++;
    addStatRow(
      ws,
      lastRowNumber,
      startColumnIndex,
      startContentColumnIndex,
      reportItems,
      'standardDeviation',
      literals.standardDeviation
    );
    lastRowNumber++;
    addStatRow(ws, lastRowNumber, startColumnIndex, startContentColumnIndex, reportItems, 'ucl', literals.ucl95);
  }

  lastRowNumber++;

  return lastRowNumber;
}

function addWcCriteriaHorizontal(
  ws: Worksheet,
  lastTableRow: number,
  startColumnIndex: number,
  startContentColumnIndex: number,
  lastContentColumnIndex: number,
  reportItems: ReportItem[],
  criteriaDetailsByChemical: CriteriaDetailsByChemical[]
) {
  addSectionHeader(
    ws,
    lastTableRow,
    startColumnIndex,
    lastContentColumnIndex,
    literals.wasteClassificationCriteria,
    'f'
  );

  for (const wcCriterionTitleItem of constants.wcCriteriaTitles) {
    lastTableRow++;
    addCriteriaRow(
      ws,
      lastTableRow,
      startColumnIndex,
      startContentColumnIndex,
      reportItems,
      criteriaDetailsByChemical,
      wcCriterionTitleItem
    );
  }

  lastTableRow++;

  return lastTableRow;
}

function addWcCriteriaVertical(
  ws: Worksheet,
  rowNumber: number,
  startColumnIndex: number,
  reportItems: ReportItem[],
  criteriaDetailsByChemical: CriteriaDetailsByChemical[]
) {
  const lastColumnIndex = startColumnIndex + constants.wcCriteriaTitles.length - 1;
  let currentColumnIndex = startColumnIndex;

  addSectionHeader(ws, rowNumber, startColumnIndex, lastColumnIndex, literals.wasteClassificationCriteria, 'f');

  rowNumber++;

  for (const wcCriterionTitleItem of constants.wcCriteriaTitles) {
    addCriteriaColumn(ws, rowNumber, currentColumnIndex, reportItems, criteriaDetailsByChemical, wcCriterionTitleItem);
    currentColumnIndex++;
  }

  return currentColumnIndex;
}

function addStatColumn(
  ws: Worksheet,
  rowNumber: number,
  lastColumnIndex: number,
  reportItems: ReportItem[],
  key: string,
  title: string = null
) {
  if (!title) title = key;

  addColumnTitle(ws, rowNumber, lastColumnIndex, title);

  let currentRowNumber = rowNumber + 1;

  helper.setHairBorderAroundCellsByColumn(ws, currentRowNumber, lastColumnIndex, lastColumnIndex + 1);

  currentRowNumber++;

  for (const item of reportItems) {
    const value = getValueFromExtraField(item, key);
    const displayOptions = getDisplayOptionsFromExtraField(item, key);

    const cell = helper.setCell(
      ws,
      helper.getCellAddress(currentRowNumber, lastColumnIndex),
      reportHelper.formatNumberIfGreaterThan1000(value),
      constants.fontSize.content,
      false,
      helper.getCenterAlignment(),
      helper.getHairBorderAround()
    );

    if (displayOptions) {
      helper.applyCellDisplayOptions(cell, displayOptions);
    }

    currentRowNumber++;
  }
}

function getDisplayOptionsFromExtraField(reportItem: ReportItem, key: string) {
  const extraFields: any = reportItem.extraFields;
  let result = null;

  if (extraFields[key] && extraFields[key].displayOptions) {
    result = extraFields[key].displayOptions;
  }

  return result;
}

function getValueFromExtraField(reportItem: ReportItem, key: string) {
  const extraFields: any = reportItem.extraFields;
  let result = literals.noValue;

  if (extraFields[key] && extraFields[key].value) {
    result = extraFields[key].value;
  }

  return result;
}

function addStatRow(
  ws: Worksheet,
  rowNumber: number,
  startColumnIndex: number,
  startContentColumnIndex: number,
  reportItems: ReportItem[],
  key: string,
  title: string = null
) {
  if (!title) title = key;

  addRowTitle(ws, rowNumber, startColumnIndex, startContentColumnIndex, title);

  let currentColumnIndex = startContentColumnIndex;

  for (const item of reportItems) {
    const value = getValueFromExtraField(item, key);
    const displayOptions = getDisplayOptionsFromExtraField(item, key);

    const cell = helper.setCell(
      ws,
      helper.getCellAddress(rowNumber, currentColumnIndex),
      reportHelper.formatNumberIfGreaterThan1000(value),
      constants.fontSize.content,
      false,
      helper.getCenterAlignment(),
      helper.getHairBorderAround()
    );

    if (displayOptions) {
      helper.applyCellDisplayOptions(cell, displayOptions);
    }

    currentColumnIndex++;
  }
}

function addColumnTitle(ws: Worksheet, rowNumber: number, columnIndex: number, title: string) {
  const cellAddress = helper.getCellAddress(rowNumber, columnIndex);

  helper.setCell(
    ws,
    cellAddress,
    _.upperFirst(title),
    constants.fontSize.header,
    false,
    helper.getCenterAlignment(),
    helper.getHairBorderAround()
  );
}

function addRowTitle(
  ws: Worksheet,
  rowNumber: number,
  startColumnIndex: number,
  startContentColumnIndex: number,
  title: string
) {
  const firstCell = helper.getCellAddress(rowNumber, startColumnIndex);
  const lastCell = helper.getCellAddress(rowNumber, startContentColumnIndex - 1);

  ws.mergeCells(`${firstCell}:${lastCell}`);

  helper.setCell(
    ws,
    firstCell,
    _.upperFirst(title),
    constants.fontSize.header,
    false,
    helper.getCenterAlignment(),
    helper.getHairBorderAround()
  );
}

function addCriteriaColumn(
  ws: Worksheet,
  rowNumber: number,
  columnIndex: number,
  reportItems: ReportItem[],
  criteriaDetailsByChemical: CriteriaDetailsByChemical[],
  titleItem: KeyLabelItem
) {
  let currentRowNumber = rowNumber;

  addColumnTitle(ws, currentRowNumber, columnIndex, titleItem.label);
  currentRowNumber++;

  helper.setHairBorderAroundCellsByColumn(ws, currentRowNumber, columnIndex, columnIndex + 1);
  currentRowNumber++;

  const criterionCode = titleItem.key;

  for (const item of reportItems) {
    const displayValue = getDisplayValue(item, criteriaDetailsByChemical, criterionCode);

    helper.setCell(
      ws,
      helper.getCellAddress(currentRowNumber, columnIndex),
      displayValue,
      constants.fontSize.content,
      false,
      helper.getCenterAlignment(),
      helper.getHairBorderAround()
    );

    currentRowNumber++;
  }
}

function getDisplayValue(
  item: ReportItem,
  criteriaDetailsByChemical: CriteriaDetailsByChemical[],
  criterionCode: string
) {
  let result: string = ValueAbbreviations.Dash;
  const criterionDetail = helper.getCriterionDetail(criteriaDetailsByChemical, item.code, item.units, criterionCode);
  if (criterionDetail) {
    const formattedDetailValue = reportHelper.formatNumberIfGreaterThan1000(criterionDetail.value);
    result =
      criterionDetail.prefixType === ValuePrefixType.Less
        ? `<${formattedDetailValue.toString()}`
        : formattedDetailValue.toString();
  }

  return result;
}

function addCriteriaRow(
  ws: Worksheet,
  rowNumber: number,
  startColumnIndex: number,
  startContentColumnIndex: number,
  reportItems: ReportItem[],
  criteriaDetailsByChemical: CriteriaDetailsByChemical[],
  titleItem: KeyLabelItem
) {
  addRowTitle(ws, rowNumber, startColumnIndex, startContentColumnIndex, titleItem.label);
  const criterionCode = titleItem.key;
  let startCell = startContentColumnIndex;

  for (const item of reportItems) {
    const displayValue = getDisplayValue(item, criteriaDetailsByChemical, criterionCode);

    helper.setCell(
      ws,
      helper.getCellAddress(rowNumber, startCell),
      displayValue,
      constants.fontSize.content,
      false,
      helper.getCenterAlignment(),
      helper.getHairBorderAround()
    );

    startCell++;
  }
}

function addSectionHeader(
  ws: Worksheet,
  rowNumber: number,
  startColumnIndex: number,
  lastColumnIndex: number,
  title: string,
  note: string = ''
) {
  const firstCell = helper.getCellAddress(rowNumber, startColumnIndex);
  const lastCell = helper.getCellAddress(rowNumber, lastColumnIndex);

  ws.mergeCells(`${firstCell}:${lastCell}`);

  helper.setCell(
    ws,
    firstCell,
    getTitle(title, note),
    constants.fontSize.header,
    false,
    helper.getMiddleCenterAlignment(true),
    helper.getHairBorderAround()
  );
}

function getTitle(text: string, note: string) {
  return {
    richText: [
      {text: text, font: {name: constants.fontName, size: constants.fontSize.header, bold: true}},
      {
        text: `  ${note}`,
        font: {
          vertAlign: 'superscript',
        },
      },
    ],
  };
}
