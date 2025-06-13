import seedDataReader from '../readers/seedDataReader';
import utils from '../utils';

const fs = utils.loadModule('fs-extra');

async function run() {
  console.log('Starting Seed file generation...');

  let chemicalsSeedFilePath = './data/seed/SeedData_chemicals.xlsx';
  let soilAssessmentSeedFilePath = './data/seed/SeedData_soil.xlsx';
  let wasteAssessmentSeedFilePath = './data/seed/SeedData_waste.xlsx';
  let waterAssessmentSeedFilePath = './data/seed/SeedData_water.xlsx';
  let destinationPath = './data/seed/seed.json';

  try {
    let seedData = await seedDataReader.readSeedData(
      chemicalsSeedFilePath,
      soilAssessmentSeedFilePath,
      wasteAssessmentSeedFilePath,
      waterAssessmentSeedFilePath
    );
    await fs.writeJson(destinationPath, seedData);
  } catch (err) {
    console.log('ERROR: ', err);
    return;
  }

  console.log('Done!');
}

run();
