import summarySoilSheetRenderer from './summarySoilSheetRenderer';
import summarySheetRendererTransposed from './summarySheetRendererTranspose';
import summarySheetRenderer from './summarySheetRenderer';

import {PFASGroupCode} from './../../constants/constants';
import reportHelper from '../reportHelper';
import {Workbook} from 'exceljs';
import * as _ from 'lodash';

export default {
  generateWaterSummarySheet,
  generateWasteSummarySheet,
  generateSoilSummarySheet,
  getSoilExcelTableGroups, //for tests
  removePfasCriteriaIfNotTested, //for tests
  getTableDataByPage, //for tests
};

async function generateWaterSummarySheet(
  wb: Workbook,
  selectedGroupsKeys: string[],
  reportItems: ReportItem[],
  seedData: GwCalculationData,
  sessionParameters: SessionParameters,
  samples: Sample[],
  dataFolderPath: string,
  showDepthColumn: boolean
) {
  let tableData = reportItems.filter((item) => selectedGroupsKeys.includes(item.group) && !item.isHiddenInReport);

  removePfasCriteriaIfNotTested(sessionParameters, reportItems);

  const reportGroups = reportHelper.getSelectedGroupsFromSeed(seedData.chemicalGroups, selectedGroupsKeys);

  const edits = sessionParameters.edits;
  const chemicalsToExtract = sessionParameters.edits
    ? _.filter(Object.keys(edits), (key) => {
        return !edits[key].isSelected;
      })
    : [];

  const extractTableData = (table: any) => {
    return (table = _.filter(table, (item) => {
      const id = `${item.code}#${item.units}`;
      return !chemicalsToExtract.includes(id);
    }));
  };

  tableData = extractTableData(tableData);
  if (sessionParameters.reportOutputFormat === ReportOutputFormat.STANDARD_OUTPUT_FORMAT) {
    await summarySheetRenderer.renderSummarySheet(
      wb,
      seedData,
      dataFolderPath,
      tableData,
      samples,
      reportGroups,
      selectedGroupsKeys,
      null,
      sessionParameters,
      showDepthColumn
    );
  } else {
    const isPhenolsPresent = reportHelper.isPhenolsInReportItems(reportItems);
    await summarySheetRendererTransposed.renderSummarySheetTransposed(
      wb,
      seedData,
      dataFolderPath,
      tableData,
      samples,
      reportGroups,
      selectedGroupsKeys,
      null,
      sessionParameters,
      isPhenolsPresent
    );
  }
}

async function generateWasteSummarySheet(
  wb: Workbook,
  selectedGroupsKeys: any[],
  reportItems: ReportItem[],
  seedData: WasteClassificationCalculationData,
  sessionParameters: SessionParameters,
  samples: Sample[],
  dataFolderPath: string,
  showDepthColumn: boolean
) {
  let tableData = reportItems.filter((item) => selectedGroupsKeys.includes(item.group) && !item.isHiddenInReport);

  let reportGroups: ChemicalGroup[] = [];

  for (const group of seedData.chemicalGroups) {
    if (_.indexOf(selectedGroupsKeys, group.code) === -1) continue;
    reportGroups.push(group);
  }

  const dissolvedChemicalGroups: any[] = [];

  reportGroups.forEach((item) => {
    dissolvedChemicalGroups.push(reportHelper.getDissolvedGroupFromSeedGroup(item));
  });

  reportGroups = reportGroups.concat(dissolvedChemicalGroups);

  const edits = sessionParameters.edits;
  const chemicalsToExtract = sessionParameters.edits
    ? _.filter(Object.keys(edits), (key) => {
        return !edits[key].isSelected;
      })
    : [];

  const extractTableData = (table: any) => {
    return (table = _.filter(table, (item) => {
      const id = `${item.code}#${item.units}`;
      return !chemicalsToExtract.includes(id);
    }));
  };

  tableData = extractTableData(tableData);

  if (sessionParameters.reportOutputFormat === ReportOutputFormat.STANDARD_OUTPUT_FORMAT) {
    await summarySheetRenderer.renderSummarySheet(
      wb,
      seedData,
      dataFolderPath,
      tableData,
      samples,
      reportGroups,
      selectedGroupsKeys,
      null,
      sessionParameters,
      showDepthColumn
    );
  } else {
    const isPhenolsPresent = reportHelper.isPhenolsInReportItems(reportItems);
    await summarySheetRendererTransposed.renderSummarySheetTransposed(
      wb,
      seedData,
      dataFolderPath,
      tableData,
      samples,
      reportGroups,
      selectedGroupsKeys,
      null,
      sessionParameters,
      isPhenolsPresent
    );
  }
}

async function generateSoilSummarySheet(
  wb: Workbook,
  selectedGroupsKeys: string[],
  reportItems: ReportItem[],
  seedData: SoilAssessmentCalculationData,
  sessionParameters: SessionParameters,
  samples: Sample[],
  dataFolderPath: string,
  showDepthColumn: boolean
) {
  const excelTableGroups = getSoilExcelTableGroups(seedData.chemicalGroups, selectedGroupsKeys);

  let table1Data = getTableDataByPage(reportItems, excelTableGroups.table1);
  let table2Data = getTableDataByPage(reportItems, excelTableGroups.table2);
  let table3Data = getTableDataByPage(reportItems, excelTableGroups.table3);

  const edits = sessionParameters.edits;
  const chemicalsToExtract = sessionParameters.edits
    ? _.filter(Object.keys(edits), (key) => {
        return !edits[key].isSelected;
      })
    : [];

  const extractTableData = (table: any) => {
    return (table = _.filter(table, (item) => {
      const id = `${item.code}#${item.units}`;
      return !chemicalsToExtract.includes(id);
    }));
  };

  table1Data = extractTableData(table1Data);
  table2Data = extractTableData(table2Data);
  table3Data = extractTableData(table3Data);

  const getSelectedTableGroupsKeys = (tableGroups: ChemicalGroup[]) => {
    const result: string[] = [];
    for (const tableGroup of tableGroups) {
      if (selectedGroupsKeys.includes(tableGroup.code)) {
        result.push(tableGroup.code);
      }
    }
    return result;
  };

  let selectedTableGroupsKeys = null;

  selectedTableGroupsKeys = getSelectedTableGroupsKeys(excelTableGroups.table1);
  await summarySoilSheetRenderer.renderSoilSummarySheet(
    wb,
    seedData,
    dataFolderPath,
    table1Data,
    samples,
    excelTableGroups.table1,
    selectedTableGroupsKeys,
    1,
    sessionParameters,
    showDepthColumn
  );

  selectedTableGroupsKeys = getSelectedTableGroupsKeys(excelTableGroups.table2);
  await summarySoilSheetRenderer.renderSoilSummarySheet(
    wb,
    seedData,
    dataFolderPath,
    table2Data,
    samples,
    excelTableGroups.table2,
    selectedTableGroupsKeys,
    2,
    sessionParameters,
    showDepthColumn
  );

  selectedTableGroupsKeys = getSelectedTableGroupsKeys(excelTableGroups.table3);
  await summarySoilSheetRenderer.renderSoilSummarySheet(
    wb,
    seedData,
    dataFolderPath,
    table3Data,
    samples,
    excelTableGroups.table3,
    selectedTableGroupsKeys,
    3,
    sessionParameters,
    showDepthColumn
  );
}

function getSoilExcelTableGroups(chemicalGroups: any[], reportGroups: string[]) {
  /* According to doc specs: 
      Table 1: Metals_std, TRH_std, BTEX_std, PAH_std
      Table 2: Phenol_std, OCP_std, OPP_std, PCB_std, ASB_std_AS, ASB_std_Nepm
      Table 3: all other
  */
  const result: any = {
    table1: [],
    table2: [],
    table3: [],
  };

  const dissolvedChemicalGroups: any[] = [];

  chemicalGroups.forEach((item) => {
    dissolvedChemicalGroups.push(reportHelper.getDissolvedGroupFromSeedGroup(item));
  });

  chemicalGroups = chemicalGroups.concat(dissolvedChemicalGroups);

  for (const group of chemicalGroups) {
    if (!reportGroups.includes(group.code)) continue;

    if (group.code) result.table3.push(group);

    switch (group.code) {
      case 'Metals_std':
      case 'TRH_std':
      case 'BTEX_std':
      case 'PAH_std':
        result.table1.push(group);
        break;

      case 'Phenol_std':
      case 'OCP_std':
      case 'OPP_std':
      case 'PCB_std':
      case 'PFAS_std':
      case 'ASB_std_AS':
      case 'ASB_FA/AF':
      case 'Asbestos':
        result.table2.push(group);
        break;

      default:
        break;
    }
  }

  return result;
}

function removePfasCriteriaIfNotTested(sessionParameters: SessionParameters, reportItems: ReportItem[]) {
  const pfasWasTested = reportItems.some((reportItem) => reportItem.group === PFASGroupCode);
  if (!pfasWasTested) {
    sessionParameters.criteria = sessionParameters.criteria.filter(
      (criteria) => criteria !== GwCriterionCode.WQFreshPFAS && criteria !== GwCriterionCode.WQMarinePFAS
    );
  }
}

function getTableDataByPage(reportItems: ReportItem[], pageGroups: ChemicalGroup[]) {
  return reportItems.filter(
    (item) => pageGroups.some((pageGroup) => pageGroup.code === item.group) && !item.isHiddenInReport
  );
}
