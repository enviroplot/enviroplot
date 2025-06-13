import {isArray, camelCase, isPlainObject, forEach, map} from 'lodash';

export default {
  mapToCamelCase,
};

function mapToCamelCase(input) {
  if (isArray(input)) {
    return map(input, (item) => mapToCamelCase(item));
  }

  const result = {};

  forEach(input, (value, key) => {
    if (isPlainObject(value) || isArray(value)) {
      // checks that a value is a plain object or an array - for recursive key conversion
      value = mapToCamelCase(value); // recursively update keys of any values that are also objects
    }
    result[camelCase(key)] = value;
  });

  return result;
}
