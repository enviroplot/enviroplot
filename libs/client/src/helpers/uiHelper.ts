import {toast} from 'react-toastify';

export default {
  showSuccess,
  showWarning,
  showError,
  showNotImplemented
};

const toastConfiguration = {
  position: toast.POSITION.BOTTOM_LEFT,
  autoClose: 5000
};

function showSuccess(message, {autoClose = 3000, id = null} = {}) {
  return showMessage(message, toast.TYPE.SUCCESS, {id, autoClose});
}

function showWarning(messsage, {autoClose = 3000, id = null} = {}) {
  return showMessage(messsage, toast.TYPE.WARNING, {id, autoClose});
}

function showError(error, {autoClose = 3000, id = null} = {}) {
  return showMessage(error.message, toast.TYPE.ERROR, {id, autoClose});
}

function showNotImplemented() {
  return showWarning('Feature is not implemented.');
}

//helper methods

function showMessage(message, type, {id, autoClose}) {
  if (id && toast.isActive(id)) return;

  const options: any = {...toastConfiguration, type, autoClose};

  if (id) options.toastId = id;

  return toast(message, options);
}
