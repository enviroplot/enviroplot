import helper from './actionHelper';
import updateService from 'services/updateService';

export const updateWasteData: any = () => {
  return helper.dispatchAsyncAction(async () => {
    return await updateService.updateWasteData();
  }, null);
};

export const checkIfNeedsUpdate: any = () => {
  return helper.dispatchAsyncAction(async () => {
    return await updateService.needsUpdate();
  }, null);
};
