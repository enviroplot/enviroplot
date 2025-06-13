import dataReader from '../readers/seedDataReader';
import gvmntGwDataConvertor from '../readers/gvmntGwDataConvertor';

async function run() {
  let erGwSeedFilePath = './data/seed/SeedData_water.xlsx';
  let gvmntWqGwSeedFilePath = './data/seed/others/toxicant_dgv_mastertable_sept2021.xlsx';
  let chemicalsSeedFilePath = './data/seed/SeedData_chemicals.xlsx';
  let soilAssessmentSeedFilePath = './data/seed/SeedData_soil.xlsx';
  let wasteAssessmentSeedFilePath = './data/seed/SeedData_waste.xlsx';
  let waterAssessmentSeedFilePath = './data/seed/SeedData_water.xlsx';

  try {
    let seedData = await dataReader.readSeedData(
      chemicalsSeedFilePath,
      soilAssessmentSeedFilePath,
      wasteAssessmentSeedFilePath,
      waterAssessmentSeedFilePath
    );
    await gvmntGwDataConvertor.convertToInitialSeedData(seedData, gvmntWqGwSeedFilePath, erGwSeedFilePath);
  } catch (err) {
    console.log(err);
    return;
  }

  console.log('Done!');
}

run();
