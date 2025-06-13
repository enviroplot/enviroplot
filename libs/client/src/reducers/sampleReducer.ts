import {indexOf, includes, filter, remove} from 'lodash';
import update from 'immutability-helper';
import {createSelector} from 'reselect';

import helper from './reducerHelper';
import sampleService from 'services/sampleService';

import * as actionTypes from 'actions/actionTypes';
import initialState from './initialState';

import {SAND_SOIL_TYPE} from 'constants/hslSoilTypes';
import {ASCENDING_DIRECTION, DESCENDING_DIRECTION} from 'constants/sortOrders';
import {COARSE_SOIL_TEXTURE, FINE_SOIL_TEXTURE} from 'constants/soilTextureTypes';

const sampleReducer = (state = initialState.sample, action) => {
  return helper.handleActions(state, action, {
    [actionTypes.LOAD_SAMPLES]: handleLoadSamples,
    [actionTypes.RESET_SAMPLES]: handleResetSamples,
    [actionTypes.REMOVE_SESSION_FILE]: handleRemoveSamples,
    [actionTypes.UPDATE_SELECTION_REPORT](state, payload) {
      state.selection.report = payload.selected;
    },
    [actionTypes.UPDATE_SOIL_TYPE]: handleSoilTypeUpdate,
    [actionTypes.UPDATE_SELECTION_EDIT](state, payload) {
      state.selection.edit = payload.selected;
    },
    [actionTypes.UPDATE_SAMPLE_DEPTH]: handleSampleDepthUpdate,
    [actionTypes.UPDATE_PARAMETERS](state, payload) {
      state.parameters = payload.params;
    },
    [actionTypes.UPDATE_TRIP_BLANK]: handleTripBlankUpdate,
    [actionTypes.UPDATE_TRIP_SPIKE]: handleTripSpikeUpdate,
    [actionTypes.UPDATE_RINSATE]: handleRinsateUpdate,
    [actionTypes.SAVE_SAMPLE_DUPLICATE]: handleSampleDuplicateUpdate,
    [actionTypes.SAVE_SAMPLE_ORDER](state, payload) {
      state.order = payload.order;
    },
    [actionTypes.CHANGE_SORT_ORDER]: handleChangeSortOrder,
  });
};

const samplesSelector = (state) => state.sample.all;
const orderSelector = (state) => state.sample.order;
const reportSampleIdsSelector = (state) => state.sample.selection.report;
const editSampleIdsSelector = (state) => state.sample.selection.edit;

export const getAllSamples = createSelector(samplesSelector, orderSelector, (samples, order) => {
  const result = {};

  for (const sampleId of order) {
    result[sampleId] = samples[sampleId];
  }
  return result;
});

export const getReportSamples = createSelector(
  samplesSelector,
  orderSelector,
  reportSampleIdsSelector,
  (samples, order, reportSampleIds) => {
    const result: any[] = [];
    for (const sampleId of order) {
      for (const sampleIdSelected of reportSampleIds) {
        if (sampleId === sampleIdSelected) {
          result.push(samples[sampleId]);
        }
      }
    }

    return result;
  }
);

export const getEditSamples = createSelector(
  samplesSelector,
  orderSelector,
  editSampleIdsSelector,
  (samples, order, editSampleIds) => {
    const result: any[] = [];

    for (const sampleId of order) {
      if (editSampleIds.includes(sampleId)) {
        result.push(samples[sampleId]);
      }
    }

    return result;
  }
);

function handleLoadSamples(state, payload) {
  const reportSampleIds = state.selection.report;
  const {samples, assessmentType} = payload;

  sampleService.addHasStandardContaminationChemicalsFlag(samples, assessmentType);
  const selected = sampleService.shouldGetSelectedSamples(samples);
  const parameters = sampleService.getSessionSampleParameters(samples);
  const samplesToAdd: any[] = [];
  for (const sample of samples) {
    const labId = sample.labSampleId;

    if (!state.all || !state.all[labId]) {
      samplesToAdd.push(sample);
    } else {
      samplesToAdd.push(sample); // TODO: temporary dognail
      delete parameters[labId];
      remove(selected, (x) => x === labId);
    }
  }

  const {result, mergedSamplesLabIds} = sampleService.mapSamples(state.all, samplesToAdd);

  state.all = result;

  const order = state.order;

  mergedSamplesLabIds.forEach((labId) => {
    delete parameters[labId];
    remove(selected, (x) => x === labId);
    remove(order, (x) => {
      return x === labId;
    });
  });
  state.order = [...order];
  state.selection.report = reportSampleIds.concat(selected);
  state.parameters = {...state.parameters, ...parameters};
}

function handleResetSamples(state) {
  const samples = {...state.all};

  const selected = sampleService.shouldGetSelectedSamples(samples);

  state.selection.report = selected;
}

function handleRemoveSamples(state, payload) {
  const sampleIds = payload.sampleIds;

  const samples = {...state.all};

  for (const sampleId of sampleIds) {
    if (samples[sampleId]) {
      delete samples[sampleId];
    }
  }

  const reportSampleIds = filter(state.selection.report, (sampleId) => {
    return !includes(sampleIds, sampleId);
  });

  const order: string[] = [];
  for (const sampleId of state.order) {
    if (!sampleIds.includes(sampleId)) {
      order.push(sampleId);
    }
  }

  state.all = samples;
  state.order = order;
  state.selection.report = reportSampleIds ? reportSampleIds : [];
}

function handleSoilTypeUpdate(state, payload) {
  const soilType = payload.soilType;

  const soilTexture = soilType === SAND_SOIL_TYPE ? COARSE_SOIL_TEXTURE : FINE_SOIL_TEXTURE;

  const samples = {...state.all};

  for (const sampleId of state.selection.edit) {
    const parameters = update(state.parameters, {
      [sampleId]: {
        soilType: {$set: soilType},
        soilTexture: {$set: soilTexture},
      },
    });

    state.parameters = parameters;

    const sample = samples[sampleId];
    if (sample) {
      sample.soilType = soilType;
      sample.soilTexture = soilTexture;
    }
  }
}

function handleSampleDepthUpdate(state, payload) {
  const depthFrom = payload.depthFrom;
  const depthTo = payload.depthTo;

  const samples = {...state.all};

  for (const sampleId of state.selection.edit) {
    const sample = samples[sampleId];
    if (sample) {
      sample.depth.from = depthFrom;
      sample.depth.to = depthTo;
    }
  }
}

function handleTripBlankUpdate(state, payload) {
  const editSampleIds = state.selection.edit;

  const samples = {...state.all};

  for (const sampleId of editSampleIds) {
    const sample = samples[sampleId];

    if (sample) sample.isTripBlank = payload.isTripBlank;
  }

  state.all = samples;
}

function handleTripSpikeUpdate(state, payload) {
  const editSampleIds = state.selection.edit;

  const samples = {...state.all};

  for (const sampleId of editSampleIds) {
    const sample = samples[sampleId];

    if (sample) sample.isTripSpike = payload.isTripSpike;
  }

  state.all = samples;
}

function handleRinsateUpdate(state, payload) {
  const editSampleIds = state.selection.edit;

  const samples = {...state.all};

  for (const sampleId of editSampleIds) {
    const sample = samples[sampleId];

    if (sample) sample.isRinsate = payload.isRinsate;
  }

  state.all = samples;
}

function handleSampleDuplicateUpdate(state, payload) {
  const primarySampleId = payload.primarySampleId;
  const editSampleIds = state.selection.edit;

  const samples = {...state.all};

  const replicateSampleId = editSampleIds[0];

  const replicateSample = samples[replicateSampleId];

  if (replicateSample) {
    replicateSample.primarySampleId = primarySampleId;
  }

  const order = filter(state.order, (s) => {
    return s !== replicateSampleId;
  });

  const replicateIndex = indexOf(order, primarySampleId);

  order.splice(replicateIndex + 1, 0, replicateSampleId);

  state.all = samples;
  state.order = order;
}

function handleChangeSortOrder(state, payload) {
  const currentSort = state.sort;
  const sortOrder = payload.sortOrder;

  let direction = ASCENDING_DIRECTION;

  if (currentSort.order === sortOrder) {
    if (currentSort.direction === ASCENDING_DIRECTION) {
      direction = DESCENDING_DIRECTION;
    }
  }

  const sort = {
    order: sortOrder,
    direction,
  };

  state.sort = sort;
}

export default sampleReducer;
