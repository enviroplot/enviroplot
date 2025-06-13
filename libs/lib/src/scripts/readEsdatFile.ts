import importEsdatService from '../import/importEsdatService';

import utils from '../utils';
const fs = utils.loadModule('fs-extra');

async function run() {
  let esdatSamplePath = './local/files/01.Sample27.csv';
  let esdatChemistryPath = './local/files/01.Chemistry27.csv';
  let seedDataPath = './data/seed/seed.json';

  try {
    let seedData: SeedData = await fs.readJson(seedDataPath);
    let data = await importEsdatService.readCSVFileNormalValues(
      esdatSamplePath,
      esdatChemistryPath,
      true,
      AssessmentType.Soil,
      seedData.soilData
    );
    console.log('run -> data', data);
    console.log('Done!');
  } catch (err) {
    console.log(err);
    return;
  }
}

run();
