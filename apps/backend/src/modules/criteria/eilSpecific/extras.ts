import * as _ from 'lodash';

export default {
  pow,
  log,
  log10,
  roundCalculationValue,
  checkIronContentIsSpecified,
  getEilCriterionType,
};

function pow(operationBase: number, power: number) {
  return Math.pow(operationBase, power);
}

function log(argument: number) {
  return Math.log(argument);
}

function log10(argument: number) {
  return Math.log10(argument);
}

function roundCalculationValue(value: number) {
  const round = (x: number, p = 0) => _.round(x, p);

  let result = 0;
  if (value < 1) result = round(value, 1);
  if (value >= 1 && value < 10) result = round(value);
  if (value >= 10 && value < 100) result = round(value / 5) * 5;
  if (value >= 100 && value < 1000) result = round(value / 10) * 10;
  if (value >= 1000 && value < 10000) result = round(value / 100) * 100;
  if (value >= 10000) result = round(value / 1000) * 1000;

  return result;
}

function checkIronContentIsSpecified(sampleParameters: SampleParameters) {
  if (
    sampleParameters.mbc &&
    sampleParameters.contaminationType === ContaminationType.Fresh &&
    sampleParameters.ironContent.value === 0
  ) {
    return false;
  }
  return true;
}

function getEilCriterionType(criterionType: string) {
  switch (criterionType) {
    case 'EIL AES':
      return EilCriterionType.AES;
    case 'EIL UR/POS':
      return EilCriterionType.UR_or_POS;
    case 'EIL C/Ind':
      return EilCriterionType.C_or_Ind;
    default:
      return null;
  }
}
