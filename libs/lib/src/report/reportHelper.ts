import * as _ from 'lodash';
import {Cell, Worksheet} from 'exceljs';

import * as constants from '../constants/constants';
import extras from '../calculations/extras';

const COLORS = {
  // eslint-disable-next-line
  [ReportColors.Red]: 'FFFF0000',
  // eslint-disable-next-line
  [ReportColors.Grey]: 'FFa9a9a9',
  // eslint-disable-next-line
  [ReportColors.Pink]: 'FFFF69B4',
  // eslint-disable-next-line
  [ReportColors.Green]: 'FF98FB98',
  // eslint-disable-next-line
  [ReportColors.Yellow]: 'FFFFFF00',
  // eslint-disable-next-line
  [ReportColors.Orange]: 'FFFFA500',
  // eslint-disable-next-line
  [ReportColors.DarkGreen]: 'FF00C000',
  // eslint-disable-next-line
  [ReportColors.Blue]: 'FF3629FF',
  // eslint-disable-next-line
  [ReportColors.LightOrange]: 'FFFDE9D9',
  // eslint-disable-next-line
  [ReportColors.MidOrange]: 'FFFCD5B4',
  // eslint-disable-next-line
  [ReportColors.DarkOrange]: 'FFFABF8F',
  // eslint-disable-next-line
  [ReportColors.LightBlue]: 'FFC5D9F1',
  // eslint-disable-next-line
  [ReportColors.DarkBlue]: 'FF8DB4E2',
  // eslint-disable-next-line
  [ReportColors.LightRed]: 'FFF2DCDB',
  // eslint-disable-next-line
  [ReportColors.DarkRed]: 'FFE6B8B7',
  // eslint-disable-next-line
  [ReportColors.Mint]: 'FF92CDDC',
  // eslint-disable-next-line
  [ReportColors.LightGreen]: 'FFD8E4BC',
  // eslint-disable-next-line
  [ReportColors.LightPurple]: 'FFE4DFEC',
  // eslint-disable-next-line
  [ReportColors.DarkPurple]: 'FFCCC0DA',
  // eslint-disable-next-line
  [ReportColors.Maroon]: 'FF800000',
  // eslint-disable-next-line
  [ReportColors.LavenderBackground]: 'E4DFEC',
  // eslint-disable-next-line
  [ReportColors.LightBlueBackground]: 'C5D9F1',
  // eslint-disable-next-line
  [ReportColors.LavenderBorder]: 'CCC0DA',
  // eslint-disable-next-line
  [ReportColors.LightBlueBorder]: '8DB4E2',
};

export default {
  getCellAddress,
  getColumnNumberByWidth,
  getBorderStyle,
  getAlignment,
  getDepth,
  applyCellDisplayOptions,
  getColorValue,
  setCell,
  setRowHeight,
  hideRow,
  setColumnWidth,
  getHairBorderAround,
  getMiddleCenterAlignment,
  getLeftCenterAlignment,
  getCenterAlignment,
  getWaterCriteriaDetailsWithColor,
  getGwCriteriaTitle,
  getSummarySheetTitle,
  setHairBorderAroundCellsByColumn,
  setHairBorderAroundCellsByRow,
  getChemicalTitle,
  getReplicatedSamples,
  getCriteriaDetailsByChemical,
  getCriterionDetail,
  getCriterionValue,
  getSelectedGroupsFromSeed,
  getHslDepthLevelCriterion,
  isPhenolsInReportItems,
  getDissolvedGroupFromSeedGroup,
  formatNumberIfGreaterThan1000,
};

function getSelectedGroupsFromSeed(seedDataChemicalGroups: ChemicalGroup[], selectedGroupsKeys: string[]) {
  let result: ChemicalGroup[] = [];
  for (let i = 0; i < seedDataChemicalGroups.length; i++) {
    const seedGroup = seedDataChemicalGroups[i];
    const dissolvedGroup = getDissolvedGroupFromSeedGroup(seedGroup);
    if (selectedGroupsKeys.includes(seedGroup.code)) {
      result.push(seedGroup);
    }
    if (selectedGroupsKeys.includes(dissolvedGroup.code)) {
      result.push(dissolvedGroup);
    }
  }

  result = _.sortBy(result, 'sortOrder');
  return result;
}

function getColorValue(colorId: ReportColors) {
  return COLORS[colorId];
}

function getAlignment(horizontal = 'left', vertical = 'middle', wrapText = false, textRotation = 0) {
  return {horizontal: horizontal, vertical: vertical, wrapText: wrapText, textRotation: textRotation};
}

function getMiddleCenterAlignment(wraptext?: boolean, textRotation?: number) {
  return getAlignment('center', 'middle', wraptext, textRotation);
}

function getLeftCenterAlignment() {
  return getAlignment('left', 'middle');
}

function getCenterAlignment() {
  return getAlignment('center');
}

function getBorderStyle(type: string, params: string | {[key: string]: boolean}, color?: ReportColors) {
  const argbColor = color ? getColorValue(color) : null;

  if (params === 'all') {
    return {
      top: {style: type, color: {argb: argbColor}},
      left: {style: type, color: {argb: argbColor}},
      bottom: {style: type, color: {argb: argbColor}},
      right: {style: type, color: {argb: argbColor}},
    };
  } else if (_.isObject(params)) {
    const result: any = {};
    const addIfExist = (code: string) => {
      if (params[code]) {
        result[code] = {style: type, color: {argb: argbColor}};
      }
    };
    addIfExist('left');
    addIfExist('right');
    addIfExist('top');
    addIfExist('bottom');
    return result;
  } else {
    throw new Error('Invalid params');
  }
}

function getHairBorderAround() {
  return getBorderStyle('hair', 'all');
}

function getCellAddress(row: number, column: number) {
  const letter = getColumnByIndex(column);
  return `${letter}${row}`;
}

function getColumnByIndex(index: number) {
  index = index + 1;
  for (var ret = '', a = 1, b = 26; (index -= a) >= 0; a = b, b *= 26) {
    ret = String.fromCharCode(parseInt(((index % b) / a).toString()) + 65) + ret;
  }
  return ret;
}

function setCell(
  ws: Worksheet,
  cellAddress: string,
  value: any,
  fontSize: number = constants.fontSize.content,
  isBold = false,
  alignment?: any,
  border?: any,
  bgColor?: string
) {
  const cell = ws.getCell(cellAddress);
  cell.value = value;

  if (alignment) cell.alignment = alignment;

  if (border) cell.border = border;

  if (bgColor)
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: {argb: bgColor},
    };

  cell.font = {name: constants.fontName, size: fontSize, bold: isBold};

  return cell;
}

function setRowHeight(ws: Worksheet, rowNr: number, height: number) {
  const row = ws.getRow(rowNr);
  row.height = height;
  return row;
}

function setColumnWidth(ws: Worksheet, columnIndex: number, width: number) {
  const column = ws.getColumn(getColumnByIndex(columnIndex));
  column.width = width;
  return column;
}

function hideRow(ws: Worksheet, rowNr: number) {
  const row = ws.getRow(rowNr);
  row.hidden = true;
  return row;
}

function applyCellDisplayOptions(cell: Cell, displayOptions: ReportCellDisplayOptions) {
  const {isBold, isItalic, isUnderline, backgroundColor, textColor, borderColor} = displayOptions;

  if (backgroundColor) {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: {argb: getColorValue(backgroundColor)},
    };
  }

  if (isBold) {
    cell.font.bold = true;
  }

  if (isItalic) {
    cell.font.italic = true;
  }

  if (isUnderline) {
    cell.font.underline = true;
  }

  if (textColor) {
    cell.font.color = {argb: getColorValue(textColor)};
  }
  if (borderColor) cell.border = getBorderStyle('thick', 'all', borderColor);
}

function getColumnNumberByWidth(ws: Worksheet, width: number) {
  let totalLength = 0;
  let columnNumber = 0;
  let rationalPart = 0;
  for (const column of ws.columns) {
    const columnWidth = column.width ? column.width : constants.columnWidth.common;

    if (totalLength + columnWidth < width) {
      totalLength += columnWidth;
      columnNumber++;
    } else {
      rationalPart = (width - totalLength) / columnWidth;
      break;
    }
  }
  return Math.ceil(columnNumber + rationalPart);
}

function getDepth(depth: Depth): string {
  if (depth.from === depth.to) {
    return `${depth.from} m`;
  }

  return `${depth.from} - ${depth.to} m`;
}

function getGwCriteriaTitle(criteriaCode: string, stringToFormat: string, sessionParameters: SessionParameters) {
  const waterSessionParameters = sessionParameters.waterAssessmentParameters;
  const lop = waterSessionParameters.levelOfProtection.others;
  const lopPfas = waterSessionParameters.levelOfProtection.pfas;
  const lopBioAccumulative = waterSessionParameters.levelOfProtection.bioAccumulative;
  const waterEnvironment =
    waterSessionParameters.waterEnvironment === GwWaterEnvironment.Both
      ? getWaterEnvironmentFromCriteriaCode(criteriaCode)
      : waterSessionParameters.waterEnvironment;
  const depth = waterSessionParameters.waterDepth;
  const soilType = waterSessionParameters.soilType;

  let result = criteriaCode;
  switch (criteriaCode) {
    case GwCriterionCode.VI_2_4:
    case GwCriterionCode.VI_4_8:
    case GwCriterionCode.VI_8more:
      result = stringToFormat
        .replace(constants.SoilTypeReplacementString, soilType)
        .replace(constants.DepthTypeReplacementString, getDepthString(depth));
      break;
    case GwCriterionCode.WQFresh:
    case GwCriterionCode.WQMarine:
      result = stringToFormat
        .replace(constants.WaterEnvironmentReplacementString, waterEnvironment)
        .replace(constants.LopOthersReplacementString, getSpeciesProtectionLevelString(lop))
        .replace(constants.LopBioAccumulativeReplacementString, getSpeciesProtectionLevelString(lopBioAccumulative));
      break;
    case GwCriterionCode.WQFreshPFAS:
    case GwCriterionCode.WQMarinePFAS:
      result = stringToFormat
        .replace(constants.WaterEnvironmentReplacementString, waterEnvironment)
        .replace(constants.LopPfasReplacementString, getSpeciesProtectionLevelString(lopPfas))
        .replace(constants.LopBioAccumulativeReplacementString, getSpeciesProtectionLevelString(lopBioAccumulative));
      break;
    default:
      result = stringToFormat;
      break;
  }
  return result;
}

function getWaterCriteriaDetailsWithColor(seedData: GwCalculationData): GwCriterionWithColor[] {
  const colors: {code: GwCriterionCode; color: ReportColors}[] = [
    {
      code: GwCriterionCode.VI_2_4,
      color: ReportColors.LightOrange,
    },
    {
      code: GwCriterionCode.VI_4_8,
      color: ReportColors.MidOrange,
    },
    {code: GwCriterionCode.VI_8more, color: ReportColors.DarkOrange},
    {
      code: GwCriterionCode.WQFresh,
      color: ReportColors.LightBlue,
    },
    {
      code: GwCriterionCode.WQMarine,
      color: ReportColors.DarkBlue,
    },
    {
      code: GwCriterionCode.PUHealth,
      color: ReportColors.DarkRed,
    },
    {
      code: GwCriterionCode.PUAesthetic,
      color: ReportColors.LightRed,
    },
    {
      code: GwCriterionCode.PURecreation,
      color: ReportColors.Mint,
    },
    {
      code: GwCriterionCode.PUIrrigationSTV,
      color: ReportColors.LightGreen,
    },
    {
      code: GwCriterionCode.PUIrrigationLTV,
      color: ReportColors.LightGreen,
    },
    {
      code: GwCriterionCode.WQFreshPFAS,
      color: ReportColors.LightPurple,
    },
    {
      code: GwCriterionCode.WQMarinePFAS,
      color: ReportColors.DarkPurple,
    },
  ];

  const result: GwCriterionWithColor[] = [];

  seedData.criteria.forEach((criterion) => {
    result.push(
      Object.assign(
        criterion,
        criterion,
        colors.find((y: {code: GwCriterionCode; color: ReportColors}) => y.code === criterion.code)
      )
    );
  });

  return result;
}

function getSpeciesProtectionLevelString(speciesProtectionLevel: GwSpeciesProtectionLevel): string {
  switch (speciesProtectionLevel) {
    case GwSpeciesProtectionLevel.Level_80:
      return '80%';
    case GwSpeciesProtectionLevel.Level_90:
      return '90%';
    case GwSpeciesProtectionLevel.Level_95:
      return '95%';
    case GwSpeciesProtectionLevel.Level_99:
      return '99%';
    case GwSpeciesProtectionLevel.Level_Unknown:
      return 'Unknown';
    default:
      return '';
  }
}

function getDepthString(depth: GwHslDepthLevel): string {
  switch (depth) {
    case GwHslDepthLevel.Depth_2_to_4:
      return '2-4m';
    case GwHslDepthLevel.Depth_4_to_8:
      return '4-8m';
    case GwHslDepthLevel.Depth_8_to_unlimited:
      return '>8m';
    default:
      return 'no depth';
  }
}

function getWaterEnvironmentFromCriteriaCode(criteriaCode: any): GwWaterEnvironment {
  if (constants.GwWaterEnvironmentFresh.includes(criteriaCode)) return GwWaterEnvironment.Fresh;
  return GwWaterEnvironment.Marine;
}

function getSummarySheetTitle(
  reportItems: ReportItem[],
  tableGroups: ChemicalGroup[],
  selectedTableGroupsKeys: string[],
  tableNumber: number
) {
  const selectedGroupNames: string[] = [];

  const selectedTableGroupsWithoutDissolved = selectedTableGroupsKeys.filter((item) => !item.includes('Dissolved'));

  selectedTableGroupsWithoutDissolved.forEach((key) => {
    const group = tableGroups.find((tableGroup) => tableGroup.code === key);

    // Check if the group's code exists in reportItems' group property
    if (reportItems.some((reportItem) => reportItem.group === group.code)) {
      selectedGroupNames.push(group.name);
    }
  });

  const visibleTableNumber = tableNumber === null ? '' : tableNumber;
  const sheetName = tableNumber === null ? 'Table' : `Table ${visibleTableNumber}`;
  return {
    sheetName: sheetName,
    sheetTitle: `Table ${visibleTableNumber}: Summary of Laboratory Results – ${selectedGroupNames.join(', ')}`,
  };
}
//TODO???
function setHairBorderAroundCellsByColumn(
  ws: Worksheet,
  rowNumber: number,
  columnNumberStart: number,
  columnNumberEnd: number
) {
  for (let index = columnNumberStart; index < columnNumberEnd; index++) {
    const cellName = getCellAddress(rowNumber, index);
    const cell = ws.getCell(cellName);
    cell.border = getHairBorderAround();
  }
}

function setHairBorderAroundCellsByRow(
  ws: Worksheet,
  rowNumberStart: number,
  rowNumberEnd: number,
  columnNumber: number
) {
  for (let index = rowNumberStart; index < rowNumberEnd; index++) {
    const cellName = getCellAddress(index, columnNumber);
    const cell = ws.getCell(cellName);
    cell.border = getHairBorderAround();
  }
}

function getChemicalTitle(reportItem: IHasChemicalDetail, sessionParameters: SessionParameters) {
  const getTitle = (text: string, note: string) => {
    return {
      richText: [
        {text},
        {
          text: `  ${note}`,
          font: {
            vertAlign: 'superscript',
          },
        },
      ],
    };
  };

  let chemicalName = reportItem.chemical;

  if (reportItem.code === constants.DDTDDEDDDChemicalCode && extras.isSoilAssessment(sessionParameters)) {
    return getTitle(chemicalName, 'c');
  }

  if (reportItem.wcType) {
    chemicalName = `${reportItem.wcType.toUpperCase()} ${chemicalName}`;
  }

  if (reportItem.code === constants.naphtaleneCode && extras.isSoilAssessment(sessionParameters)) {
    return getTitle(chemicalName, 'b');
  }

  return chemicalName;
}

function getReplicatedSamples(samples: Sample[]): ReplicatedSamplesPair[] {
  const replicatedSamples: ReplicatedSamplesPair[] = [];

  for (const sample of samples) {
    if (!sample.primarySampleId) continue;

    const primarySample = _.find(samples, (item) => item.labSampleId === sample.primarySampleId);

    if (!primarySample) continue;

    replicatedSamples.push({primary: primarySample, replica: sample});
  }

  return replicatedSamples;
}

function getCriteriaDetailsByChemical(reportItems: ReportItem[], assessmentType: AssessmentType) {
  const result: CriteriaDetailsByChemical[] = [];

  reportItems.forEach((item) => {
    const criteriaByChemicalItem: CriteriaDetailsByChemical = {
      chemicalCode: item.code,
      criteriaDetails: [],
    };
    const keys = Object.keys(item.reportCells);
    keys.forEach((key) => {
      const value = item.reportCells[key];
      if (value && value.criteriaLimits && value.criteriaLimits[assessmentType]) {
        criteriaByChemicalItem.criteriaDetails = value.criteriaLimits[assessmentType];
      }
    });
    const alreadyAddedCriteria = result.find((existing) => existing.chemicalCode === item.code);
    if (!alreadyAddedCriteria) {
      result.push(criteriaByChemicalItem);
    }
  });

  return result;
}

function getCriterionDetail(
  criteriaDetailsByChemical: CriteriaDetailsByChemical[],
  chemicalCode: string,
  units: string,
  criterionCode: string
): IHasCriterionDetailAndValue {
  let result = null;
  const chemicalCriteriaDetailItem = criteriaDetailsByChemical.find((chemicalCriteriaDetail) => {
    return chemicalCriteriaDetail.chemicalCode === chemicalCode;
  });
  if (!chemicalCriteriaDetailItem) return result;
  result = chemicalCriteriaDetailItem.criteriaDetails.find((chemicalCriteriaDetail) => {
    return (
      chemicalCriteriaDetail.criterionDetail.criterionCode === criterionCode && chemicalCriteriaDetail.units === units
    );
  });
  if (!result) return null;
  return result;
}

function getCriterionValue(
  criteriaDetailsByChemical: CriteriaDetailsByChemical[],
  chemicalCode: string,
  units: string,
  criterionCode: string
) {
  let result: number = null;
  const criterionDetail = getCriterionDetail(criteriaDetailsByChemical, chemicalCode, units, criterionCode);
  if (!criterionDetail) return result;
  result = criterionDetail.value;
  return result;
}

function getHslDepthLevelCriterion(depthFrom: number): HslDepthLevel {
  const sampleDepth =
    depthFrom >= 4
      ? HslDepthLevel.Depth_4_to_unlimited
      : depthFrom >= 2
      ? HslDepthLevel.Depth_2_to_4
      : depthFrom >= 1
      ? HslDepthLevel.Depth_1_to_2
      : HslDepthLevel.Depth_0_to_1;
  return sampleDepth;
}

function isPhenolsInReportItems(reportItems: ReportItem[]): boolean {
  return !!_.find(reportItems, (item) => item.group === 'Phenol_std');
}

function getDissolvedGroupFromSeedGroup(group: ChemicalGroup) {
  const result: ChemicalGroup = {...group};

  result.name = `${group.name} - Dissolved`;
  result.dissolved = true;
  result.code = `${group.code}-Dissolved`;
  result.sortOrder = group.sortOrder + 0.5;

  return result;
}

function formatNumberIfGreaterThan1000(value: string | number): any {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'object') {
    return value;
  }

  const numericValue = Number(value);

  if (!isNaN(numericValue) && numericValue > 1000) {
    return numericValue.toLocaleString();
  }

  return value.toString();
}
