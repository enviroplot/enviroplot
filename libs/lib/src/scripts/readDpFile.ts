import importDpService from '../import/importDPService';
import utils from '../utils';
const fs = utils.loadModule('fs-extra');

async function run() {
  let dpFilePath = './local/files/Douglas.xlsx';

  let seedDataPath = './data/seed/seed.json';

  try {
    let seedData: SeedData = await fs.readJson(seedDataPath);
    let data: InputFileParsingResult = await importDpService.readExcelFileNormalValues(
      dpFilePath,
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
