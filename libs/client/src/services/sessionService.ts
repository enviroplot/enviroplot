import {Soil} from 'constants/assessmentType';
import {NSW_STATE} from 'constants/states';

import utils from 'utils';
import uiHelper from 'helpers/uiHelper';
import {each} from 'lodash';

const {dialog} = utils.getElectronModules();
const fs = utils.loadModule('fs-extra');
const pako = utils.loadModule('pako');

export default {
  loadSession,
  saveSession,
};

const CONSTANTS = {
  sessionFileFilter: 'Enviro Reporting Data (.erd)',
  sessionExtension: 'erd',
};

async function loadSession(loadAppState) {
  dialog
    .showOpenDialog({
      title: 'Load Session',
      filters: [{name: CONSTANTS.sessionFileFilter, extensions: [CONSTANTS.sessionExtension]}],
      properties: ['openFile'],
    })
    .then(async (result) => {
      {
        if (!result.filePaths || result.filePaths.length === 0) return;
        const fileName = result.filePaths[0];

        let appState = null;

        try {
          const zippedData = await fs.readFile(fileName, 'utf8');
          const unzippedData = pako.inflate(zippedData, {to: 'string'});

          appState = JSON.parse(unzippedData);
        } catch (err) {
          try {
            appState = await fs.readJson(fileName);
          } catch (err) {
            uiHelper.showError('Cannot open session file.');
            return;
          }
        }

        setRequiredSessionFields(appState);
        await applyUpdateFixes(appState);
        await loadAppState(appState);

        uiHelper.showSuccess('Session was successfully uploaded!');
      }
    });
}

function saveSession(appData) {
  dialog
    .showSaveDialog({
      title: 'Save Session',
      filters: [{name: CONSTANTS.sessionFileFilter, extensions: [CONSTANTS.sessionExtension]}],
    })
    .then(async (result) => {
      if (!result.filePath) return;
      const appDataContent = JSON.stringify(appData, null, 2);
      const zippedContent = pako.deflate(appDataContent, {to: 'string'});

      try {
        await fs.writeFile(result.filePath, zippedContent, 'utf-8');
        uiHelper.showSuccess('Session was successfully stored!');
      } catch (e) {
        uiHelper.showError('Failed to save the file!');
      }
    });
}

//helper methods

function setRequiredSessionFields(appState) {
  const project = appState.session.project;

  if (!project.assessmentType) {
    project.assessmentType = Soil;
  }

  if (!project.state) {
    project.state = NSW_STATE;
  }
}

// supporting previous versions of .erd files
async function applyUpdateFixes(appState) {
  each(appState.sample.all, (sample) => {
    if (sample.depthFrom != null || sample.depthTo != null) {
      sample.depth = {
        from: sample.depthFrom,
        to: sample.depthTo ? sample.depthTo : sample.depthFrom,
      };
      delete sample.depthFrom;
      delete sample.depthTo;
      delete sample.length;
    }
  });

  each(appState.parameters, (parameter) => {
    delete parameter.depthFrom;
    delete parameter.depthTo;
  });
  each(appState.report?.data?.reportItems, (reportItem) => {
    if (!reportItem.reportCells) {
      reportItem.reportCells = reportItem.samples;
    }
    delete reportItem.samples;
  });

  // support ER v.3.3.8
  if (!appState.session.selectedCriteria) {
    appState.session.selectedCriteria = {
      Soil: [],
      Waste: [],
      Water: [],
    };
  }
}
