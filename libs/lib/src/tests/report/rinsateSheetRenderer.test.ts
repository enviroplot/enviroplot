import {Workbook} from 'exceljs';
import {sessionParametersSoil, reportItems, samples} from '../test_data/rinsateSheetRenderer/data';

import seedDataReader from '../../readers/seedDataReader';
import rinsateSheetGenerator from '../../report/rinsateSheet/rinsateSheetGenerator';

describe('tests for rinsate renderer file', () => {
  const Excel = require('exceljs');

  let seedChemicalGroups: ChemicalGroup[] = null;

  let chemicalsSeedFilePath = './data/seed/SeedData_chemicals.xlsx';
  let soilAssessmentSeedFilePath = './data/seed/SeedData_soil.xlsx';
  let wasteAssessmentSeedFilePath = './data/seed/SeedData_waste.xlsx';
  let waterAssessmentSeedFilePath = './data/seed/SeedData_water.xlsx';

  beforeAll(async () => {
    let seedData: SeedData = null;

    jest.setTimeout(50000);
    seedData = await seedDataReader.readSeedData(
      chemicalsSeedFilePath,
      soilAssessmentSeedFilePath,
      wasteAssessmentSeedFilePath,
      waterAssessmentSeedFilePath
    );
    seedChemicalGroups = seedData.soilData.chemicalGroups;
  });

  test('generate rinsate sheet for soil', async () => {
    let wb: Workbook = new Excel.Workbook();
    let dataFolderPath: string = './data';

    let selectedGroupsKeys: string[] = ['Metals_std', 'BTEX_std'];

    await rinsateSheetGenerator.generateRinsateSheet(
      wb,
      dataFolderPath,
      reportItems,
      samples,
      seedChemicalGroups,
      selectedGroupsKeys,
      sessionParametersSoil
    );

    let rinsateWs = wb.worksheets[0];

    expect(rinsateWs.name).toEqual('Rinsate');
    expect(rinsateWs.getCell('A3').text).toEqual('Table QA4: Rinsate Results – Soil Sampling');
    expect(rinsateWs.getCell('A6').text).toEqual('Sample ID');
    expect(rinsateWs.getCell('B6').text).toEqual('Sample Date');
    expect(rinsateWs.getCell('C6').text).toEqual('Media Being Sampled');
    expect(rinsateWs.getCell('D6').text).toEqual('Units');
    expect(rinsateWs.getCell('F6').text).toEqual('Lab Report No');
    expect(rinsateWs.getCell('F8').text).toEqual('300928');

    expect(rinsateWs.getCell('D8').text).toEqual('mg/l caco3');
    expect(rinsateWs.getCell('E6').text).toEqual('Priority metals');
    expect(rinsateWs.getCell('E7').text).toEqual('Arsenic');
    expect(rinsateWs.getCell('E8').text).toEqual('<4');

    //Second table with another Units

    expect(rinsateWs.getCell('A12').text).toEqual('Sample ID');
    expect(rinsateWs.getCell('B12').text).toEqual('Sample Date');
    expect(rinsateWs.getCell('C12').text).toEqual('Media Being Sampled');
    expect(rinsateWs.getCell('D12').text).toEqual('Units');
    expect(rinsateWs.getCell('G12').text).toEqual('Lab Report No');
    expect(rinsateWs.getCell('G14').text).toEqual('300928');

    expect(rinsateWs.getCell('D14').text).toEqual('mg/kg');
    expect(rinsateWs.getCell('E12').text).toEqual('Priority metals');
    expect(rinsateWs.getCell('E13').text).toEqual('Cadmium');
    expect(rinsateWs.getCell('F12').text).toEqual('BTEX');
    expect(rinsateWs.getCell('F13').text).toEqual('Benzene');
    expect(rinsateWs.getCell('E14').text).toEqual('<0.4');
    expect(rinsateWs.getCell('F14').text).toEqual('<0.2');
  });

  test('should not generate a sheet as no rinsate in the session', async () => {
    let wb: Workbook = new Excel.Workbook();
    let dataFolderPath: string = './data';

    let selectedGroupsKeys: string[] = ['Metals_std', 'BTEX_std'];

    await rinsateSheetGenerator.generateRinsateSheet(
      wb,
      dataFolderPath,
      reportItems,
      [],
      seedChemicalGroups,
      selectedGroupsKeys,
      sessionParametersSoil
    );

    let rinsateWs = wb.worksheets[0];

    expect.not.objectContaining(rinsateWs);
  });
});
