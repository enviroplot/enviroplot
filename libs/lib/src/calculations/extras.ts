import * as _ from 'lodash';
import * as CONSTANTS from '../constants/constants';

export default {
  highlightDetection,
  getChemicalDataAndValue,
  getSoilDisplayOptions,
  getWasteDisplayOptions,
  getWaterAssessmentDisplayOptions,
  isSoilAssessment,
  isWasteAssessment,
  isWaterAssessment,
  getSortedByUnits,
  shouldShowReport,
  removeHiddenItems,
  filterTbTsRinsateSamples,
  isAsbestosBooleanValue,
  isAsbestosDetected,
};

function highlightDetection(prefix: string, isAsbestos: boolean, value: string | number) {
  let result = false;
  if (!isAsbestos) {
    if (prefix === ValuePrefixType.ExactValue && isNumeric(value)) result = true;
  } else {
    if (isAsbestosDetected(value)) result = true;
  }
  return result;
}

function isNumeric(n: any) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function getChemicalDataAndValue(chemical: Chemical, measurement: ChemicalMeasurement) {
  return {
    chemicalCode: measurement ? measurement.chemical.code : chemical.code,
    chemicalGroupCode: chemical.chemicalGroup,
    resultValue: measurement ? measurement.resultValue : null,
    chemicalCodeForAssessing: chemical.codeForAssessing ? chemical.codeForAssessing : chemical.code,
    units: measurement ? measurement.units : null,
    wcType: measurement && measurement.aslpTclpType ? measurement.aslpTclpType : null,
  };
}

function getWasteDisplayOptions(
  exceededCriteria: {
    [key: string]: ExceededCriterion[];
  },
  isAsbestosDetected: boolean,
  sessionParameters: SessionParameters
): ReportCellDisplayOptions {
  const result: ReportCellDisplayOptions = {backgroundColor: null, textColor: null, isBold: false};

  const isWasteExceeded = isGroupExceeded(AssessmentType.Waste, exceededCriteria, sessionParameters, true);

  if (!isAsbestosDetected && !isWasteExceeded) return null;

  if (isAsbestosDetected) {
    result.backgroundColor = ReportColors.Red;
  } else {
    function exceededCriteriaContains(criterionCodeToFind: string) {
      return exceededCriteria[AssessmentType.Waste].find((item) => item.criterionCode === criterionCodeToFind) || null;
    }

    if (exceededCriteriaContains(WasteCriterionType.CT1)) {
      result.borderColor = ReportColors.LavenderBorder;
    }
    if (exceededCriteriaContains(WasteCriterionType.CT2)) {
      result.borderColor = ReportColors.LightBlueBorder;
    }
    if (exceededCriteriaContains(WasteCriterionType.TCLP1) || exceededCriteriaContains(WasteCriterionType.SCC1)) {
      result.backgroundColor = ReportColors.LavenderBackground;
    }
    if (exceededCriteriaContains(WasteCriterionType.TCLP2) || exceededCriteriaContains(WasteCriterionType.SCC2)) {
      result.backgroundColor = ReportColors.LightBlueBackground;
    }
  }

  return result;
}

function getSoilDisplayOptions(
  exceededCriteria: {
    [key: string]: ExceededCriterion[];
  },
  isAsbestosDetected: boolean,
  sessionParameters: SessionParameters
): ReportCellDisplayOptions {
  const result: ReportCellDisplayOptions = {backgroundColor: null, textColor: null, isBold: false};
  const isExceeded = (group: SoilCriterionTypeName) => isGroupExceeded(group, exceededCriteria, sessionParameters);

  const isHealthExceeded = isExceeded(SoilCriterionTypeName.HIL) || isExceeded(SoilCriterionTypeName.HSL);
  const isEcoExceeded = isExceeded(SoilCriterionTypeName.EIL) || isExceeded(SoilCriterionTypeName.ESL);
  const isMLExceeded = isExceeded(SoilCriterionTypeName.ML);
  const isDCExceeded = isExceeded(SoilCriterionTypeName.DC);
  const isHsl_0_1_Exceeded = isExceeded(SoilCriterionTypeName.HSL_0_1);
  const isEgvExceeded = isExceeded(SoilCriterionTypeName.EGV_INDIR);

  if (
    !isHealthExceeded &&
    !isEcoExceeded &&
    !isMLExceeded &&
    !isDCExceeded &&
    !isAsbestosDetected &&
    !isEgvExceeded &&
    !isHsl_0_1_Exceeded
  )
    return null;

  if (isMLExceeded && (isHealthExceeded || isEcoExceeded)) {
    result.backgroundColor = ReportColors.Red;
  } else if (isHealthExceeded && isEcoExceeded) {
    result.backgroundColor = ReportColors.Orange;
  } else if (isHealthExceeded) {
    result.backgroundColor = ReportColors.Yellow;
  } else if (isEcoExceeded) {
    result.backgroundColor = ReportColors.Green;
  } else if (isAsbestosDetected) {
    result.backgroundColor = ReportColors.Pink;
  } else if (isMLExceeded) {
    result.backgroundColor = ReportColors.Grey;
  }

  if (isDCExceeded) {
    result.isBold = true;
    result.textColor = ReportColors.Blue;
    result.backgroundColor = ReportColors.LightBlue;
  }

  if (isHsl_0_1_Exceeded) {
    result.isBold = true;
    result.borderColor = ReportColors.Blue;
  }

  if (isEgvExceeded) {
    result.isBold = true;
    result.textColor = ReportColors.Red;
  }

  return result;
}

function getWaterAssessmentDisplayOptions(
  exceededCriteria: {
    [key: string]: ExceededCriterion[];
  },
  sessionParameters: SessionParameters,
  gwCriterionDetails: GwCriterionWithColor[]
): ReportCellDisplayOptions {
  const result: ReportCellDisplayOptions = {backgroundColor: null, textColor: null, isBold: false};
  const gwCriteriaTypes = [GwCriterionType.PotentialUse, GwCriterionType.VapourIntrusion, GwCriterionType.WaterQuality];

  let maxCriteriaLimit = 0;

  gwCriteriaTypes.forEach((criteriaType) => {
    if (exceededCriteria[criteriaType] && exceededCriteria[criteriaType].length > 0) {
      exceededCriteria[criteriaType].forEach((criterion) => {
        if (sessionParameters.criteria.includes(criterion.criterionCode)) {
          if (maxCriteriaLimit < criterion.limitValue) {
            maxCriteriaLimit = criterion.limitValue;
            const criterionDetail = gwCriterionDetails.find(
              (criterionDetail: GwCriterionWithColor) => criterionDetail.code === criterion.criterionCode
            );
            result.backgroundColor = criterionDetail.color;
          }
        }
      });
    }
  });

  return result;
}

function isGroupExceeded(
  assessmentType: SoilCriterionTypeName | AssessmentType,
  exceededCriteria: {
    [key: string]: ExceededCriterion[];
  },
  sessionParameters: SessionParameters,
  skipIntersectionCheck: boolean = false
) {
  const criteria = sessionParameters.criteria;

  const exceededCriterionArray = exceededCriteria[assessmentType];

  if (skipIntersectionCheck) return exceededCriterionArray && exceededCriterionArray.length > 0;

  if (!exceededCriterionArray || !criteria || !exceededCriterionArray.length || !criteria.length) return false;

  let intersection = [];

  const x = exceededCriterionArray.map((item: ExceededCriterion) => item.criterionCode);
  intersection = _.intersection(x, criteria);

  return intersection.length > 0;
}

function isSoilAssessment(sessionParameters: SessionParameters) {
  return sessionParameters.projectDetails.assessmentType === AssessmentType.Soil;
}

function isWaterAssessment(sessionParameters: SessionParameters) {
  return sessionParameters.projectDetails.assessmentType === AssessmentType.Water;
}

function isWasteAssessment(sessionParameters: SessionParameters) {
  return sessionParameters.projectDetails.assessmentType === AssessmentType.Waste;
}

function getSortedByUnits(tableData: IHasUnit[], isWaterAssessment: boolean) {
  const reportItemsGroupedByUnits = _.groupBy(tableData, function (item) {
    return item.units;
  });

  const unitsArray = _.keys(reportItemsGroupedByUnits);

  const unitsOrder = isWaterAssessment ? CONSTANTS.UNITS_ORDER_WATER : CONSTANTS.UNITS_ORDER_SOIL_WASTE;

  const knownUnits = unitsArray.filter((value) => unitsOrder.includes(value));
  const unknownUnits = unitsArray.filter((value) => !unitsOrder.includes(value));

  knownUnits.sort(function (a, b) {
    return knownUnits.indexOf(a) - knownUnits.indexOf(b);
  });

  return {units: knownUnits.concat(unknownUnits), reportItems: reportItemsGroupedByUnits};
}

function shouldShowReport(reportItems: IHasQaQcData[], samples: Sample[]): boolean {
  return samples.length > 0 && reportItems.length > 0;
}

function removeHiddenItems(
  reportItems: IHasQaQcData[],
  samples: Sample[],
  selectedGroupsKeys: string[],
  dontRemoveHiddenItems?: boolean
): any[] {
  const filteredItems = reportItems
    .filter((item) => {
      if (dontRemoveHiddenItems === true) {
        return selectedGroupsKeys.includes(item.group);
      } else {
        return selectedGroupsKeys.includes(item.group) && !item.isHiddenInReport;
      }
    })
    .map((tableItem) => {
      const reportCells = (<any>Object).fromEntries(
        Object.entries(tableItem.reportCells).filter(([sampleId, cell]) => {
          const isSelectedSample = samples.some((sample) => sample.labSampleId === sampleId);
          const hasValue = ![
            ValueAbbreviations.NoData.toString(),
            ValueAbbreviations.Dash.toString(),
            ValueAbbreviations.NaN.toString(),
          ].includes(cell.value);
          return isSelectedSample && hasValue;
        })
      );
      return {...tableItem, reportCells};
    })
    .filter(({reportCells}) => Object.keys(reportCells).length > 0);

  return filteredItems;
}

function filterTbTsRinsateSamples(samples: Sample[]) {
  let tbSamples = [];
  let tsSamples = [];
  let rinsateSamples = [];
  let filteredSamples = [];

  tbSamples = samples.filter((sample) => sample.isTripBlank);
  tsSamples = samples.filter((sample) => sample.isTripSpike);
  rinsateSamples = samples.filter((sample) => sample.isRinsate);

  filteredSamples = samples.filter((sample) => !sample.isTripBlank && !sample.isTripSpike && !sample.isRinsate);

  return {tbSamples, tsSamples, rinsateSamples, samplesWithoutTbTsRinsate: filteredSamples};
}

function isAsbestosBooleanValue(chemicalCode: string, assessmentType: AssessmentType) {
  if (assessmentType === AssessmentType.Soil) {
    return CONSTANTS.asbestosCodesSoil.includes(chemicalCode);
  }
  if (assessmentType === AssessmentType.Waste) {
    return CONSTANTS.asbestosCodesWaste.includes(chemicalCode);
  }

  return false;
}

function isAsbestosDetected(value: any) {
  if (!value) return false;
  const normalizedValue = value.toString().normalize('NFKD');
  const isAsbestosNotDetected =
    CONSTANTS.asbestosNotDetected.includes(normalizedValue) || CONSTANTS.emptyValue.includes(normalizedValue);
  return !isAsbestosNotDetected;
}
