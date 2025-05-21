import * as _ from 'lodash';

import * as constants from '../constants/constants';

export default {
  addCriteriaData,
  clearCriteriaData,
  validatePUCriteriaExceedance,
  validateWqCriteriaExceedance,
  validateViCriteriaExceedance,
};

let criteriaCache: {
  PU: {[key: string]: GwPotentialUseCriterionDetail[]};
  WQ: {[key: string]: GwWaterQualityCriterionDetail[]};
  VI: {[key: string]: GwVapourIntrusionCriterionDetail[]};
} = null;

function addCriteriaData(calcData: GwCalculationData) {
  if (criteriaCache) return;

  const getCriteriaCache = (criterionDetails: any[]) => {
    const result: Dictionary<any> = {};

    for (const criterionDetailItem of criterionDetails) {
      const key = getCacheKey(
        criterionDetailItem.criterionDetail.chemicalCode,
        criterionDetailItem.criterionDetail.criterionCode
      );
      if (!result[key]) {
        result[key] = [criterionDetailItem];
      } else {
        result[key].push(criterionDetailItem);
      }
    }

    return result;
  };

  criteriaCache = {
    VI: getCriteriaCache(calcData.vapourIntrusionCriterionDetails),
    PU: getCriteriaCache(calcData.potentialUseCriterionDetails),
    WQ: getCriteriaCache(calcData.waterQualityCriterionDetails),
  };
}

function clearCriteriaData() {
  criteriaCache = null;
}

function validatePUCriteriaExceedance(chemicalMeasurement: ChemicalReportDataAndValue, criteriaSeed: Criterion[]) {
  const exceededCriteria: ExceededCriterion[] = [];
  const puCriteriaLimits: IHasCriterionDetailAndValue[] = [];

  for (const criterion of criteriaSeed) {
    const key = getCacheKey(getActualChemicalCodeForAssessing(chemicalMeasurement), criterion.code);
    const filteredCriteria = criteriaCache[GwCriterionType.PotentialUse][key]
      ? criteriaCache[GwCriterionType.PotentialUse][key]
      : [];

    const puCriterionDetail: GwPotentialUseCriterionDetail = _.find(
      filteredCriteria,
      (x) => x.criterionDetail.criterionCode === criterion.code
    );

    if (puCriterionDetail) {
      puCriteriaLimits.push(puCriterionDetail);

      if (chemicalMeasurement.resultValue > puCriterionDetail.value) {
        const exceededObj: ExceededCriterion = {
          criterionCode: puCriterionDetail.criterionDetail.criterionCode,
          limitValue: puCriterionDetail.value,
        };
        exceededCriteria.push(exceededObj);
      }
    }
  }

  return {exceededCriteria, puCriteriaLimits};
}

function validateWqCriteriaExceedance(
  chemicalReportDataAndValue: ChemicalReportDataAndValue,
  criteriaSeed: Criterion[],
  seedData: GwCalculationData,
  sessionParameters: SessionParameters
) {
  const waterSessionParameters = sessionParameters.waterAssessmentParameters;

  const exceededCriteria: ExceededCriterion[] = [];
  const wqCriteriaLimits: IHasCriterionDetailAndValue[] = [];

  if (waterSessionParameters) {
    const lop = getLop(chemicalReportDataAndValue, waterSessionParameters, seedData);
    for (const criterion of criteriaSeed) {
      if (waterSessionParameters.waterEnvironment === GwWaterEnvironment.Both) {
        validateForWaterEnvironment(
          GwWaterEnvironment.Fresh,
          chemicalReportDataAndValue,
          criterion.code,
          lop,
          exceededCriteria,
          wqCriteriaLimits
        );
        validateForWaterEnvironment(
          GwWaterEnvironment.Marine,
          chemicalReportDataAndValue,
          criterion.code,
          lop,
          exceededCriteria,
          wqCriteriaLimits
        );
      } else
        validateForWaterEnvironment(
          waterSessionParameters.waterEnvironment,
          chemicalReportDataAndValue,
          criterion.code,
          lop,
          exceededCriteria,
          wqCriteriaLimits
        );
    }
  }

  return {exceededCriteria, wqCriteriaLimits};
}

function validateViCriteriaExceedance(
  chemicalMeasurement: ChemicalReportDataAndValue,
  criteriaSeed: Criterion[],
  sessionParameters: SessionParameters
) {
  const waterSessionParameters = sessionParameters.waterAssessmentParameters;

  const exceededCriteria: ExceededCriterion[] = [];
  const viCriteriaLimits: IHasCriterionDetailAndValue[] = [];

  if (waterSessionParameters) {
    for (const criterion of criteriaSeed) {
      const key = getCacheKey(getActualChemicalCodeForAssessing(chemicalMeasurement), criterion.code);
      const filteredCriteria = criteriaCache[GwCriterionType.VapourIntrusion][key]
        ? criteriaCache[GwCriterionType.VapourIntrusion][key]
        : [];

      const viCriterionDetail: GwVapourIntrusionCriterionDetail = _.find(
        filteredCriteria,
        (x) =>
          x.soilType === waterSessionParameters?.soilType &&
          x.hslCode === waterSessionParameters?.vapourIntrusionHsl &&
          x.depthLevel === waterSessionParameters?.waterDepth
      );

      if (viCriterionDetail) {
        viCriteriaLimits.push(viCriterionDetail);

        if (chemicalMeasurement.resultValue > viCriterionDetail.value) {
          const exceededObj: ExceededCriterion = {
            criterionCode: criterion.code,
            limitValue: viCriterionDetail.value,
          };
          exceededCriteria.push(exceededObj);
        }
      }
    }
  }

  return {exceededCriteria, viCriteriaLimits};
}

function getCacheKey(chemicalCode: string, criterionCode: string) {
  return `${chemicalCode}_${criterionCode}`;
}

function getActualChemicalCodeForAssessing(chemicalMeasurement: ChemicalReportDataAndValue) {
  if (chemicalMeasurement.chemicalCodeForAssessing) return chemicalMeasurement.chemicalCodeForAssessing;
  return chemicalMeasurement.chemicalCode;
}

function validateForWaterEnvironment(
  waterEnvironment: GwWaterEnvironment,
  chemicalReportDataAndValue: ChemicalReportDataAndValue,
  criterionCode: string,
  lop: GwSpeciesProtectionLevel,
  exceededCriteria: ExceededCriterion[],
  wqCriteriaLimits: IHasCriterionDetailAndValue[]
) {
  const definedLopCriterionDetail = getWqCriterionDetail(
    waterEnvironment,
    lop,
    chemicalReportDataAndValue,
    criterionCode
  );
  const unknownLopCriterionDetail = getWqCriterionDetail(
    waterEnvironment,
    GwSpeciesProtectionLevel.Level_Unknown,
    chemicalReportDataAndValue,
    criterionCode
  );

  const wqCriterionDetail = definedLopCriterionDetail ? definedLopCriterionDetail : unknownLopCriterionDetail;

  if (wqCriterionDetail) {
    wqCriteriaLimits.push(wqCriterionDetail);

    if (chemicalReportDataAndValue.resultValue > wqCriterionDetail.value) {
      const exceededObj: ExceededCriterion = {
        criterionCode: criterionCode,
        limitValue: wqCriterionDetail.value,
      };
      exceededCriteria.push(exceededObj);
    }
  }
}

function getWqCriterionDetail(
  waterEnvironment: GwWaterEnvironment,
  lop: GwSpeciesProtectionLevel,
  chemicalReportDataAndValue: ChemicalReportDataAndValue,
  criterionCode: string
) {
  const key = getCacheKey(getActualChemicalCodeForAssessing(chemicalReportDataAndValue), criterionCode);
  const filteredCriteria = criteriaCache[GwCriterionType.WaterQuality][key]
    ? criteriaCache[GwCriterionType.WaterQuality][key]
    : [];

  const result: GwWaterQualityCriterionDetail = _.find(
    filteredCriteria,
    (x) => x.waterEnvironment === waterEnvironment && x.speciesProtectionLevel === lop
  );
  return result;
}

function getLop(
  chemicalReportDataAndValue: ChemicalReportDataAndValue,
  waterSessionParameters: GwSessionParameters,
  seedData: GwCalculationData
) {
  if (!waterSessionParameters) return null;

  const chemicalData = seedData.chemicals.find(
    (item: Chemical) => item.code === getActualChemicalCodeForAssessing(chemicalReportDataAndValue)
  );

  if (!chemicalData) return null;

  const isBioaccumulative = chemicalData.isBioaccumulative;
  const isPfas = chemicalReportDataAndValue.chemicalGroupCode === constants.PFASGroupCode;
  let result = waterSessionParameters?.levelOfProtection?.others || null;

  if (isBioaccumulative) {
    result = waterSessionParameters?.levelOfProtection?.bioAccumulative || null;
    if (isPfas) {
      result = waterSessionParameters?.levelOfProtection?.pfas || null;
    }
  }

  return result;
}
