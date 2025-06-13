import * as _ from 'lodash';

import extras from './extras';

export default {
  getCriterionValueByCriterionCode,
};

function getCriterionValueByCriterionCode(criteriaCode: EilCriterionType, sampleParameters: SampleParameters) {
  let resultValue = 0;

  const lookupValue = getFormulasLookupValue(criteriaCode, sampleParameters.contaminationType);

  const firstValue = formula1(sampleParameters.cec.value, lookupValue);
  const secondValue = formula2(sampleParameters.ph.value, lookupValue);
  const thirdValue = formula3(sampleParameters.ph.value, sampleParameters.cec.value, lookupValue);

  const lowestValue = _.min([_.min([firstValue, secondValue]), thirdValue]);

  if (sampleParameters.mbc) {
    resultValue = lowestValue + sampleParameters.mbc;
    return extras.roundCalculationValue(resultValue);
  }

  if (!extras.checkIronContentIsSpecified(sampleParameters)) throw new Error('Please specify Iron');

  if (sampleParameters.contaminationType === ContaminationType.Fresh) {
    resultValue = lowestValue + formulaForABC(sampleParameters.ironContent.value);
    return extras.roundCalculationValue(resultValue);
  }

  resultValue = lowestValue + getABCForContaminationTypeAged(sampleParameters.trafficVolume, sampleParameters.state);

  return extras.roundCalculationValue(resultValue);
}

function getFormulasLookupValue(criterionCode: EilCriterionType, contaminationType: ContaminationType) {
  switch (contaminationType) {
    case ContaminationType.Fresh:
      switch (criterionCode) {
        case EilCriterionType.AES:
          return 39.47;
        case EilCriterionType.UR_or_POS:
          return 154.99;
        case EilCriterionType.C_or_Ind:
          return 245.75;
        default:
          return null;
      }
    case ContaminationType.Aged:
      switch (criterionCode) {
        case EilCriterionType.AES:
          return 88;
        case EilCriterionType.UR_or_POS:
          return 402;
        case EilCriterionType.C_or_Ind:
          return 625;
        default:
          return null;
      }
    default:
      break;
  }

  return 0;
}

function formula1(cec: number, lookupValue: number) {
  return lookupValue * extras.pow(cec / 10, 0.79);
}

function formula2(ph: number, lookupValue: number) {
  return lookupValue * extras.pow(extras.pow(10, -ph) / extras.pow(10, -6), -0.34);
}

function formula3(ph: number, cec: number, lookupValue: number) {
  return lookupValue * extras.pow(extras.pow(10, -ph) / extras.pow(10, -6), -0.271) * extras.pow(cec / 10, 0.702);
}

function formulaForABC(ironContent: number) {
  return extras.pow(10, extras.log10(ironContent) * 0.589 + 1.024);
}

function getABCForContaminationTypeAged(trafficVolume: string, state: string) {
  switch (trafficVolume) {
    case TrafficVolume.Low:
      switch (state) {
        case State.NSW:
          return 77;
        case State.QLD:
          return 80;
        case State.SA:
          return 57;
        case State.VIC:
          return 40;
        default:
          return null;
      }
    case TrafficVolume.High:
      switch (state) {
        case State.NSW:
          return 122;
        case State.QLD:
          return 159;
        case State.SA:
          return 91;
        case State.VIC:
          return 53;
        default:
          return null;
      }
    default:
      return 0;
  }
}
