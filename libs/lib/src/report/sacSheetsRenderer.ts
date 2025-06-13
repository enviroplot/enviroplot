import helper from './reportHelper';
import commonSectionsRenderer from './commonSectionsRenderer';
import * as constants from '../constants/constants';
import * as _ from 'lodash';
import utils from './../utils';
import {AddWorksheetOptions, Workbook, Worksheet} from 'exceljs';
import reportHelper from './reportHelper';
const path = utils.loadModule('path');

export default {renderSacSheets};

const workSheetProps: Partial<AddWorksheetOptions> = {
  views: [{state: 'frozen', xSplit: 0, ySplit: 8}],
};

function renderSacSheets(
  wb: Workbook,
  selectedGroupsKeys: string[],
  reportItems: ReportItem[],
  seedData: SoilAssessmentCalculationData,
  samples: Sample[],
  sessionParameters: SessionParameters,
  dataFolderPath: string
) {
  const rowNumber = 8;
  const startColumnIndex = 0;
  const reportChemicalsCellIndex = startColumnIndex + 1;
  const lastTableHeaderRow = rowNumber + 1;

  const getHslSoilAndDepthSamplesCriteria: any[] = [];

  for (const sample of samples) {
    const hslSoilAndDepth = {
      soil: sample.soilType,
      depth: helper.getHslDepthLevelCriterion(sample.depth.to),
    };
    getHslSoilAndDepthSamplesCriteria.push(hslSoilAndDepth);

    const newArray = _.find(
      getHslSoilAndDepthSamplesCriteria,
      (item) => item.soil === sample.soilType && item.depth === helper.getHslDepthLevelCriterion(sample.depth.to)
    );

    if (!newArray) {
      getHslSoilAndDepthSamplesCriteria.push(newArray);
    }
  }

  const hilGroups = _.filter(seedData.criteria, (item) => item.group === 'HEALTH INVESTIGATION LEVELS');
  let hilCriterionCode = null;
  for (const criteria of sessionParameters.criteria) {
    const getCriterionCode = _.find(hilGroups, (item) => criteria === item.code);
    if (getCriterionCode) {
      hilCriterionCode = getCriterionCode.code;
    }
  }

  const hslGroups = _.filter(seedData.criteria, (item) => item.group === 'HEALTH SCREENING LEVELS');
  let hslCriterionCode: string = null;
  for (const criteria of sessionParameters.criteria) {
    const getCriterionCode = _.find(hslGroups, (item) => criteria === item.code);
    if (getCriterionCode) {
      hslCriterionCode = getCriterionCode.code;
    }
  }

  const reportItemsForHslCriterions: any[] = [];
  for (const item of reportItems) {
    const samplesArr: any[] = [];
    const tempReportItem = {
      chemicalGroup: item.group,
      chemicalName: item.chemical,
      chemicalCode: item.code,
      criterionCode: hslCriterionCode,
      hslData: samplesArr,
    };

    for (const soilAndDepthItem of getHslSoilAndDepthSamplesCriteria) {
      const hslValue: any = _.find(
        seedData.hslCriterionDetails,
        (criterion) =>
          criterion.criterionDetail.chemicalCode === item.code &&
          criterion.criterionDetail.criterionCode === hslCriterionCode &&
          criterion.depthLevel === soilAndDepthItem.depth &&
          criterion.soilType === soilAndDepthItem.soil
      );

      if (hslValue) {
        const depthAndValue: any[] = [
          {
            depthLevel: hslValue.depthLevel,
            value: hslValue.value,
          },
        ];

        const new_Obj = {
          soilType: hslValue.soilType,
          depthValuePairs: depthAndValue,
        };

        tempReportItem.hslData.push(new_Obj);
      }
    }

    reportItemsForHslCriterions.push(tempReportItem);
  }

  const title = 'Table: Health Investigation and Screening Levels';
  const sheetName = 'HIL-HSL-HSL DC SAC';

  const ws = wb.addWorksheet(sheetName, workSheetProps);
  ws.views = [...workSheetProps.views, {showGridLines: false}]; //remove all borders

  setColumnsWidths(ws, startColumnIndex, reportChemicalsCellIndex);

  commonSectionsRenderer.addSheetHeader(ws, title);

  const logoPath = path.join(dataFolderPath, constants.logoPath);
  commonSectionsRenderer.addLogo(wb, ws, logoPath);

  const tableGroups = helper.getSelectedGroupsFromSeed(seedData.chemicalGroups, selectedGroupsKeys);

  commonSectionsRenderer.addReportGroupsVertical(ws, lastTableHeaderRow, startColumnIndex, reportItems, tableGroups);

  commonSectionsRenderer.addReportChemicalsVertical(
    ws,
    lastTableHeaderRow,
    reportChemicalsCellIndex,
    reportItems,
    sessionParameters
  );

  const startIndex = reportChemicalsCellIndex + 1;

  if (hilCriterionCode) {
    addHilCriterionTableHeader(ws, hilCriterionCode, rowNumber - 2, startIndex);
    addHilCriterionValue(ws, hilCriterionCode, rowNumber, startIndex, reportItems, seedData);
  }

  const allHslSoilTypesConstant = ['Clay', 'Sand', 'Silt'];
  const allHslDepthLevelsConstant = ['Depth_0_to_1', 'Depth_1_to_2', 'Depth_2_to_4', 'Depth_4_to_unlimited'];

  let startIndexForSoilAddDepth = startIndex + 1;
  const forHslStartIndex = [];
  let hslTableHeaderLength = null;
  for (const soilItem of allHslSoilTypesConstant) {
    for (const depthItem of allHslDepthLevelsConstant) {
      const soilAndDepthCriterionForHeader = _.find(
        getHslSoilAndDepthSamplesCriteria,

        (item) => item.soil === soilItem && item.depth === depthItem
      );
      if (soilAndDepthCriterionForHeader) {
        forHslStartIndex.push(soilAndDepthCriterionForHeader);
        hslTableHeaderLength = forHslStartIndex.length;
        const startIndex = startIndexForSoilAddDepth++;
        const soil = soilAndDepthCriterionForHeader.soil;
        const depth = soilAndDepthCriterionForHeader.depth;

        addHslSoilTypeCriterionHeader(ws, soil, rowNumber - 1, startIndex);
        addDepthTableHeader(ws, depth, rowNumber, startIndex);
        addHslCriterionValue(ws, rowNumber, startIndex, reportItems, soil, depth, reportItemsForHslCriterions);
      }
    }
  }
  if (hslCriterionCode) {
    const lastIndex = startIndex + hslTableHeaderLength;
    addHslCriterionTableHeader(ws, hslCriterionCode, rowNumber - 2, startIndex + 1, lastIndex);
  }
}

function addHilCriterionValue(
  ws: Worksheet,
  hilCriterionCode: string,
  rowNumber: number,
  reportChemicalsCellIndex: number,
  reportItems: ReportItem[],
  seedData: SoilAssessmentCalculationData
) {
  for (const chemical of reportItems) {
    rowNumber++;
    const firstCell = helper.getCellAddress(rowNumber, reportChemicalsCellIndex);
    const hilCriterionDetail = _.find(seedData.hilCriterionDetails, function (detail) {
      return (
        detail.criterionDetail.criterionCode === hilCriterionCode &&
        detail.criterionDetail.chemicalCode === chemical.code
      );
    });

    const cellValue = hilCriterionDetail ? hilCriterionDetail.value : ValueAbbreviations.Dash;

    helper.setCell(
      ws,
      firstCell,
      reportHelper.formatNumberIfGreaterThan1000(cellValue),
      constants.fontSize.content,
      false,
      helper.getLeftCenterAlignment(),
      helper.getHairBorderAround()
    );
  }
}

function addHilCriterionTableHeader(ws: Worksheet, label: string, rowNumber: number, cellIndex: number) {
  helper.setCell(
    ws,
    helper.getCellAddress(rowNumber, cellIndex),
    label,
    constants.fontSize.header,
    true,
    helper.getMiddleCenterAlignment(),
    helper.getHairBorderAround()
  );
}

function addHslCriterionTableHeader(
  ws: Worksheet,
  label: string,
  rowNumber: number,
  cellIndex: number,
  lastIndex: number
) {
  const firstCellAddress = helper.getCellAddress(rowNumber, cellIndex);
  const lastCellAddress = helper.getCellAddress(rowNumber, lastIndex);

  ws.mergeCells(`${firstCellAddress}:${lastCellAddress}`);

  helper.setCell(
    ws,
    helper.getCellAddress(rowNumber, cellIndex),
    label,
    constants.fontSize.header,
    true,
    helper.getMiddleCenterAlignment(),
    helper.getHairBorderAround()
  );
}

function addHslSoilTypeCriterionHeader(ws: Worksheet, label: string, rowNumber: number, cellIndex: number) {
  helper.setCell(
    ws,
    helper.getCellAddress(rowNumber, cellIndex),
    label,
    constants.fontSize.header,
    true,
    helper.getMiddleCenterAlignment(),
    helper.getHairBorderAround()
  );
}

function addDepthTableHeader(ws: Worksheet, label: string, rowNumber: number, cellIndex: number) {
  const depthValueForHeader =
    label === HslDepthLevel.Depth_4_to_unlimited
      ? '>4m'
      : label === HslDepthLevel.Depth_2_to_4
      ? '2m to 4m'
      : label === HslDepthLevel.Depth_1_to_2
      ? '1m to 2m'
      : '0 to <1m';

  helper.setCell(
    ws,
    helper.getCellAddress(rowNumber, cellIndex),
    depthValueForHeader,
    constants.fontSize.header,
    false,
    helper.getMiddleCenterAlignment(),
    helper.getHairBorderAround()
  );
}

function addHslCriterionValue(
  ws: Worksheet,
  rowNumber: number,
  reportChemicalsCellIndex: number,
  reportItems: ReportItem[],
  soil: SoilType,
  depth: HslDepthLevel,
  hslCriteriaData: any
) {
  for (const chemical of reportItems) {
    rowNumber++;
    const firstCell = helper.getCellAddress(rowNumber, reportChemicalsCellIndex);
    let value = ValueAbbreviations.Dash;

    const hslCriterionDetail = _.find(hslCriteriaData, function (item) {
      return item.chemicalCode === chemical.code;
    });

    if (hslCriterionDetail) {
      const dataSoil = _.find(hslCriterionDetail.hslData, function (item2) {
        return item2.soilType === soil;
      });

      if (dataSoil) {
        const dataDepth = _.find(dataSoil.depthValuePairs, function (item3) {
          return item3.depthLevel === depth;
        });

        if (dataDepth) {
          value = dataDepth.value;
        }
      }
    }

    const cellValue = value;

    helper.setCell(
      ws,
      firstCell,
      reportHelper.formatNumberIfGreaterThan1000(cellValue),
      constants.fontSize.content,
      false,
      helper.getLeftCenterAlignment(),
      helper.getHairBorderAround()
    );
  }
}

function setColumnsWidths(ws: Worksheet, startCellIndex: number, reportChemicalsCellIndex: number) {
  helper.setColumnWidth(ws, startCellIndex, 10);
  helper.setColumnWidth(ws, reportChemicalsCellIndex, 25);
}
