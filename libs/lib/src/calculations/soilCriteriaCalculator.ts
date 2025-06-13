import * as _ from 'lodash';

import eilSpecificCalculator from './eilSpecific/eilSpecificCalculator';
import helper from './../report/reportHelper';

export default {
  addCriteriaData,
  clearCriteriaData,
  validateHilCriteriaExceedance,
  validateDcCriteriaExceedance,
  validateHslCriteriaExceedance,
  validateEilCriteriaExceedance,
  validateEslCriteriaExceedance,
  validateMlCriteriaExceedance,
  validateHsl_0_1Exceedance,
  validateEgvCriteriaExceedance,
  validateSimpleCriteriaExceedance, //for tests
  validateEslMlCriteriaExceedance, //for tests
  validateHslCriteriaExceedanceForDepth, //for tests
};

let criteriaCache: any = null;

function addCriteriaData(calcData: SoilAssessmentCalculationData) {
  if (criteriaCache) return;

  const getCriteriaCache = (criteria: IHasCriterionDetailAndValue[]) => {
    const result: Dictionary<IHasCriterionDetailAndValue[]> = {};

    for (const criterion of criteria) {
      const key = getCacheKey(criterion.criterionDetail.chemicalCode, criterion.criterionDetail.criterionCode);
      if (!result[key]) {
        result[key] = [criterion];
      } else {
        result[key].push(criterion);
      }
    }

    return result;
  };

  criteriaCache = {
    hil: getCriteriaCache(calcData.hilCriterionDetails),
    dc: getCriteriaCache(calcData.dcCriterionDetails),
    eil: getCriteriaCache(calcData.eilCriterionDetails),
    hsl: getCriteriaCache(calcData.hslCriterionDetails),
    esl: getCriteriaCache(calcData.eslCriterionDetails),
    ml: getCriteriaCache(calcData.mlCriterionDetails),
    egv: getCriteriaCache(calcData.egvCriterionDetails),
  };
}

function clearCriteriaData() {
  criteriaCache = null;
}

function validateHilCriteriaExceedance(chemicalMeasurement: ChemicalReportDataAndValue, criteria: Criterion[]) {
  return validateSimpleCriteriaExceedance('hil', chemicalMeasurement, criteria);
}

function validateEgvCriteriaExceedance(chemicalMeasurement: ChemicalReportDataAndValue, criteria: Criterion[]) {
  return validateSimpleCriteriaExceedance('egv', chemicalMeasurement, criteria);
}

function validateDcCriteriaExceedance(chemicalMeasurement: ChemicalReportDataAndValue, criteria: Criterion[]) {
  return validateSimpleCriteriaExceedance('dc', chemicalMeasurement, criteria);
}

function validateSimpleCriteriaExceedance(
  criteriaType: string,
  chemicalMeasurement: ChemicalReportDataAndValue,
  criteria: Criterion[]
) {
  const exceededCriteria: ExceededCriterion[] = [];
  const hilCriteriaLimits: IHasCriterionDetailAndValue[] = [];

  for (const criterion of criteria) {
    const key = getCacheKey(chemicalMeasurement.chemicalCode, criterion.code);
    const criterionDetail: IHasCriterionDetailAndValue = criteriaCache[criteriaType][key]
      ? criteriaCache[criteriaType][key][0]
      : null;

    if (criterionDetail) {
      hilCriteriaLimits.push(criterionDetail);

      if (chemicalMeasurement.resultValue > criterionDetail.value) {
        const exceededObj: ExceededCriterion = {
          criterionCode: criterionDetail.criterionDetail.criterionCode,
          limitValue: criterionDetail.value,
        };
        exceededCriteria.push(exceededObj);
      }
    }
  }

  return {exceededCriteria, hilCriteriaLimits};
}

function validateEslCriteriaExceedance(
  chemicalMeasurement: ChemicalReportDataAndValue,
  criteria: Criterion[],
  sampleParameters: SampleParameters
) {
  return validateEslMlCriteriaExceedance('esl', chemicalMeasurement, criteria, sampleParameters);
}

function validateMlCriteriaExceedance(
  chemicalMeasurement: ChemicalReportDataAndValue,
  criteria: Criterion[],
  sampleParameters: SampleParameters
) {
  return validateEslMlCriteriaExceedance('ml', chemicalMeasurement, criteria, sampleParameters);
}

function validateEslMlCriteriaExceedance(
  criteriaType: string,
  chemicalMeasurement: ChemicalReportDataAndValue,
  criteria: Criterion[],
  sampleParameters: SampleParameters
) {
  const exceededCriteria: ExceededCriterion[] = [];
  const eslCriteriaLimits: IHasCriterionDetailAndValue[] = [];

  for (const criterion of criteria) {
    const key = getCacheKey(chemicalMeasurement.chemicalCode, criterion.code);
    const filteredCriteria = criteriaCache[criteriaType][key] ? criteriaCache[criteriaType][key] : [];

    const eslCriterionDetail: IHasCriterionDetailAndValue = _.find(
      filteredCriteria,
      (x) => x.soilTexture === sampleParameters.soilTexture
    );

    if (eslCriterionDetail) {
      if (criteriaType === 'esl') {
        eslCriteriaLimits.push(eslCriterionDetail);
      }

      if (chemicalMeasurement.resultValue > eslCriterionDetail.value) {
        const exceededObj: ExceededCriterion = {
          criterionCode: eslCriterionDetail.criterionDetail.criterionCode,
          limitValue: eslCriterionDetail.value,
        };
        exceededCriteria.push(exceededObj);
      }
    }
  }

  return {exceededCriteria, eslCriteriaLimits};
}

function validateEilCriteriaExceedance(
  chemicalMeasurement: ChemicalReportDataAndValue,
  criteria: Criterion[],
  sampleParameters: SampleParameters
) {
  const exceededCriteria: ExceededCriterion[] = [];
  const eilCriteriaLimits: IHasCriterionDetailAndValue[] = [];

  if (eilSpecificCalculator.isEilSpecificChemicalCode(chemicalMeasurement.chemicalCode)) {
    return eilSpecificCalculator.getEilSpecificCriteriaValue(chemicalMeasurement, sampleParameters, criteria);
  }

  for (const criterion of criteria) {
    const key = getCacheKey(chemicalMeasurement.chemicalCode, criterion.code);
    let filteredCriteria = criteriaCache.eil[key] ? criteriaCache.eil[key] : [];

    const pHs = extractSampleParametersValues(filteredCriteria, 'ph');

    if (pHs.length > 0) {
      const ph = findMatchedCriterionValue(pHs, sampleParameters.ph.value);
      filteredCriteria = _.filter(filteredCriteria, {ph});
    }

    const ceCs = extractSampleParametersValues(filteredCriteria, 'cec');
    if (ceCs.length > 0) {
      const cec = findMatchedCriterionValue(ceCs, sampleParameters.cec.value);
      filteredCriteria = _.filter(filteredCriteria, {cec});
    }

    if (filteredCriteria.length > 1) {
      filteredCriteria = _.filter(filteredCriteria, (x) => x.contaminationType === sampleParameters.contaminationType);
    }

    const eilCriterionDetail = filteredCriteria[0];

    if (eilCriterionDetail) {
      eilCriteriaLimits.push(eilCriterionDetail);

      if (chemicalMeasurement.resultValue > eilCriterionDetail.value) {
        const exceededObj: ExceededCriterion = {
          criterionCode: eilCriterionDetail.criterionDetail.criterionCode,
          limitValue: eilCriterionDetail.value,
        };
        exceededCriteria.push(exceededObj);
      }
    }
  }

  return {exceededCriteria, eilCriteriaLimits};
}

function validateHsl_0_1Exceedance(
  chemicalMeasurement: ChemicalReportDataAndValue,
  criteria: Criterion[],
  sampleParameters: SampleParameters
) {
  const exceedances = validateHslCriteriaExceedanceForDepth(
    chemicalMeasurement,
    criteria,
    HslDepthLevel.Depth_0_to_1,
    sampleParameters.soilType
  );

  return exceedances;
}

function validateHslCriteriaExceedance(
  chemicalMeasurement: ChemicalReportDataAndValue,
  criteria: Criterion[],
  sampleParameters: SampleParameters,
  depth: Depth
) {
  const sampleDepth = helper.getHslDepthLevelCriterion(depth.from);
  return validateHslCriteriaExceedanceForDepth(chemicalMeasurement, criteria, sampleDepth, sampleParameters.soilType);
}

function validateHslCriteriaExceedanceForDepth(
  chemicalMeasurement: ChemicalReportDataAndValue,
  criteria: Criterion[],
  depth: HslDepthLevel,
  soilType: SoilType
) {
  const exceededCriteria: ExceededCriterion[] = [];
  const hslCriteriaLimits: IHasCriterionDetailAndValue[] = [];

  for (const criterion of criteria) {
    const key = getCacheKey(chemicalMeasurement.chemicalCode, criterion.code);
    const filteredCriteria = criteriaCache.hsl[key] ? criteriaCache.hsl[key] : [];

    const searchCriteria = {
      soilType: soilType,
      depthLevel: depth,
    };

    const hslCriterionDetail: any = _.find(filteredCriteria, {
      ...searchCriteria,
    });

    if (hslCriterionDetail) {
      hslCriteriaLimits.push(hslCriterionDetail);

      if (chemicalMeasurement.resultValue > hslCriterionDetail.value) {
        const exceededObj: ExceededCriterion = {
          criterionCode: hslCriterionDetail.criterionDetail.criterionCode,
          limitValue: hslCriterionDetail.value,
        };
        exceededCriteria.push(exceededObj);
      }
    }
  }

  return {exceededCriteria, hslCriteriaLimits};
}

function extractSampleParametersValues(criteriaArray: any, criterionKey: string) {
  const criteria = [];
  for (const cr of criteriaArray) {
    criteria.push(cr[criterionKey]);
  }
  return _.uniq(_.compact(criteria)).sort((a, b) => a - b);
}

function findMatchedCriterionValue(criterionValues: number[], sampleValue: number) {
  let value = 0;
  for (const c of criterionValues) {
    if (Number(sampleValue) >= c) {
      value = c;
    } else break;
  }
  return value;
}

function getCacheKey(chemicalCode: string, criterionCode: string) {
  return `${chemicalCode}_${criterionCode}`;
}
