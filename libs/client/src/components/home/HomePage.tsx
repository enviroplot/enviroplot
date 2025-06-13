import React, {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {isEmpty, uniq} from 'lodash';

import {loadSamples, updateSampleOrder} from 'actions/sampleActions';
import {
  addSessionFile,
  createSession,
  clearProjectDetails,
  removeSessionFile,
  updateSession,
} from 'actions/sessionActions';
import {loadAppState} from 'actions/appStateActions';
import {confirmAction} from 'actions/commonActions';
import {isVisionConnected} from 'actions/visionActions';

import {getAppData} from 'reducers/index';

import {
  SESSION_UPDATED_MESSAGE,
  SESSION_CREATION_MESSAGE,
  CLEANING_DETAILS_MESSAGE,
  WRONG_SAMPLE_FILE_SELECTED,
  SELECT_CHEMISTRY_FILE_MANUALLY,
  WRONG_CHEMISTRY_FILE_SELECTED,
  DATASET_REMOVING,
} from 'constants/literals/messages';
import {CANNOT_CONNECT_TO_SERVER, WRONG_DATA_FILE} from 'constants/literals/errors';
import {SELECT_SAMPLE_FILE_TO_IMPORT, SELECT_CHEMISTRY_FILE_TO_IMPORT} from 'constants/literals/titles';

import uiHelper from 'helpers/uiHelper';
import importDPService from 'lib/import/importDPService';
import sampleService from 'services/sampleService';
import sessionService from 'services/sessionService';
import projectService from 'services/projectService';
import utils from 'utils';

import HomeToolsSection from './components/HomeToolsSection';
import ProjectDetailsSection from './components/ProjectDetailsSection';
import ContaminantList from './components/ContaminantList';
import AboutDialog from './components/AboutDialog';
import VisionProjectSearchDialog from './components/VisionProjectSearchDialog';

import extras from './extras';

import './home-page.scss';
import dataService from 'services/dataService';
import importEsdatService from 'lib/import/importEsdatService';

interface SessionProject {
  assessmentType: string;
  state: string;
  type: string;
  name: string;
  number: string;
  location: string;
  date: string;
}

function HomePage() {
  const {dialog} = utils.getElectronModules();

  const dispatch = useDispatch();

  const appData = useSelector((state: any) => getAppData(state));
  const fileList = useSelector((state: any) => state.session.fileList);
  const project: SessionProject = useSelector((state: any) => state.session.project);
  const order = useSelector((state: any) => state.sample.order);

  const assessmentType: string = useSelector((state: any) => state.session.project.assessmentType);

  const createSessionAction = () => {
    dispatch(createSession());
  };

  const clearProjectDetailsAction = () => {
    dispatch(clearProjectDetails());
  };

  const [showChemicals, setShowChemicals] = useState(false);
  const [aboutInfoVisible, setAboutInfoVisibility] = useState(false);
  const [projectSearchDialogVisible, setProjectSearchDialogVisibility] = useState(false);

  const CONSTANTS = {
    dpFileFilter: 'Excel File (.XLSX)',
    excelExtension: 'xlsx',
    csvFileFilter: 'CSV File (.CSV)',
    csvExtension: 'csv',
  };

  const createNewSession = () => {
    if (!project) {
      createSessionAction();
      return;
    }

    dispatch(
      confirmAction({
        message: SESSION_CREATION_MESSAGE,
        action: () => {
          createSessionAction();
        },
      })
    );
  };

  const clearProjectDetailsMethod = () => {
    if (!project) {
      createSessionAction();
      return;
    }

    dispatch(
      confirmAction({
        message: CLEANING_DETAILS_MESSAGE,
        action: () => {
          clearProjectDetailsAction();
        },
      })
    );
  };

  const updateSessionAction = (project) => {
    dispatch(updateSession(project));
    uiHelper.showSuccess(SESSION_UPDATED_MESSAGE);
  };

  const importDpFile = async () => {
    const projectDir = await projectService.findProjectFolderPath(project.number, project.name);

    dialog
      .showOpenDialog({
        defaultPath: projectDir,
        properties: ['openFile'],
        filters: [{name: CONSTANTS.dpFileFilter, extensions: [CONSTANTS.excelExtension]}],
      })
      .then(async (result) => {
        if (result.canceled === false) {
          if (!result.filePaths || result.filePaths.length === 0) return;
          const dpFilePath = result.filePaths[0];
          let importResult: any = null;

          const seedData = dataService.getSeedData(assessmentType);
          try {
            importResult = await importDPService.readExcelFileNormalValues(
              dpFilePath,
              false,
              project.assessmentType,
              seedData
            );

            await showMessages(
              importResult,
              dpFilePath,
              '',
              importDPService.readExcelFileNormalValues,
              dpFilePath,
              true,
              project.assessmentType,
              seedData
            );
          } catch (err) {
            uiHelper.showError(WRONG_DATA_FILE);
            return;
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  async function showMessages(inputResult, sampleFilePath, chemistryFilePath, callbackFunction, ...args) {
    const errors = inputResult.messages.filter((message) => message.messageType === 'Error');
    const notErrors = inputResult.messages.filter((message) => message.messageType !== 'Error' && !message.isConfirm);
    if (errors && errors.length > 0) {
      const message = errors[0];
      dispatch(
        confirmAction({
          title: message.messageType,
          message: message.text,
          infoDialog: !message.isConfirm,
          action: async () => {
            inputResult = await callbackFunction(...args);
            storeSamplesData(sampleFilePath, inputResult, chemistryFilePath);
          },
        })
      );
    } else {
      storeSamplesData(sampleFilePath, inputResult, chemistryFilePath);
    }
    notErrors.forEach((notErrorMessage) => {
      uiHelper.showSuccess(notErrorMessage.text);
    });
  }

  const importEsdatFile = async () => {
    let isChemistryFileExists, sampleFilePath, chemistryFilePath;
    const seedData = dataService.getSeedData(assessmentType);

    const projectDir = await projectService.findProjectFolderPath(project.number, project.name);

    dialog
      .showOpenDialog({
        defaultPath: projectDir,
        properties: ['openFile'],
        filters: [{name: CONSTANTS.csvFileFilter, extensions: [CONSTANTS.csvExtension]}],
        title: SELECT_SAMPLE_FILE_TO_IMPORT,
      })
      .then(async (result) => {
        if (!result.filePaths || result.filePaths.length === 0) return;

        sampleFilePath = result.filePaths[0];

        // Split the file path into directory and file parts
        const pathParts = sampleFilePath.split('\\');
        const fileName = pathParts[pathParts.length - 1];

        if (fileName.includes('Sample')) {
          const newFileName = fileName.replace('Sample', 'Chemistry');
          pathParts[pathParts.length - 1] = newFileName;
          chemistryFilePath = pathParts.join('\\');
        }
        const fs = utils.loadModule('fs-extra');
        isChemistryFileExists = await fs.pathExists(chemistryFilePath);
        // read sample file
        const samplesData = await importEsdatFileSample(sampleFilePath, dispatch, confirmAction);

        if (!samplesData) {
          dialog.showMessageBox({
            type: 'error',
            title: 'Error!',
            message: WRONG_SAMPLE_FILE_SELECTED,
          });

          return;
        }

        if (isChemistryFileExists) {
          await importEsdatFilePackage(sampleFilePath, chemistryFilePath, assessmentType, seedData);
          return;
        }

        dialog.showMessageBox({
          type: 'warning',
          title: 'Warning!',
          message: SELECT_CHEMISTRY_FILE_MANUALLY,
        });

        dialog
          .showOpenDialog({
            properties: ['openFile'],
            filters: [{name: CONSTANTS.csvFileFilter, extensions: [CONSTANTS.csvExtension]}],
            title: SELECT_CHEMISTRY_FILE_TO_IMPORT,
            buttons: ['OK', 'Cancel'],
            defaultId: 0,
            cancelId: 1,
          })
          .then(async (result) => {
            if (!result.filePaths || result.filePaths.length === 0) return;

            chemistryFilePath = result.filePaths[0];
            const importResult = await importEsdatFileChemical(
              chemistryFilePath,
              samplesData,
              sampleFilePath,
              storeSamplesData,
              assessmentType,
              seedData
            );

            if (!importResult) {
              dialog.showMessageBox({
                type: 'error',
                title: 'Error!',
                message: WRONG_CHEMISTRY_FILE_SELECTED,
              });

              dialog
                .showOpenDialog({
                  defaultPath: projectDir,
                  properties: ['openFile'],
                  filters: [{name: CONSTANTS.dpFileFilter, extensions: [CONSTANTS.excelExtension]}],
                })
                .then(async (result) => {
                  if (!result.filePaths || result.filePaths.length === 0) return;

                  chemistryFilePath = result.filePaths[0];

                  await importEsdatFileChemical(
                    chemistryFilePath,
                    samplesData,
                    sampleFilePath,
                    storeSamplesData,
                    assessmentType,
                    seedData
                  );
                });
            }
          });
      });
  };

  const storeSamplesData = (sampleFilePath, inputResult, chemistryFilePath = '') => {
    const samples = inputResult.samples;
    if (!extras.isValidSamplesData(samples, dispatch, confirmAction)) return;

    const sampleFileName = sampleFilePath.split('\\').pop();
    const chemistryFileName = chemistryFilePath.split('\\').pop() || '';

    const sampleIds = sampleService.getSampleIds(samples);

    dispatch(addSessionFile(sampleFileName, sampleIds, chemistryFileName, inputResult));

    const sampleOrder = uniq(order.concat(sampleIds));

    dispatch(updateSampleOrder(sampleOrder));

    const assessmentType = project.assessmentType;

    dispatch(loadSamples(samples, assessmentType));
  };

  async function importEsdatFilePackage(sampleFilePath, chemistryFilePath, assessmentType, seedData) {
    const inputResult = await importEsdatService.readCSVFileNormalValues(
      sampleFilePath,
      chemistryFilePath,
      false,
      assessmentType,
      seedData
    );
    if (!inputResult) return false;
    await showMessages(
      inputResult,
      sampleFilePath,
      chemistryFilePath,
      importEsdatService.readCSVFileNormalValues,
      sampleFilePath,
      chemistryFilePath,
      true,
      assessmentType,
      seedData
    );
  }

  async function importEsdatFileChemical(
    chemistryFilePath,
    samplesData,
    sampleFilePath,
    storeSamplesData,
    assessmentType,
    seedData
  ) {
    const importResult = await importEsdatService.readAndSetChemicalData(
      chemistryFilePath,
      samplesData,
      false,
      assessmentType,
      seedData
    );

    if (!importResult) return false;

    storeSamplesData(sampleFilePath, samplesData, chemistryFilePath);

    return importResult;
  }
  async function importEsdatFileSample(sampleFilePath, dispatch, confirmAction) {
    let samplesData = await importEsdatService.readCSVSampleFile(sampleFilePath);

    if (!samplesData) return false;

    if (!samplesData.isSuccessfulParse) {
      dispatch(
        confirmAction({
          message: samplesData.message,
          action: async () => {
            samplesData = await importEsdatService.readCSVSampleFile(sampleFilePath);
          },
        })
      );
    }

    return samplesData;
  }

  const removeFile = (key) => {
    dispatch(
      confirmAction({
        message: DATASET_REMOVING,
        action: async () => {
          const sampleIds = fileList[key].samples;
          dispatch(removeSessionFile(key, sampleIds));
        },
      })
    );
  };

  const saveSession = () => {
    sessionService.saveSession(appData);
  };

  const loadSession = () => {
    const loadAction = (state) => {
      dispatch(loadAppState(state));
    };

    sessionService.loadSession(loadAction);
  };

  const toggleAboutDialog = () => {
    setAboutInfoVisibility(!aboutInfoVisible);
  };

  const openProjectSearchDialog = async () => {
    const isConnected = await dispatch(isVisionConnected());

    if (!isConnected) {
      return dispatch(
        confirmAction({
          title: 'Warning!',
          message: CANNOT_CONNECT_TO_SERVER,
          infoDialog: true,
        })
      );
    }

    toggleProjectSearchDialog();
  };

  const toggleProjectSearchDialog = () => {
    setProjectSearchDialogVisibility(!projectSearchDialogVisible);
  };

  const importFromVision = (project) => {
    updateSessionAction(project);
    toggleProjectSearchDialog();
  };

  const isActiveSession = project && !isEmpty(project) ? true : false;

  const projectDetailsVisible = project && !showChemicals;

  return (
    <div id="home-page">
      <HomeToolsSection
        isActiveSession={isActiveSession}
        importDpFile={importDpFile}
        importEsdatFile={importEsdatFile}
        createSession={createNewSession}
        clearProjectDetails={clearProjectDetailsMethod}
        loadSession={loadSession}
        saveSession={saveSession}
        showChemicals={() => setShowChemicals(true)}
        showAboutInfo={toggleAboutDialog}
        viewProjectDetails={() => setShowChemicals(false)}
      />

      {projectDetailsVisible && (
        <ProjectDetailsSection
          currentProject={project}
          files={fileList}
          onRemoveFile={removeFile}
          onUpdateSession={updateSessionAction}
          onImport={openProjectSearchDialog}
        />
      )}

      {showChemicals && <ContaminantList />}

      {aboutInfoVisible && <AboutDialog visible={aboutInfoVisible} close={toggleAboutDialog} />}

      {projectSearchDialogVisible && (
        <VisionProjectSearchDialog
          visible={projectSearchDialogVisible}
          close={toggleProjectSearchDialog}
          importFromVision={importFromVision}
          project={project}
        />
      )}
    </div>
  );
}

export default HomePage;
