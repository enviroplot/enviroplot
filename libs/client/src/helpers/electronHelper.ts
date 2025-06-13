import {endsWith, replace} from 'lodash';

export default {
  require: electronRequire,
  getAppRoot,
};

const electron = electronRequire('electron');

function electronRequire(module) {
  if (window.require) return window.require(module);

  return null;
}

function getAppRoot() {
  if (!electron) return null;
  let root = electron.remote.app.getAppPath();
  if (endsWith(root, '\\resources\\app.asar')) {
    root = replace(root, '\\resources\\app.asar', '');
  }
  return root;
}
