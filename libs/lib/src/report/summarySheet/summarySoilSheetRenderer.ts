import * as _ from 'lodash';
import utils from '../../utils';

import criterionService from '../../domain/criterionService';
import commonSectionsRenderer from '../commonSectionsRenderer';

import helper from '../reportHelper';
import extras from '../../calculations/extras';
import legendRenderer from './legendRenderer';
import * as constants from '../../constants/constants';
import * as literals from '../../constants/literals';
import {AddWorksheetOptions, Workbook, Worksheet} from 'exceljs';
import reportHelper from '../reportHelper';

const workSheetProps: Partial<AddWorksheetOptions> = {
  views: [{state: 'frozen', xSplit: 0, ySplit: 8}],
};

const path = utils.loadModule('path');

export default {
  renderSoilSummarySheet,
  addSamplesRow, //for test only
  addSampleCell, //for test only
  addChemicalCriteria, //for test only
  getCriterionValue,
};

async function renderSoilSummarySheet(
  wb: Workbook,
  seedData: SoilAssessmentCalculationData,
  dataFolderPath: string,
  reportItems: ReportItem[],
  samples: Sample[],
  tableGroups: ChemicalGroup[],
  selectedTableGroupsKeys: string[],
  tableNumber: number,
  sessionParameters: SessionParameters,
  showDepthColumn: boolean
) {
  if (!reportItems || reportItems.length === 0) return;
  const numberOfNestedColumns = 2;
  const groupsRowNumber = 6;
  const chemicalsRowNumber = 7;
  const pqlRowNumber = 8;
  const unitsRowNumber = 9;
  const startColumnIndex = 0;
  const startContentColumnIndex = showDepthColumn ? 3 : 2;

  const titleData = helper.getSummarySheetTitle(reportItems, tableGroups, selectedTableGroupsKeys, tableNumber);

  const ws = wb.addWorksheet(titleData.sheetName, workSheetProps);
  ws.views = [...workSheetProps.views, {showGridLines: false}]; //remove all borders

  commonSectionsRenderer.addSheetHeader(ws, titleData.sheetTitle);

  await commonSectionsRenderer.addReportGroupsHorizontal(
    ws,
    groupsRowNumber,
    startContentColumnIndex,
    reportItems,
    tableGroups,
    numberOfNestedColumns
  );

  await commonSectionsRenderer.addReportPQLHorizontal(
    ws,
    pqlRowNumber,
    startContentColumnIndex,
    reportItems,
    numberOfNestedColumns
  );

  commonSectionsRenderer.addReportUnitsHorizontal(
    ws,
    unitsRowNumber,
    startContentColumnIndex,
    reportItems,
    showDepthColumn,
    numberOfNestedColumns
  );

  await commonSectionsRenderer.addReportChemicalsHorizontal(
    ws,
    chemicalsRowNumber,
    startContentColumnIndex,
    reportItems,
    sessionParameters,
    numberOfNestedColumns
  );

  let {lastTableRow} = await addSamplesRow(ws, reportItems, samples, sessionParameters, showDepthColumn);

  const logoPath = path.join(dataFolderPath, constants.logoPath);
  commonSectionsRenderer.addLogo(wb, ws, logoPath);

  lastTableRow++;

  lastTableRow = legendRenderer.addSoilLegend(ws, lastTableRow, startColumnIndex, startContentColumnIndex);

  lastTableRow++;

  const isPhenolsPresent = helper.isPhenolsInReportItems(reportItems);
  commonSectionsRenderer.addReportFooter(
    ws,
    lastTableRow,
    startColumnIndex,
    seedData,
    sessionParameters,
    isPhenolsPresent
  );
}

async function addSamplesRow(
  ws: Worksheet,
  reportItems: ReportItem[],
  samples: Sample[],
  sessionParameters: SessionParameters,
  showDepthColumn: boolean
) {
  let rowNumber = 10;
  let lastCell = 0;

  const criterionCategories = criterionService.getCriterionCategoriesByCodes(sessionParameters.criteria);
  const hasHealth = criterionCategories.includes(CriterionCategory.Health);
  const hasEcological = criterionCategories.includes(CriterionCategory.Ecological);

  for (const sample of samples) {
    const sampleId = sample.labSampleId;

    let startCell = 0;

    await addSampleCell(ws, rowNumber, startCell, sample.dpSampleId);
    startCell++;

    if (showDepthColumn) {
      await addSampleCell(ws, rowNumber, startCell, helper.getDepth(sample.depth));
      startCell++;
    }
    await addSampleCell(ws, rowNumber, startCell, sample.dateSampled);
    startCell++;

    for (const chemical of reportItems) {
      const chemicalSamples = chemical.reportCells;
      const chemicalData = chemicalSamples[sampleId];

      const firstCell = helper.getCellAddress(rowNumber, startCell);
      let lastCell = helper.getCellAddress(rowNumber, startCell + 1);

      if (
        chemicalData.isAsbestosValue ||
        extras.isWasteAssessment(sessionParameters) ||
        extras.isWaterAssessment(sessionParameters)
      ) {
        lastCell = helper.getCellAddress(rowNumber + 1, startCell + 1);
      }

      ws.mergeCells(`${firstCell}:${lastCell}`);

      await commonSectionsRenderer.addChemicalValue(ws, firstCell, chemicalData, sessionParameters);

      if (!chemicalData.isAsbestosValue && extras.isSoilAssessment(sessionParameters)) {
        await addChemicalCriteria(
          ws,
          rowNumber + 1,
          startCell,
          chemicalData,
          sessionParameters.criteria,
          hasHealth,
          hasEcological
        );
      }

      startCell += 2;
    }

    if (!lastCell) lastCell = startCell - 1;

    rowNumber += 2;
  }

  return {lastTableRow: rowNumber, lastCell};
}

function addSampleCell(ws: Worksheet, rowNumber: number, index: number, value: string) {
  helper.setRowHeight(ws, rowNumber, constants.rowHeight.soilNumberValueRow);

  helper.setRowHeight(ws, rowNumber + 1, constants.rowHeight.soilChemicalValueRow);

  helper.setColumnWidth(ws, index, constants.columnWidth.soilSampleColumnWidth);

  const firstCell = helper.getCellAddress(rowNumber, index);
  const lastCell = helper.getCellAddress(rowNumber + 1, index);

  ws.mergeCells(`${firstCell}:${lastCell}`);

  helper.setCell(
    ws,
    firstCell,
    value,
    constants.fontSize.content,
    false,
    helper.getMiddleCenterAlignment(true),
    helper.getHairBorderAround()
  );
}

function addChemicalCriteria(
  ws: Worksheet,
  rowNumber: number,
  index: number,
  reportCellData: ReportCellWithLimits,
  criteria: string[],
  hasHealth: boolean,
  hasEcological: boolean
) {
  const healthLimit = getCriterionValue(CriterionCategory.Health, hasHealth, reportCellData, criteria);
  const ecoLimit = getCriterionValue(CriterionCategory.Ecological, hasEcological, reportCellData, criteria);

  const healthCellAddress = helper.getCellAddress(rowNumber, index);
  const borderHealth = helper.getBorderStyle('hair', {left: true, bottom: true});
  const healthCell = helper.setCell(
    ws,
    healthCellAddress,
    reportHelper.formatNumberIfGreaterThan1000(healthLimit),
    constants.fontSize.doubleRowContent,
    false,
    helper.getMiddleCenterAlignment(),
    borderHealth
  );
  helper.applyCellDisplayOptions(healthCell, {textColor: ReportColors.Orange});

  const ecologicalCellAddress = helper.getCellAddress(rowNumber, index + 1);
  const borderEco = helper.getBorderStyle('hair', {right: true, bottom: true});
  const ecologicalCell = helper.setCell(
    ws,
    ecologicalCellAddress,
    reportHelper.formatNumberIfGreaterThan1000(ecoLimit),
    constants.fontSize.doubleRowContent,
    false,
    helper.getMiddleCenterAlignment(),
    borderEco
  );
  helper.applyCellDisplayOptions(ecologicalCell, {textColor: ReportColors.DarkGreen});
}

function getCriterionValue(
  category: CriterionCategory,
  hasLimit: boolean,
  reportCellData: ReportCellWithLimits,
  criteria: string[]
): string {
  if (!hasLimit) return literals.dash;

  let value: number = null;
  let result: string = '';
  const criteriaLimits: IHasCriterionDetailAndValue[] = reportCellData.criteriaLimits[category] || [];

  for (const limit of criteriaLimits) {
    if (!criteria.includes(limit.criterionDetail.criterionCode)) continue;
    const valueLimit = limit.value;
    if (!value || value > valueLimit) value = valueLimit;
  }

  if (!value || !reportCellData.value || reportCellData.value === ValueAbbreviations.Dash) {
    result = ValueAbbreviations.Dash;
  } else {
    result = value > 9999999 ? literals.noLimit : value.toString();
  }

  return result;
}
