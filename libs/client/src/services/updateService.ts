import utils from 'utils';
import moment from 'moment';

import config from 'helpers/config';
import pathHelper from 'helpers/pathHelper';
import httpHelper from 'helpers/httpHelper';
import uiHelper from 'helpers/uiHelper';

const BASE_URL = config.adminCenterApiUrl;

export default {
  updateWasteData,
  needsUpdate
};

async function needsUpdate() {
  try {
    const seedFilePath = pathHelper.getSeedFilePath();
    const fs = utils.loadModule('fs-extra');

    const localData = await fs.readJson(seedFilePath);

    const serverData = await getData('getLastUpdateTime');

    if (!serverData) return null;

    if (localData.lastUpdateTime && Number(localData.lastUpdateTime) >= Number(serverData.lastUpdateTime)) {
      return 'false';
    }

    return 'true';
  } catch (err) {
    uiHelper.showError(err);
  }
}

async function updateWasteData() {
  try {
    const seedFilePath = pathHelper.getSeedFilePath();

    const fs = utils.loadModule('fs-extra');

    const localSeedData = await fs.readJson(seedFilePath);
    const chemicalGroups = await getData('getAllChemicalGroups');
    const chemicals = await getData('getAllChemicals');
    const calculatedChemicals = await getData('getAllCalculatedChemicals');
    const calculations = await getData('getAllCalculations');
    const criteriaDetails = await getData('getAllWasteCriterionDetails');

    localSeedData.wasteData.chemicalGroups = chemicalGroups;

    localSeedData.wasteData.chemicals = chemicals;
    localSeedData.wasteData.chemicalsByGroup = chemicalGroups;
    localSeedData.wasteData.calculatedChemicals = calculatedChemicals;
    localSeedData.wasteData.calculations = calculations;
    localSeedData.wasteData.wasteClassificationCriterionDetails = criteriaDetails;

    const timestamp = moment().unix();
    localSeedData.lastUpdateTime = timestamp.toString();
    setReadAndWritePermissions(seedFilePath);
    await fs.writeJson(seedFilePath, localSeedData);
    return true;
  } catch (err) {
    uiHelper.showError(err);
  }
}

//helper methods

async function getData(str) {
  const url = `${BASE_URL}/api/updateWaste/${str}`;
  const result = await httpHelper.get(url);
  return result;
}

function setReadAndWritePermissions(filePath) {
  const fs = utils.loadModule('fs-extra');
  const mode = fs.statSync(filePath).mode;
  const newMode = mode | 0o666;
  fs.chmodSync(filePath, newMode);
}
