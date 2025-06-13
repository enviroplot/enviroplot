import dateHelper from 'helpers/dateHelper';
import utils from 'utils';
import config from 'helpers/config';
import {trimStart} from 'lodash';

const path = utils.loadModule('path');
const {app} = utils.getElectronModules();

export default {
  mapProject,
  getProjectLabel,
  findProjectFolderPath: findProjectPath,
};

function mapProject(projectData) {
  const project: any = {};
  project.projectNumber = projectData.projectNumber;
  project.projectName = projectData.name;
  project.phase = projectData.phase;
  project.task = projectData.task;
  project.location = getProjectLocation(projectData);
  project.hasSublevels = projectData.hasSublevels;

  const creationDate = projectData.creationDate;
  project.creationDate = creationDate ? dateHelper.displayProjectCreationDate(creationDate) : '';

  project.id = generateProjectId(project);

  return project;
}

function getProjectLabel(project, field) {
  const label = `${project[field]} (${project.projectName})`;

  return label;
}

//helper methods

function generateProjectId(project) {
  const projectId = `${project.projectNumber}-${project.phase}-${project.task}`;
  return projectId;
}

function getProjectLocation(projectData) {
  const siteAddress1 = getPartOfAddress(projectData.siteAddress1);
  const siteAddress2 = getPartOfAddress(projectData.siteAddress2);
  const siteAddress3 = getPartOfAddress(projectData.siteAddress3);
  const state = getPartOfAddress(projectData.state);
  const city = getPartOfAddress(projectData.city);
  const postCode = getPartOfAddress(projectData.postCode);

  let result = siteAddress1 + siteAddress2 + siteAddress3 + city + state + postCode;

  if (result) {
    result = result.substring(0, result.length - 2);
  }

  return result;
}

function getPartOfAddress(projectProperty) {
  const result = projectProperty ? `${projectProperty}, ` : '';
  return result;
}

async function findProjectPath(projectNumber, projectName) {
  if (!config.baseVisionProjectFolder) return app.getPath('desktop');
  const directory = await getVisionDirectoryName(projectNumber, projectName);

  const projectPath = path.join(config.baseVisionProjectFolder, directory);

  return projectPath;
}

async function getVisionDirectoryName(projectNumber, projectName) {
  projectNumber = trimStart(projectNumber, '0');
  const directory = `${projectNumber} - ${projectName}`;
  return directory;
}
