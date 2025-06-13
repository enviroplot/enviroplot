import {assign, isBoolean, cloneDeep, find, orderBy, filter, isString, isObject} from 'lodash';

export default {
  getSelectedIds,
  isAllSelected,
  getUpdatedParameters,
};

function getSelectedIds(sampleId, selectedIds) {
  const isSelected = find(selectedIds, (labSampleId) => {
    return labSampleId === sampleId;
  });

  if (isSelected) {
    selectedIds = filter(selectedIds, (labSampleId) => {
      return labSampleId !== sampleId;
    });
  } else {
    selectedIds.push(sampleId);
  }

  return orderBy(selectedIds);
}

function isAllSelected(samples, selectedIds) {
  const allSelected = selectedIds && samples && selectedIds.length === samples.length && selectedIds.length;
  return allSelected;
}

function getUpdatedParameters(parameters, params, editSampleIds) {
  const updatedParameters = cloneDeep(parameters);

  for (const sampleId of editSampleIds) {
    const sampleParams = updatedParameters[sampleId];

    for (const key of Object.keys(params)) {
      const value = params[key];

      if (isString(value) || isBoolean(value)) {
        sampleParams[key] = value;
      }
      if (isObject(value)) {
        sampleParams[key] = assign(sampleParams[key], value);
      }
    }
  }

  return updatedParameters;
}
