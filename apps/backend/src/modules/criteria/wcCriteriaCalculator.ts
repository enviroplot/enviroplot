import * as _ from 'lodash';

export default {getWcResultCriteriaInfo};

function getWcResultCriteriaInfo(
  chemicalReportDataAndValue: ChemicalReportDataAndValue,
  sampleParametersForSample: SampleParameters,
  seedData: WasteClassificationCalculationData
): ResultCriteriaInfo {
  const result: ResultCriteriaInfo = {
    exceededCriteria: {
      // eslint-disable-next-line
      [AssessmentType.Waste]: [],
    },
    criteriaLimits: {},
  };

  if (sampleParametersForSample.state !== State.NSW) return result;

  result.criteriaLimits[AssessmentType.Waste] = seedData.wasteClassificationCriterionDetails.filter(
    (x: WcCriterionDetail) => x.criterionDetail.chemicalCode === chemicalReportDataAndValue.chemicalCodeForAssessing
  );

  if (!result.criteriaLimits) return result;

  if (!chemicalReportDataAndValue.resultValue || !chemicalReportDataAndValue.units) return result;

  const isAslpTclp = chemicalReportDataAndValue.wcType ? true : false;

  const resultValue = chemicalReportDataAndValue.resultValue;

  const CT2Exceedance = validateCriteria(result, WasteCriterionType.CT2, resultValue);
  const CT1Exceedance = validateCriteria(result, WasteCriterionType.CT1, resultValue);
  const SCC2Exceedance = validateCriteria(result, WasteCriterionType.SCC2, resultValue);
  const SCC1Exceedance = validateCriteria(result, WasteCriterionType.SCC1, resultValue);
  const TCLP2Exceedance = validateCriteria(result, WasteCriterionType.TCLP2, resultValue);
  const TCLP1Exceedance = validateCriteria(result, WasteCriterionType.TCLP1, resultValue);

  if (!isAslpTclp) {
    if (CT1Exceedance) {
      if (CT2Exceedance) {
        result.exceededCriteria[AssessmentType.Waste].push(CT2Exceedance);
      } else {
        result.exceededCriteria[AssessmentType.Waste].push(CT1Exceedance);
      }
    }

    if (SCC1Exceedance) {
      if (SCC2Exceedance) {
        result.exceededCriteria[AssessmentType.Waste].push(SCC2Exceedance);
      } else {
        result.exceededCriteria[AssessmentType.Waste].push(SCC1Exceedance);
      }
    }
  } else if (isAslpTclp) {
    if (TCLP2Exceedance) result.exceededCriteria[AssessmentType.Waste].push(TCLP2Exceedance);
    if (TCLP1Exceedance) result.exceededCriteria[AssessmentType.Waste].push(TCLP1Exceedance);
  }

  return result;
}

function validateCriteria(
  resultCriteriaInfo: ResultCriteriaInfo,
  wcCriterionType: WasteCriterionType,
  resultValue: number
): ExceededCriterion | null {
  const criteriaLimits = resultCriteriaInfo.criteriaLimits[AssessmentType.Waste];
  const criterion = criteriaLimits.find((item) => item.criterionDetail.criterionCode === wcCriterionType);

  if (!criterion) return null;

  if (
    (criterion.prefixType === ValuePrefixType.Less && resultValue >= criterion.value) ||
    resultValue > criterion.value
  ) {
    return {
      criterionCode: wcCriterionType,
      limitValue: criterion.value,
    };
  }

  return null;
}
