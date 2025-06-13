import {includes, isString, upperFirst, uniq, isEmpty} from 'lodash';

export default {
  displayTwoDecimalPlaces,
  displayDepth,
  displayRequiredSessionParametersMessage,
};

function displayTwoDecimalPlaces(val) {
  if (isString(val)) return val;

  if (!val && val !== 0) return '';

  return val.toFixed(2);
}

function displayDepth(val) {
  if (isString(val) || typeof val === 'undefined') return val;

  const stringVal = val.toString();

  if (!includes(stringVal, '.')) return val.toFixed(1);

  const fraction = stringVal.split('.')[1];

  if (fraction.length > 1) return val.toFixed(2);

  return val.toFixed(1);
}

function displayRequiredSessionParametersMessage(missingRequiredSampleParameters) {
  let result = '';
  const lookup: any = {};

  for (const key of Object.keys(missingRequiredSampleParameters)) {
    const uniqMissingParameters: any[] = uniq(missingRequiredSampleParameters[key]);

    if (isEmpty(uniqMissingParameters)) continue;

    for (const parameter of uniqMissingParameters) {
      if (!lookup[parameter]) {
        lookup[parameter] = [];
      }

      lookup[parameter].push(`'${key}'`);
    }
  }

  for (const key of Object.keys(lookup)) {
    result += ` ${upperFirst(key)} parameter required for samples `;

    result += lookup[key].join(', ');

    result += '.';
  }

  return result;
}
