import {asyncActionStart, asyncActionEnd} from './commonActions';

export default {
  dispatchAction,
  dispatchAsyncAction,
  getAction
};

const defaultOptions = {
  throwError: false,
  showOverlay: true
};

const getOptions = options => {
  if (!options) return defaultOptions;

  return {
    ...defaultOptions,
    ...options
  };
};

//performes async action
//action is function which has (dispatch, getState) arguments like redux thunk
function dispatchAsyncAction(action, options) {
  options = getOptions(options);
  return async (dispatch, getState) => {
    try {
      dispatch(asyncActionStart(options.showOverlay));

      const result = await action(dispatch, getState);

      dispatch(asyncActionEnd());

      if (!result) return null;

      return result;
    } catch (error) {
      dispatch(asyncActionEnd());
      if (options.throwError) throw error;
    }
  };
}

//performes sync action
function dispatchAction(action, options) {
  options = getOptions(options);
  return async (dispatch, getState) => {
    try {
      const result = await action(dispatch, getState);

      if (!result) return null;

      return result;
    } catch (error) {
      if (options.throwError) throw error;
    }
  };
}

function getAction(type, payload) {
  if (!type) throw new Error('Specify action type');

  return {
    type,
    payload
  };
}
