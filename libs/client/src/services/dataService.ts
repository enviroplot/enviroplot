import utils from 'utils';
import httpHelper from 'helpers/httpHelper';
import mappingHelper from 'helpers/mappingHelper';
import config from 'helpers/config';
import uiHelper from 'helpers/uiHelper';
import {Soil} from 'constants/assessmentType';
import pathHelper from 'helpers/pathHelper';

let assessmentType = Soil;

export default {
  setAssessmentType,
  getSeedData,
  getChemicalGroups,
  getChemicals,
  getCalculatedChemicals,
  isConnectedToVisionApi,
  getProjects,
  getProjectDetails,
  postLogInfo,
  getProjectPhases,
  getProjectTasks,
};

function setAssessmentType(type) {
  assessmentType = type;
}

function getSeedData(seedAssessmentType: string | undefined = undefined) {
  const fs = utils.loadModule('fs-extra');
  const seedFilePath = pathHelper.getSeedFilePath();
  const seedData = fs.readJsonSync(seedFilePath);

  const assType = seedAssessmentType || assessmentType;

  const seedLookup = {
    Soil: seedData.soilData,
    Waste: seedData.wasteData,
    Water: seedData.waterData,
  };

  if (seedLookup[assType]) {
    return seedLookup[assType];
  } else {
    throw new Error('Assessment type not specified.');
  }
}

function getChemicalGroups(assessmentType: string = Soil) {
  const result = getSeedData(assessmentType).chemicalGroups;
  return result;
}

function getChemicals() {
  const result = getSeedData().chemicals;
  return result;
}

function getCalculatedChemicals() {
  const result = getSeedData().calculatedChemicals;
  return result;
}

async function isConnectedToVisionApi() {
  try {
    const response = await httpHelper.get(getVisionUrl('/status'));

    if (response && response === 'active') return true;

    return false;
  } catch (err) {
    return false;
  }
}

async function getProjects(projectNumber) {
  const url = `/vision/v2/projects?number=${projectNumber}`;
  const request = getFetchRequest(getVisionUrl(url), 'GET');

  return fetch(request)
    .then((response) => {
      validateResponse(response);
      return response.json();
    })
    .then((data) => {
      const result = mappingHelper.mapToCamelCase(data);
      return result;
    })
    .catch(() => {
      //TODO
      return [];
    });
}

async function getProjectDetails(projectNumber, phase, task) {
  phase = phase || '';
  task = task || '';

  const url = `/vision/project/${projectNumber}/${phase}/${task}`;
  const request = getFetchRequest(getVisionUrl(url), 'GET');

  return fetch(request)
    .then((response) => {
      validateResponse(response);
      return response.json();
    })
    .then((data) => {
      const result = mappingHelper.mapToCamelCase(data);
      return result;
    })
    .catch((error) => {
      return error;
    });
}

async function postLogInfo(userADName, timestamp) {
  const data = {userADName, timestamp};
  const url = config.erApiUrl + '/save-log-item';
  await httpHelper.post(url, data);
}

async function getProjectPhases(projectNumber) {
  const url = `/vision/project/${projectNumber}/phases`;
  const request = getFetchRequest(getVisionUrl(url), 'GET');

  return fetch(request)
    .then((response) => {
      validateResponse(response);
      return response.json();
    })
    .then((data) => {
      const result = mappingHelper.mapToCamelCase(data);
      return result;
    })
    .catch((error) => {
      console.log(error);
      return [];
    });
}

async function getProjectTasks(projectNumber, phase) {
  const url = `/vision/project/${projectNumber}/${phase}/tasks`;
  const request = getFetchRequest(getVisionUrl(url), 'GET');

  return fetch(request)
    .then((response) => {
      validateResponse(response);
      return response.json();
    })
    .then((data) => {
      const result = mappingHelper.mapToCamelCase(data);
      return result;
    })
    .catch((error) => {
      console.log(error);
      return [];
    });
}

//helper methods

function validateResponse(response) {
  if (!response.ok) {
    let message = 'server error';
    if (response.statusText) {
      message = response.statusText;
    }
    uiHelper.showError(`API error: ${message}`);
    throw new Error('API Error');
  }
}

function getFetchRequest(url, method) {
  const requestOptions: any = {
    method,
    mode: 'cors',
    headers: {
      'Application-Name': 'EnviroReporter', // Add your application name here
    },
  };

  const areLocalStubs = url.includes(3000);
  if (!areLocalStubs) {
    requestOptions.credentials = 'include';
  }

  return new Request(url, requestOptions);
}

function getVisionUrl(url) {
  return `${config.visionUrl}${url}`;
}
