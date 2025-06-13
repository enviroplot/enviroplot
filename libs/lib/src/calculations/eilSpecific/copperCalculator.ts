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
    formula7(parameters.ph.value, parameters.organicCarbon.value, lookupValue),
    formula8(parameters.ph.value, lookupValue),
  ];

  const lowestValue = _.min(arrayOfValues);

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

function getFormulasLookupValue(criterionKind: EilCriterionType, contaminationType: ContaminationType) {
  switch (contaminationType) {
    case ContaminationType.Fresh:
      switch (criterionKind) {
        case EilCriterionType.AES:
          return 48;
        case EilCriterionType.UR_or_POS:
          return 101;
        case EilCriterionType.C_or_Ind:
          return 150;
        default:
          return null;
      }
    case ContaminationType.Aged:
      switch (criterionKind) {
        case EilCriterionType.AES:
          return 64.1;
        case EilCriterionType.UR_or_POS:
          return 193;
        case EilCriterionType.C_or_Ind:
          return 283;
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
          return 18;
        case State.QLD:
          return 12;
        case State.SA:
          return 17;
        case State.VIC:
          return 10;
        default:
          return null;
      }
    case TrafficVolume.High:
      switch (state) {
        case State.NSW:
          return 28;
        case State.QLD:
          return 17;
        case State.SA:
          return 26;
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
  return lookupValue * extras.pow(cec / 10, 0.106);
}

function formula2(cec: number, lookupValue: number) {
  return lookupValue * extras.pow(cec / 10, 0.96);
}

function formula3(cec: number, lookupValue: number) {
  return lookupValue * extras.pow(cec / 10, 0.58);
}

function formula4(cec: number, lookupValue: number) {
  return lookupValue * extras.pow(cec / 10, 0.848);
}

function formula5(cec: number, lookupValue: number) {
  return lookupValue * extras.pow(cec / 10, 0.751);
}

function formula6(cec: number, lookupValue: number) {
  return lookupValue * extras.pow(cec / 10, 1.06);
}

function formula7(ph: number, organicCarbon: number, lookupValue: number) {
  return extras.pow(
    10,
    extras.log10(lookupValue) + (ph - 6) * 0.31 + (extras.log10(organicCarbon) - extras.log(1)) * 1.05
  );
}

function formula8(ph: number, lookupValue: number) {
  return extras.pow(10, extras.log10(lookupValue) + (ph - 6) * 0.3479);
}

function formulaForABC(ironContent: number) {
  return extras.pow(10, extras.log10(ironContent) * 0.612 + 0.808);
}
