import {LESS_PREFIX, GREATER_PREFIX} from 'constants/resultPrefixOptions';

export default {
  displayPreviewValue,
};

function displayPreviewValue(value, prefixStr) {
  if (!value) return null;
  let prefix = '';

  switch (prefixStr) {
    case LESS_PREFIX:
      prefix = '<';
      break;
    case GREATER_PREFIX:
      prefix = '>';
      break;
    default:
      break;
  }

  // Check if the value can be converted to a number
  const numericValue = Number(value);

  if (!isNaN(numericValue) && numericValue > 1000) {
    return numericValue.toLocaleString(); // Format number as "1,000"
  }

  return `${prefix}${value.toString()}`;
}
