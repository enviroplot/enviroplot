import {SHOW_LOADER, HIDE_LOADER} from './../actions/actionTypes';

export default {
  setStore,
  showLoader,
  hideLoader
};

let _store;

function setStore(store) {
  _store = store;
}

function showLoader() {
  _store.dispatch({
    type: SHOW_LOADER,
    isLoaderVisible: true
  });
}

function hideLoader() {
  _store.dispatch({
    type: HIDE_LOADER,
    isLoaderVisible: true
  });
}
