import helper from './reducerHelper';

import initialState from './initialState';

import {UPDATE_REPORT_PREVIEW, EXPORT_REPORT_TO_EXCEL, UPDATE_REPORT_EDITS} from 'actions/actionTypes';

const reportReducer = (state = initialState.report, action) => {
  return helper.handleActions(state, action, {
    [UPDATE_REPORT_PREVIEW](state, payload) {
      state.data = payload.reportData;
    },
    [EXPORT_REPORT_TO_EXCEL](state, payload) {
      state.exportedToFile = payload.exportedToFile;
    },
    [UPDATE_REPORT_EDITS](state, payload) {
      state.edits = payload.edits;
    }
  });
};

export default reportReducer;
