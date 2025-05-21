import * as _ from 'lodash';

import {UNITS as U} from '../constants/constants';

export default {
  convertMeasurementValue,
  convertReportItem,
  isUnitsConvertible,
  convertToDefaultUnifiedUnits: toDefaultUnitDesignation,
};

type UnitsValue = {
  value: number;
  units: string;
};

function convertMeasurementValue(
  measurement: ChemicalMeasurement,
  toUnits: string,
  assessmentType: AssessmentType
): ChemicalMeasurement {
  const {units, resultValue, pqlValue} = measurement;
  const updMeasurement = {...measurement};

  const defaultUnits = toDefaultUnitDesignation(units);
  let criterionUnits = toUnits ? toUnits : toDefaultCriterionUnits(toUnits, assessmentType);

  // choose the converting method
  let convertFn: (value: number, fromUnit: string) => UnitsValue = converter.default;

  if (!isUnitsConvertible(defaultUnits, criterionUnits)) {
    criterionUnits = getCompatibleUnitsToConvertToByDefault(defaultUnits);
  }

  if (U.MG_KG.includes(criterionUnits)) convertFn = converter.toMgKg;
  if (U.UG_KG.includes(criterionUnits)) convertFn = converter.toUgKg;
  if (U.PERCENT.includes(criterionUnits)) convertFn = converter.toPercent;
  if (U.MG_L.includes(criterionUnits)) convertFn = converter.toMgL;
  if (U.UG_L.includes(criterionUnits)) convertFn = converter.toUgL;
  if (U.CMOL_KG.includes(criterionUnits)) convertFn = converter.toCmolKg;

  // convert 'resultValue' and 'pqlValue' lab values
  if (typeof resultValue === 'number' || resultValue === null) {
    const res = convertFn(resultValue, defaultUnits);

    if (resultValue !== null) {
      updMeasurement.resultValue = res.value;
    }

    updMeasurement.units = res.units;
  }
  if (typeof pqlValue === 'number') {
    const res = convertFn(pqlValue, defaultUnits);
    updMeasurement.pqlValue = res.value;
  }

  return updMeasurement;
}

function convertReportItem(reportItem: ReportItem, toUnits: string): ReportItem {
  const {pqlValue} = reportItem;
  const updReportItem = {...reportItem};
  const fromUnits: string = reportItem.units;

  let convertFn: (value: number, fromUnit: string) => UnitsValue = converter.default;

  switch (toUnits) {
    case U.MG_L[0]:
      convertFn = converter.toMgL;
      break;
    case U.UG_L[0]:
      convertFn = converter.toUgL;
      break;
    default:
      break;
  }

  // convert 'resultValue' and 'pqlValue' lab values
  Object.values(updReportItem.reportCells).forEach((cell) => {
    if (typeof cell.value === 'number' || cell.value === null) {
      const res = convertFn(+cell.value, fromUnits);

      if (cell.value !== null) {
        cell.value = res.value.toString();
      }

      updReportItem.units = res.units;
    }
  });

  if (typeof pqlValue === 'number') {
    const res = convertFn(pqlValue, fromUnits);
    updReportItem.pqlValue = res.value;
  }

  return updReportItem;
}

// TODO: to be extended to process all possible cases
function isUnitsConvertible(fromUnits: string, toUnits: string): boolean {
  const compatibles = {
    toKg: [...U.MG_KG, ...U.UG_KG, ...U.PERCENT, ...U.PPM],
    toL: [...U.MG_L, ...U.UG_L],
    toCmol: [...U.MEQ_100G, ...U.CMOL_KG],
  };

  if (fromUnits === toUnits) return true;

  for (const groupUnits of Object.values(compatibles)) {
    if (groupUnits.includes(fromUnits) && groupUnits.includes(toUnits)) {
      return true;
    }
  }

  return false;
}

// TODO: to be extended to process all possible cases
function getCompatibleUnitsToConvertToByDefault(fromUnits: string): string {
  let toUnits = fromUnits;

  if (U.UG_KG.includes(fromUnits)) toUnits = U.MG_KG[0];
  if (U.PERCENT.includes(fromUnits)) toUnits = U.MG_KG[0];
  if (U.PPM.includes(fromUnits)) toUnits = U.MG_KG[0];

  if (U.UG_L.includes(fromUnits)) toUnits = U.MG_L[0];

  if (U.MEQ_100G.includes(fromUnits)) toUnits = U.CMOL_KG[0];

  return toUnits;
}

// This method converts units according to 'Table 3: Unit Conversion Calculations' of Units Conversion BRD document
const converter = {
  toMgKg: (value: number, fromUnit: string): UnitsValue => {
    if (U.UG_KG.includes(fromUnit)) {
      return {value: value / 1000, units: U.MG_KG[0]};
    }

    if (U.PERCENT.includes(fromUnit)) {
      return {value: value * 10000, units: U.MG_KG[0]};
    }

    if (U.PPM.includes(fromUnit)) {
      return {value, units: U.MG_KG[0]};
    }

    return {value, units: fromUnit};
  },

  toUgKg: (value: number, fromUnit: string): UnitsValue => {
    if (U.MG_KG.includes(fromUnit)) {
      return {value: value * 1000, units: U.UG_KG[0]};
    }

    return {value, units: fromUnit};
  },

  toPercent: (value: number, fromUnit: string): UnitsValue => {
    if (U.MG_KG.includes(fromUnit)) {
      return {value: value / 10000, units: U.PERCENT[0]};
    }

    return {value, units: fromUnit};
  },

  toMgL: (value: number, fromUnit: string): UnitsValue => {
    if (U.UG_L.includes(fromUnit)) {
      return {value: value / 1000, units: U.MG_L[0]};
    }

    return {value, units: fromUnit};
  },

  toUgL: (value: number, fromUnit: string): UnitsValue => {
    if (U.MG_L.includes(fromUnit)) {
      return {value: value * 1000, units: U.UG_L[0]};
    }

    return {value, units: fromUnit};
  },

  toCmolKg: (value: number, fromUnit: string): UnitsValue => {
    if (U.MEQ_100G.includes(fromUnit)) {
      return {value, units: U.CMOL_KG[0]};
    }

    return {value, units: fromUnit};
  },

  default: (value: number, fromUnit: string): UnitsValue => {
    return {value, units: fromUnit};
  },
};

export function toDefaultUnitDesignation(inboundUnit: string): string {
  const lowerCaseInboundUnit = _.toLower(inboundUnit);
  let defaultUnit = inboundUnit;

  if (_.includes(U.MG_KG, lowerCaseInboundUnit)) defaultUnit = U.MG_KG[0];
  if (_.includes(U.NG_KG, lowerCaseInboundUnit)) defaultUnit = U.NG_KG[0];
  if (_.includes(U.UG_KG, lowerCaseInboundUnit)) defaultUnit = U.UG_KG[0];
  if (_.includes(U.MG_L, lowerCaseInboundUnit)) defaultUnit = U.MG_L[0];
  if (_.includes(U.NG_L, lowerCaseInboundUnit)) defaultUnit = U.NG_L[0];
  if (_.includes(U.UG_L, lowerCaseInboundUnit)) defaultUnit = U.UG_L[0];
  if (_.includes(U.CMOL_KG, lowerCaseInboundUnit)) defaultUnit = U.CMOL_KG[0];
  if (_.includes(U.MEQ_100G, lowerCaseInboundUnit)) defaultUnit = U.MEQ_100G[0];
  if (_.includes(U.PERCENT, lowerCaseInboundUnit)) defaultUnit = U.PERCENT[0];
  if (_.includes(U.PPM, lowerCaseInboundUnit)) defaultUnit = U.PPM[0];
  if (_.includes(U.PPB, lowerCaseInboundUnit)) defaultUnit = U.PPB[0];
  if (_.includes(U.PH_UNITS, lowerCaseInboundUnit)) defaultUnit = U.PH_UNITS[0];

  return defaultUnit;
}

function toDefaultCriterionUnits(inboundCriterionUnit: string, assessmentType: AssessmentType): string {
  let defaultUnit = inboundCriterionUnit;

  switch (assessmentType) {
    case AssessmentType.Soil:
    case AssessmentType.Waste:
      defaultUnit = U.MG_KG[0];
      break;

    case AssessmentType.Water:
      defaultUnit = U.UG_L[0];
      break;

    default:
      break;
  }

  return defaultUnit;
}
