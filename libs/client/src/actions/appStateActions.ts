import {LOAD_APP_STATE} from './actionTypes';
import helper from './actionHelper';

export const loadAppState = (appState) => helper.getAction(LOAD_APP_STATE, {appState});
