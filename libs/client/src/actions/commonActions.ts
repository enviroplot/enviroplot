import {ASYNC_ACTION_START, ASYNC_ACTION_END, CONFIRM_ACTION, CONFIRM_ACTION_CANCEL} from './actionTypes';

import helper from './actionHelper';

export const asyncActionStart = showOverlay => helper.getAction(ASYNC_ACTION_START, {showOverlay});

export const asyncActionEnd = () => helper.getAction(ASYNC_ACTION_END, {});

export const confirmAction = confirmInfo => helper.getAction(CONFIRM_ACTION, confirmInfo);

export const confirmActionCancel = () => helper.getAction(CONFIRM_ACTION_CANCEL, {});
