import * as _ from 'lodash';

import extras from './extras';

export default {
  getCriterionValueByCriterionCode,
};

function getCriterionValueByCriterionCode(criteriaCode: EilCriterionType, parameters: SampleParameters) {
  let resultValue = 0;

  var lookupValue = getFormulasLookupValue(criteriaCode, parameters.contaminationType);

  var firstValue = formula1(parameters.clayContent.value, lookupValue);

  if (parameters.mbc) {
    resultValue = firstValue + parameters.mbc;
    return extras.roundCalculationValue(resultValue);
  }

  if (parameters.contaminationType === ContaminationType.Fresh) {
    resultValue = firstValue + formulaForABC(parameters.ironContent.value);
    return extras.roundCalculationValue(resultValue);
  }

  resultValue = firstValue + getABCForContaminationTypeAged(parameters.trafficVolume, parameters.state);

  return extras.roundCalculationValue(resultValue);
}

function getFormulasLookupValue(criterionCode: EilCriterionType, contaminationType: ContaminationType) {
  switch (contaminationType) {
    case ContaminationType.Fresh:
      switch (criterionCode) {
        case EilCriterionType.AES:
          return 51.36;
        case EilCriterionType.UR_or_POS:
          return 159.09;
        case EilCriterionType.C_or_Ind:
          return 265.19;
        default:
          return null;
      }
    case ContaminationType.Aged:
      switch (criterionCode) {
        case EilCriterionType.AES:
          return 128.4;
        case EilCriterionType.UR_or_POS:
          return 397.725;
        case EilCriterionType.C_or_Ind:
          return 662.975;
        default:
          return null;
      }
    default:
      return 0;
  }
}

function getABCForContaminationTypeAged(trafficVolume: TrafficVolume, state: State) {
  switch (trafficVolume) {
    case TrafficVolume.Low:
      switch (state) {
        case State.NSW:
          return 8;
        case State.QLD:
          return 14;
        case State.SA:
          return 16;
        case State.VIC:
          return 10;
        default:
          return null;
      }
    case TrafficVolume.High:
      switch (state) {
        case State.NSW:
          return 13;
        case State.QLD:
          return 7;
        case State.SA:
          return 15;
        case State.VIC:
          return 10;
        default:
          return null;
      }
    default:
      return 0;
  }
}

function formula1(clayContent: number, lookupValue: number) {
  return lookupValue * extras.pow(clayContent / 10, 0.3315);
}

function formulaForABC(ironContent: number) {
  return extras.pow(10, extras.log10(ironContent) * 0.75 + 1.242);
}
