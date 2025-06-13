import {isEmpty} from 'lodash';

import {NO_SAMPLES_OR_MEASUREMENTS, WRONG_SAMPLE_FILE} from 'constants/literals/errors';

export default {
  isValidSamplesData,
};

function isValidSamplesData(samples, dispatch, confirmAction) {
  if (!samples || isEmpty(samples)) {
    dispatch(
      confirmAction({
        title: 'Warning!',
        message: WRONG_SAMPLE_FILE,
        infoDialog: true,
      })
    );

    return false;
  }

  let isValidChemistryFile = false;

  for (const sample of samples) {
    if (!isEmpty(sample.measurements)) {
      isValidChemistryFile = true;
      break;
    }
  }

  if (!isValidChemistryFile) {
    dispatch(
      confirmAction({
        title: 'Warning!',
        message: NO_SAMPLES_OR_MEASUREMENTS,
        infoDialog: true,
      })
    );

    return false;
  }

  return true;
}
