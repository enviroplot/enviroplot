import zincCalculator from './zincCalculator';
import chromiumCalculator from './chromiumCalculator';
import copperCalculator from './copperCalculator';
import nickelCalculator from './nickelCalculator';

import extras from './extras';

export default {
  isEilSpecificChemicalCode,
  getEilSpecificCriteriaValue,
};

function isEilSpecificChemicalCode(chemicalCode: any) {
  const specificCodes = [
    EilSpecificChemicalCodes.Zinc,
    EilSpecificChemicalCodes.Chromium,
    EilSpecificChemicalCodes.Nickel,
    EilSpecificChemicalCodes.Copper,
  ];
  return specificCodes.includes(chemicalCode);
}

function getEilSpecificCriteriaValue(
  chemicalMeasurement: ChemicalReportDataAndValue,
  sampleParameters: SampleParameters,
  criteria: Criterion[]
): any {
  const eilCriteriaLimits: IHasCriterionDetailAndValue[] = [];
  const exceededCriteria: any = [];

  for (const criterion of criteria) {
    let criterionValue: number;
    const eilCriterionType: EilCriterionType = extras.getEilCriterionType(criterion.code);
    switch (chemicalMeasurement.chemicalCode) {
      case EilSpecificChemicalCodes.Zinc:
        criterionValue = zincCalculator.getCriterionValueByCriterionCode(eilCriterionType, sampleParameters);
        break;
      case EilSpecificChemicalCodes.Chromium:
        criterionValue = chromiumCalculator.getCriterionValueByCriterionCode(eilCriterionType, sampleParameters);
        break;
      case EilSpecificChemicalCodes.Copper:
        criterionValue = copperCalculator.getCriterionValueByCriterionCode(eilCriterionType, sampleParameters);
        break;
      case EilSpecificChemicalCodes.Nickel:
        criterionValue = nickelCalculator.getCriterionValueByCriterionCode(eilCriterionType, sampleParameters);
        break;
      default:
        break;
    }

    const eilSpecificCriteria: IHasCriterionDetailAndValue = {
      criterionDetail: {chemicalCode: chemicalMeasurement.chemicalCode, criterionCode: criterion.code},
      value: criterionValue,
    };

    eilCriteriaLimits.push(eilSpecificCriteria);
  }
  eilCriteriaLimits.forEach((criterionLimit) => {
    if (chemicalMeasurement.resultValue > criterionLimit.value) {
      const exceededObj: ExceededCriterion = {
        criterionCode: criterionLimit.criterionDetail.criterionCode,
        limitValue: criterionLimit.value,
      };
      exceededCriteria.push(exceededObj);
    }
  });
  return {exceededCriteria, eilCriteriaLimits};
}
