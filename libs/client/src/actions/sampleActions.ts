import * as actionTypes from './actionTypes';
import helper from './actionHelper';

export const loadSamples = (samples, assessmentType) =>
  helper.getAction(actionTypes.LOAD_SAMPLES, {samples, assessmentType});

export const resetSamples = () => helper.getAction(actionTypes.RESET_SAMPLES, {});

export const updateSelectionReport = (selected) => helper.getAction(actionTypes.UPDATE_SELECTION_REPORT, {selected});

export const updateSelectionEdit = (selected) => helper.getAction(actionTypes.UPDATE_SELECTION_EDIT, {selected});

export const updateSoilTypeParameter = (soilType) => helper.getAction(actionTypes.UPDATE_SOIL_TYPE, {soilType});

export const updateSampleDepth = (depthFrom, depthTo) =>
  helper.getAction(actionTypes.UPDATE_SAMPLE_DEPTH, {depthFrom, depthTo});

export const updateParameters = (params) => helper.getAction(actionTypes.UPDATE_PARAMETERS, {params});

export const updateTripBlank = (isTripBlank) => helper.getAction(actionTypes.UPDATE_TRIP_BLANK, {isTripBlank});

export const updateTripSpike = (isTripSpike) => helper.getAction(actionTypes.UPDATE_TRIP_SPIKE, {isTripSpike});

export const updateRinsate = (isRinsate) => helper.getAction(actionTypes.UPDATE_RINSATE, {isRinsate});

export const updateSampleDuplicate = (primarySampleId) =>
  helper.getAction(actionTypes.SAVE_SAMPLE_DUPLICATE, {primarySampleId});

export const updateSampleOrder = (order) => helper.getAction(actionTypes.SAVE_SAMPLE_ORDER, {order});

export const changeSortOrder = (sortOrder) => helper.getAction(actionTypes.CHANGE_SORT_ORDER, {sortOrder});
