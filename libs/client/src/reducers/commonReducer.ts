import helper from './reducerHelper';

import * as actionTypes from 'actions/actionTypes';
import initialState from './initialState';

const commonReducer = (state = initialState.common, action) => {
  return helper.handleActions(state, action, {
    [actionTypes.ASYNC_ACTION_START](state, payload) {
      state.asyncAction = {showOverlay: payload.showOverlay};
    },
    [actionTypes.ASYNC_ACTION_END](state) {
      state.asyncAction = null;
    },
    [actionTypes.CONFIRM_ACTION](state, payload) {
      state.confirmAction = payload;
    },
    [actionTypes.CONFIRM_ACTION_CANCEL](state) {
      state.confirmAction = null;
    },
    [actionTypes.SHOW_LOADER](state) {
      state.isLoaderVisible = true;
    },
    [actionTypes.HIDE_LOADER](state) {
      state.isLoaderVisible = false;
    },
  });
};

export default commonReducer;
