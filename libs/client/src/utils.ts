export default {
  loadModule,
  getElectronModules,
};

function loadModule(moduleName) {
  if (window.require) return window.require(moduleName);
  return null;
}

function getElectronModules() {
  const electron = loadModule('electron');
  return {
    electron,
    app: electron ? electron.remote.app : null,
    //remote: electron ? electron.remote : null, //TODO: deprecated, should be removed
    dialog: electron ? electron.remote.dialog : null,
    shell: electron ? electron.shell : null,
    currentWindow: electron ? electron.remote.getCurrentWindow() : null,
  };
}
