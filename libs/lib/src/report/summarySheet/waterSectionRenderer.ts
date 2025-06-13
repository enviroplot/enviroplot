import * as _ from 'lodash';

import helper from '../reportHelper';
import gwCriteriaCalculator from '../../calculations/gwCriteriaCalculator';

import * as constants from '../../constants/constants';
import {Worksheet} from 'exceljs';
import reportHelper from '../reportHelper';

export default {
  generateWaterSpecificSectionsRegular,
  generateWaterSpecificSectionsTranspose,
  addGwCriteriaHorizontal, //for tests
  addGwCriteriaVertical, //for tests
  addCriteriaRow, //for tests
  addCriteriaColumn, //for tests
  addCriteriaCell, //for tests
  addRowTitle, //for tests
  getUnknownLop, //for tests
};

function generateWaterSpecificSectionsRegular(
  ws: Worksheet,
  lastTableRow: number,
  startColumnIndex: number,
  startContentColumnIndex: number,
  sessionParameters: SessionParameters,
  reportItems: ReportItem[],
  seedData: GwCalculationData
) {
  const selectedCriteria = sessionParameters.criteria;

  const gwCriteria = helper.getWaterCriteriaDetailsWithColor(seedData);

  gwCriteriaCalculator.addCriteriaData(seedData);

  const bioaccumulativeChemicals: Chemical[] = seedData.chemicals.filter(
    (chemical) => chemical.isBioaccumulative === true
  );

  const criteriaByChemical: CriteriaDetailsByChemical[] = helper.getCriteriaDetailsByChemical(
    reportItems,
    AssessmentType.Water
  );

  return addGwCriteriaHorizontal(
    ws,
    lastTableRow,
    startColumnIndex,
    startContentColumnIndex,
    reportItems,
    selectedCriteria,
    criteriaByChemical,
    gwCriteria,
    bioaccumulativeChemicals,
    sessionParameters
  );
}

function generateWaterSpecificSectionsTranspose(
  ws: Worksheet,
  startRowNumber: number,
  startContentRowNumber: number,
  startColumnIndex: number,
  sessionParameters: SessionParameters,
  reportItems: ReportItem[],
  seedData: GwCalculationData
) {
  const gwCriteria = helper.getWaterCriteriaDetailsWithColor(seedData);

  gwCriteriaCalculator.addCriteriaData(seedData);

  const bioaccumulativeChemicals: Chemical[] = seedData.chemicals.filter(
    (chemical) => chemical.isBioaccumulative === true
  );

  const criteriaByChemical: CriteriaDetailsByChemical[] = helper.getCriteriaDetailsByChemical(
    reportItems,
    AssessmentType.Water
  );

  return addGwCriteriaVertical(
    ws,
    startRowNumber,
    startContentRowNumber,
    startColumnIndex,
    reportItems,
    sessionParameters.criteria,
    criteriaByChemical,
    gwCriteria,
    bioaccumulativeChemicals,
    sessionParameters
  );
}

function addGwCriteriaHorizontal(
  ws: Worksheet,
  lastTableRow: number,
  startColumnIndex: number,
  startContentColumnIndex: number,
  reportItems: ReportItem[],
  selectedCriteria: string[],
  chemicalCriteriaDetails: CriteriaDetailsByChemical[],
  gwCriteria: any[],
  bioaccumulativeChemicals: Chemical[],
  sessionParameters: SessionParameters
) {
  lastTableRow++;

  for (const code of selectedCriteria) {
    const criteria = _.find(gwCriteria, ['code', code]);

    const title = helper.getGwCriteriaTitle(code, criteria.name, sessionParameters);
    const isWQCriteria = criteria.group === GwCriterionType.WaterQuality;

    addCriteriaRow(
      ws,
      lastTableRow,
      startColumnIndex,
      startContentColumnIndex,
      chemicalCriteriaDetails,
      reportItems,
      bioaccumulativeChemicals,
      criteria.code,
      title,
      criteria.color,
      isWQCriteria
    );
    lastTableRow++;
  }

  lastTableRow++;

  return lastTableRow;
}

function addGwCriteriaVertical(
  ws: Worksheet,
  startRowNumber: number,
  startContentRowNumber: number,
  columnIndex: number,
  reportItems: ReportItem[],
  selectedCriteria: string[],
  chemicalCriteriaDetails: CriteriaDetailsByChemical[],
  gwCriteria: any[],
  bioaccumulativeChemicals: Chemical[],
  sessionParameters: SessionParameters
) {
  let lastColumnIndex = columnIndex;
  for (const code of selectedCriteria) {
    const criteria = _.find(gwCriteria, ['code', code]);

    if (!criteria) continue;

    const title = helper.getGwCriteriaTitle(code, criteria.name, sessionParameters);

    const isWQCriteria = criteria.group === GwCriterionType.WaterQuality;

    addCriteriaColumn(
      ws,
      startRowNumber,
      startContentRowNumber,
      lastColumnIndex,
      chemicalCriteriaDetails,
      reportItems,
      bioaccumulativeChemicals,
      criteria.code,
      title,
      criteria.color,
      isWQCriteria
    );
    lastColumnIndex++;
  }

  return lastColumnIndex;
}

function addCriteriaRow(
  ws: Worksheet,
  rowNumber: number,
  startColumnIndex: number,
  startContentColumnIndex: number,
  criteriaDetailsByChemical: CriteriaDetailsByChemical[],
  reportItems: ReportItem[],
  bioaccumulativeChemicals: Chemical[],
  criterionCode: string,
  title: string = null,
  color: ReportColors,
  isWQCriteria: boolean
) {
  if (!title) title = criterionCode;
  addRowTitle(ws, rowNumber, startColumnIndex, startContentColumnIndex, title, color);

  let currentColumnIndex = startContentColumnIndex;

  for (const reportItem of reportItems) {
    const value = helper.getCriterionValue(criteriaDetailsByChemical, reportItem.code, reportItem.units, criterionCode);

    const hasUnknownLop: boolean = getUnknownLop(
      criteriaDetailsByChemical,
      reportItem.code,
      reportItem.units,
      criterionCode
    );

    const isBioaccumulativeForWQ: boolean = getBioaccumulativeForWQCriteria(
      isWQCriteria,
      bioaccumulativeChemicals,
      reportItem.code
    );

    const displayOptions: ReportCellDisplayOptions = {
      backgroundColor: color,
    };

    if (hasUnknownLop) {
      displayOptions.isUnderline = true;
    }

    if (isBioaccumulativeForWQ) {
      displayOptions.isBold = true;
    }

    const criteriaCellAddress = helper.getCellAddress(rowNumber, currentColumnIndex);

    addCriteriaCell(ws, criteriaCellAddress, value, displayOptions);

    currentColumnIndex++;
  }
}

function addCriteriaColumn(
  ws: Worksheet,
  startRowNumber: number,
  startContentRowNumber: number,
  columnIndex: number,
  criteriaDetailsByChemical: CriteriaDetailsByChemical[],
  reportItems: ReportItem[],
  bioaccumulativeChemicals: Chemical[],
  criterionCode: string,
  title: string = null,
  color: ReportColors,
  isWQCriteria: boolean
) {
  if (!title) title = criterionCode;
  addColumnTitle(ws, startRowNumber, startContentRowNumber, columnIndex, title, color);

  let currentRowNumber = startContentRowNumber;

  for (const reportItem of reportItems) {
    const value: number = helper.getCriterionValue(
      criteriaDetailsByChemical,
      reportItem.code,
      reportItem.units,
      criterionCode
    );

    const hasUnknownLop: boolean = getUnknownLop(
      criteriaDetailsByChemical,
      reportItem.code,
      reportItem.units,
      criterionCode
    );

    const isBioaccumulativeForWQ: boolean = getBioaccumulativeForWQCriteria(
      isWQCriteria,
      bioaccumulativeChemicals,
      criterionCode
    );

    const displayOptions: ReportCellDisplayOptions = {
      backgroundColor: color,
    };

    if (hasUnknownLop) {
      displayOptions.isUnderline = true;
    }

    if (isBioaccumulativeForWQ) {
      displayOptions.isBold = true;
    }

    const cellAddress = helper.getCellAddress(currentRowNumber, columnIndex);

    addCriteriaCell(ws, cellAddress, value, displayOptions);
    currentRowNumber++;
  }
}

function addCriteriaCell(
  ws: Worksheet,
  cellAddress: string,
  value: number,
  displayOptions: ReportCellDisplayOptions = null
) {
  let valueString = '';
  if (value) {
    valueString = reportHelper.formatNumberIfGreaterThan1000(value).toString();
    if (value >= constants.unlimitedDecimalCriterion) {
      valueString = constants.unlimitedAbbreviation;
    }
  }
  const cell = helper.setCell(
    ws,
    cellAddress,
    valueString,
    constants.fontSize.content,
    false,
    helper.getCenterAlignment(),
    helper.getHairBorderAround()
  );

  if (displayOptions) {
    helper.applyCellDisplayOptions(cell, displayOptions);
  }
}

function addRowTitle(
  ws: Worksheet,
  rowNumber: number,
  startColumnIndex: number,
  startContentColumnIndex: number,
  title: string,
  backgroundColour: ReportColors
) {
  const firstCellAddress = helper.getCellAddress(rowNumber, startColumnIndex);
  const lastCellAddress = helper.getCellAddress(rowNumber, startContentColumnIndex - 1);

  ws.mergeCells(`${firstCellAddress}:${lastCellAddress}`);
  const alignment = helper.getAlignment('left', 'center', false);

  const cell = helper.setCell(
    ws,
    firstCellAddress,
    _.upperFirst(title),
    constants.fontSize.header,
    false,
    alignment,
    helper.getHairBorderAround()
  );

  const displayOption: ReportCellDisplayOptions = {backgroundColor: backgroundColour};
  helper.applyCellDisplayOptions(cell, displayOption);
}

function addColumnTitle(
  ws: Worksheet,
  startRowNumber: number,
  startContentRowNumber: number,
  columnIndex: number,
  title: string,
  backgroundColour: ReportColors
) {
  const firstCellAddress = helper.getCellAddress(startRowNumber, columnIndex);
  const lastCellAddress = helper.getCellAddress(startContentRowNumber - 1, columnIndex);

  ws.mergeCells(`${firstCellAddress}:${lastCellAddress}`);
  const alignment = helper.getMiddleCenterAlignment(true);

  const cell = helper.setCell(
    ws,
    firstCellAddress,
    _.upperFirst(title),
    constants.fontSize.header,
    false,
    alignment,
    helper.getHairBorderAround()
  );

  const displayOption: ReportCellDisplayOptions = {backgroundColor: backgroundColour};
  helper.applyCellDisplayOptions(cell, displayOption);
}

function getUnknownLop(
  criteriaDetailsByChemical: CriteriaDetailsByChemical[],
  chemicalCode: string,
  units: string,
  criterionCode: string
): boolean {
  const criterionDetail = helper.getCriterionDetail(
    criteriaDetailsByChemical,
    chemicalCode,
    units,
    criterionCode
  ) as GwWaterQualityCriterionDetail;
  if (
    !criterionDetail ||
    !criterionDetail.speciesProtectionLevel ||
    criterionDetail.speciesProtectionLevel !== GwSpeciesProtectionLevel.Level_Unknown
  )
    return false;
  return true;
}

function getBioaccumulativeForWQCriteria(
  isWQCriteria: boolean,
  bioaccumulativeChemicals: Chemical[],
  chemicalCode: string
): boolean {
  const isBioaccumulative = bioaccumulativeChemicals.filter((chemical) => chemical.code === chemicalCode).length > 0;
  if (isBioaccumulative && isWQCriteria) return true;
  return false;
}
