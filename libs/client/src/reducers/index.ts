import {cloneDeep} from 'lodash';
import {combineReducers} from 'redux';
import common from './commonReducer';
import sample from './sampleReducer';
import session, {validateSessionState} from './sessionReducer';
import report from './reportReducer';

import {LOAD_APP_STATE, RESET_SESSION} from 'actions/actionTypes';
import {initialStateOriginal} from './initialState';

import {loadSeedData} from './sessionReducer';

const combinedReducer = combineReducers({
  common,
  sample,
  session,
  report,
});

const rootReducer = (state, action) => {
  const type = action.type;

  switch (type) {
    case LOAD_APP_STATE: {
      const {appState} = action.payload;
      loadSeedData(appState.session);
      validateSessionState(appState.session);

      return appState;
    }
    case RESET_SESSION: {
      return cloneDeep(initialStateOriginal);
    }
    default: {
      return combinedReducer(state, action);
    }
  }
};

//TODO should use reselect, get subset of redux data
export const getAppData = (state) => state;

export const getSessionParameters = (state) => {
  const session = state.session;

  const sessionParameters = {
    applyBiodegradation: session.applyBiodegradation,
    highlightAllDetections: session.highlightAllDetections,
    displayOptions: {
      showDepthColumn: session.showDepthColumn,
      showSummaryStatistics: session.wasteStatistics ? session.wasteStatistics.calculateSummaryStatistics : false,
      showStatisticalInfoForContaminants: session.wasteStatistics
        ? session.wasteStatistics.statisticalInfoForContaminants
        : false,
    },
    criteria: session.criteria,
    chemicalGroups: session.chemicalGroups,
    combinedChemicalsDisplay: session.combinedChemicalsDisplay,
    edits: state.report.edits,
    projectDetails: {
      assessmentType: session.project.assessmentType,
      state: session.project.state,
      type: session.project.type,
      name: session.project.name,
      number: session.project.number,
      location: session.project.location,
      date: session.project.date,
    },
    waterAssessmentParameters: session.waterAssessmentParameters,
    reportOutputFormat: session.outputFormat,
    fileList: session.fileList,
    shouldOutputTclp: session.shouldOutputTclp,
    shouldOutputAslp: session.shouldOutputAslp,
  };

  return sessionParameters;
};

export default rootReducer;
