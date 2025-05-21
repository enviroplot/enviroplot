import * as _ from 'lodash';

import extras from './extras';

export default {
  getCriterionValueByCriterionCode,
};

function getCriterionValueByCriterionCode(criteriaCode: EilCriterionType, parameters: SampleParameters) {
  let resultValue = 0;

  var lookupValue = getFormulasLookupValue(criteriaCode, parameters.contaminationType);

  const arrayOfValues = [
    formula1(parameters.cec.value, lookupValue),
    formula2(parameters.cec.value, lookupValue),
    formula3(parameters.cec.value, lookupValue),
    formula4(parameters.cec.value, lookupValue),
    formula5(parameters.cec.value, lookupValue),
    formula6(parameters.cec.value, lookupValue),
  ];

  var lowestValue = _.min(arrayOfValues);

  if (parameters.mbc) {
    resultValue = lowestValue + parameters.mbc;
    return extras.roundCalculationValue(resultValue);
  }

  if (parameters.contaminationType === ContaminationType.Fresh) {
    resultValue = lowestValue + formulaForABC(parameters.ironContent.value);
    return extras.roundCalculationValue(resultValue);
  }

  resultValue = lowestValue + getABCForContaminationTypeAged(parameters.trafficVolume, parameters.state);

  return extras.roundCalculationValue(resultValue);
}

function getFormulasLookupValue(criterionCode: EilCriterionType, contaminationType: ContaminationType) {
  switch (contaminationType) {
    case ContaminationType.Fresh:
      switch (criterionCode) {
        case EilCriterionType.AES:
          return 6.78;
        case EilCriterionType.UR_or_POS:
          return 51.8;
        case EilCriterionType.C_or_Ind:
          return 104;
        default:
          return null;
      }
    case ContaminationType.Aged:
      switch (criterionCode) {
        case EilCriterionType.AES:
          return 28.5;
        case EilCriterionType.UR_or_POS:
          return 167;
        case EilCriterionType.C_or_Ind:
          return 286;
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
          return 5;
        case State.QLD:
          return 5;
        case State.SA:
          return 6;
        case State.VIC:
          return 5;
        default:
          return null;
      }
    case TrafficVolume.High:
      switch (state) {
        case State.NSW:
          return 5;
        case State.QLD:
          return 4;
        case State.SA:
          return 6;
        case State.VIC:
          return 10;
        default:
          return null;
      }
    default:
      return 0;
  }
}

function formula1(cec: number, lookupValue: number) {
  return lookupValue * extras.pow(cec / 10, 1.068);
}

function formula2(cec: number, lookupValue: number) {
  return lookupValue * extras.pow(cec / 10, 0.874);
}

function formula3(cec: number, lookupValue: number) {
  return lookupValue * extras.pow(cec / 10, 0.787);
}

function formula4(cec: number, lookupValue: number) {
  return lookupValue * extras.pow(cec / 10, 1.418);
}

function formula5(cec: number, lookupValue: number) {
  return lookupValue * extras.pow(cec / 10, 0.673);
}

function formula6(cec: number, lookupValue: number) {
  return lookupValue * extras.pow(cec / 10, 2.3671);
}

function formulaForABC(ironContent: number) {
  return extras.pow(10, extras.log10(ironContent) * 0.702 + 0.834);
}
