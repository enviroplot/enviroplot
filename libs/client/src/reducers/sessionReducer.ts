import {createSelector} from 'reselect';
import {cloneDeep, isArray, isEmpty} from 'lodash';
import update from 'immutability-helper';

import helper from './reducerHelper';
import dataService from 'services/dataService';

import * as actionTypes from 'actions/actionTypes';
import initialState, {defaultChemicalGroups, initialStateOriginal} from './initialState';

const sessionReducer = (state = initialState.session, action) => {
  return helper.handleActions(state, action, {
    [actionTypes.ADD_SESSION_FILE](state, payload) {
      const files = state.fileList ? state.fileList : {};

      const {sampleFileName, sampleIds, chemistryFileName, fileSamplesData}: any = {...payload};

      files[sampleFileName] = {
        sampleFile: sampleFileName,
        chemistryFile: chemistryFileName,
        samples: sampleIds,
        fileSamplesData: cloneDeep(fileSamplesData),
      };

      state.fileList = {...files};
    },
    [actionTypes.UPDATE_SESSION](state, payload) {
      const {project, chemicalGroups, criteria} = payload;

      if (project) state.project = project;
      if (chemicalGroups) state.chemicalGroups = chemicalGroups;
      if (criteria) state.criteria = criteria;
    },
    [actionTypes.REMOVE_SESSION_FILE](state, payload) {
      const files = {...state.fileList};

      delete files[payload.fileName];

      state.fileList = files;
    },
    [actionTypes.APPLY_BIODEGRADATION](state) {
      state.applyBiodegradation = !state.applyBiodegradation;
    },
    [actionTypes.SHOULD_OUTPUT_ASLP](state, payload) {
      state.shouldOutputAslp = payload.shouldOutputAslp;
    },
    [actionTypes.SHOULD_OUTPUT_TCLP](state, payload) {
      state.shouldOutputTclp = payload.shouldOutputTclp;
    },
    [actionTypes.SAVE_CHEMICAL_GROUPS](state, payload) {
      const {chemicalGroups, assessmentType} = payload;
      state.chemicalGroups[assessmentType] = chemicalGroups;
    },
    [actionTypes.UPDATE_CHEMICAL_GROUPS](state, payload) {
      state.chemicalGroups[payload.moduleName] = payload.chemicalGroups;
    },
    [actionTypes.SET_COMBINED_CHEMICALS_DISPLAY](state, payload) {
      state.combinedChemicalsDisplay = payload.combinedChemicalsDisplay;
    },
    [actionTypes.HIGHTLIGHT_ALL_DETECTIONS](state) {
      state.highlightAllDetections = !state.highlightAllDetections;
    },
    [actionTypes.TOGGLE_DEPTH_COLUMN](state) {
      state.showDepthColumn = !state.showDepthColumn;
    },
    [actionTypes.SAVE_CRITERIA](state, payload) {
      state.criteria = [...payload.criteria];
    },
    [actionTypes.SAVE_CURRENT_CRITERIA](state, payload) {
      const {criteria, assessmentType} = payload;
      state.selectedCriteria[assessmentType] = [...criteria];
    },

    [actionTypes.LOAD_COMBINED_CHEMICALS_DISPLAY_OPTIONS](state, payload) {
      state.combinedChemicalsDisplay = payload.displayOptions;
    },
    [actionTypes.UPDATE_WASTE_STATISTICS](state, payload) {
      const field = payload.field;
      const value = payload.value;

      state.wasteStatistics[field] = value;
    },
    [actionTypes.UPDATE_OUTPUT_FORMAT](state, payload) {
      state.outputFormat = payload.outputFormat;
    },
    [actionTypes.UPDATE_WATER_ASSESSMENT_PARAMETERS](state, payload) {
      const field = payload.field;
      const value = payload.value;

      const waterAssessmentParameters = update(state.waterAssessmentParameters || {}, {
        [field]: {$set: value},
      });

      state.waterAssessmentParameters = waterAssessmentParameters;
    },
  });
};

export function loadSeedData(state) {
  const assessmentType = state.project.assessmentType;

  if (!assessmentType) return;

  dataService.setAssessmentType(assessmentType);
}

const projectSelector = (state) => state.session.project;

export const isAssessmentTypeSelected = createSelector(projectSelector, (currentProject) => {
  if (!currentProject) return () => false;

  return () => (currentProject.assessmentType ? true : false);
});

export const validateSessionState = (state) => {
  if (!isArray(state?.chemicalGroups) || isEmpty(state?.chemicalGroups)) {
    state.chemicalGroups = {...defaultChemicalGroups};
  }

  if (isEmpty(state.waterAssessmentParameters)) {
    state.waterAssessmentParameters = initialStateOriginal.session.waterAssessmentParameters;
  }

  return state;
};

export default sessionReducer;
