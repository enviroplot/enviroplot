import {Workbook} from 'exceljs';
import relativePercentageSheetGenerator from '../../report/relativePercentageSheet/relativePercentageSheetGenerator';
import {sessionParametersSoil, reportItems, samples} from '../test_data/relativePercentageSheetRenderer/data';

import seedDataReader from '../../readers/seedDataReader';
import testsHelper from '../testsHelper';

describe('tests for relative percentage file', () => {
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

  test('generate relative percentage data sheet for soil', async () => {
    let wb: Workbook = new Excel.Workbook();
    let dataFolderPath: string = './data';

    let selectedGroupsKeys: string[] = ['Metals_std', 'BTEX_std'];

    await relativePercentageSheetGenerator.generateRPDTable(
      wb,
      dataFolderPath,
      reportItems,
      samples,
      seedChemicalGroups,
      selectedGroupsKeys,
      sessionParametersSoil,
      true
    );

    let rinsateWs = wb.worksheets[0];

    expect(rinsateWs.name).toEqual('RPD');
    expect(rinsateWs.getCell('A3').text).toEqual('Table QA1: Relative Percentage Difference Results – Soil Sampling');
    expect(rinsateWs.getCell('A6').text).toEqual('Lab Report No');
    expect(rinsateWs.getCell('B6').text).toEqual('Sample ID');
    expect(rinsateWs.getCell('C6').text).toEqual('Depth');
    expect(rinsateWs.getCell('D6').text).toEqual('Sample Date');
    expect(rinsateWs.getCell('E6').text).toEqual('Sample Type');
    expect(rinsateWs.getCell('F6').text).toEqual('Units');

    expect(rinsateWs.getCell('A9').text).toEqual('300928');
    expect(rinsateWs.getCell('A10').text).toEqual('300928');
    expect(rinsateWs.getCell('B9').text).toEqual('SP21-2');
    expect(rinsateWs.getCell('B10').text).toEqual('SP21-1');
    expect(rinsateWs.getCell('C9').text).toEqual('0 m');
    expect(rinsateWs.getCell('C10').text).toEqual('0 m');
    expect(rinsateWs.getCell('D9').text).toEqual('20/07/22');
    expect(rinsateWs.getCell('D10').text).toEqual('20/07/22');
    expect(rinsateWs.getCell('D11').text).toEqual('Difference');
    expect(rinsateWs.getCell('D12').text).toEqual('RPD');
    expect(rinsateWs.getCell('E9').text).toEqual('Soil');
    expect(rinsateWs.getCell('E10').text).toEqual('Soil');
    expect(rinsateWs.getCell('F9').text).toEqual('mg/l caco3');
    expect(rinsateWs.getCell('F10').text).toEqual('mg/l caco3');

    expect(rinsateWs.getCell('G6').text).toEqual('Priority metals');
    expect(rinsateWs.getCell('G7').text).toEqual('Arsenic');
    expect(rinsateWs.getCell('G10').text).toEqual('100');
    expect(rinsateWs.getCell('G9').text).toEqual('20');
    expect(rinsateWs.getCell('G11').text).toEqual('80');
    expect(rinsateWs.getCell('G12').text).toEqual('133%');

    //Second table with another Units

    expect(rinsateWs.getCell('A16').text).toEqual('Lab Report No');
    expect(rinsateWs.getCell('B16').text).toEqual('Sample ID');
    expect(rinsateWs.getCell('C16').text).toEqual('Depth');
    expect(rinsateWs.getCell('D16').text).toEqual('Sample Date');
    expect(rinsateWs.getCell('E16').text).toEqual('Sample Type');
    expect(rinsateWs.getCell('F16').text).toEqual('Units');

    expect(rinsateWs.getCell('A19').text).toEqual('300928');
    expect(rinsateWs.getCell('A20').text).toEqual('300928');
    expect(rinsateWs.getCell('B20').text).toEqual('SP21-1');
    expect(rinsateWs.getCell('B19').text).toEqual('SP21-2');
    expect(rinsateWs.getCell('C19').text).toEqual('0 m');
    expect(rinsateWs.getCell('C20').text).toEqual('0 m');
    expect(rinsateWs.getCell('D19').text).toEqual('20/07/22');
    expect(rinsateWs.getCell('D20').text).toEqual('20/07/22');
    expect(rinsateWs.getCell('D21').text).toEqual('Difference');
    expect(rinsateWs.getCell('D22').text).toEqual('RPD');
    expect(rinsateWs.getCell('E19').text).toEqual('Soil');
    expect(rinsateWs.getCell('E20').text).toEqual('Soil');

    expect(rinsateWs.getCell('F19').text).toEqual('mg/kg');
    expect(rinsateWs.getCell('F20').text).toEqual('mg/kg');

    expect(rinsateWs.getCell('G16').text).toEqual('Priority metals');
    expect(rinsateWs.getCell('G17').text).toEqual('Cadmium');
    expect(rinsateWs.getCell('G20').text).toEqual('100');
    expect(rinsateWs.getCell('G19').text).toEqual('200');
    expect(rinsateWs.getCell('G21').text).toEqual('100');
    expect(rinsateWs.getCell('G22').text).toEqual('67%');

    expect(rinsateWs.getCell('H16').text).toEqual('BTEX');
    expect(rinsateWs.getCell('H17').text).toEqual('Benzene');
    expect(rinsateWs.getCell('H20').text).toEqual('<0.2');
    expect(rinsateWs.getCell('H19').text).toEqual('<0.01');
    expect(rinsateWs.getCell('H21').text).toEqual('0.19');
    expect(rinsateWs.getCell('H22').text).toEqual('181%');
  });

  test('should show detections in bold (if selected for session parameters)', async () => {
    let wb: Workbook = new Excel.Workbook();
    let dataFolderPath: string = './data';

    let selectedGroupsKeys: string[] = ['Metals_std', 'BTEX_std'];

    await relativePercentageSheetGenerator.generateRPDTable(
      wb,
      dataFolderPath,
      reportItems,
      samples,
      seedChemicalGroups,
      selectedGroupsKeys,
      sessionParametersSoil,
      true
    );

    let rinsateWs = wb.worksheets[0];

    expect(rinsateWs.getCell('G19').font.bold).toBeTruthy();
    expect(rinsateWs.getCell('G20').font.bold).toBeTruthy();
    expect(rinsateWs.getCell('G22').font.bold).toBeTruthy();

    expect(rinsateWs.getCell('H19').font.bold).toBeFalsy();
    expect(rinsateWs.getCell('H20').font.bold).toBeFalsy();
  });
});

describe('tests for relative percentage file TRANSPOSED', () => {
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

  test('generate relative percentage data TRANSPOSE sheet for soil', async () => {
    let wb: Workbook = new Excel.Workbook();
    let dataFolderPath: string = './data';

    let selectedGroupsKeys: string[] = ['Metals_std', 'BTEX_std'];

    sessionParametersSoil.reportOutputFormat = ReportOutputFormat.TRANSPOSED_OUTPUT_FORMAT;

    await relativePercentageSheetGenerator.generateRPDTable(
      wb,
      dataFolderPath,
      reportItems,
      samples,
      seedChemicalGroups,
      selectedGroupsKeys,
      sessionParametersSoil,
      true
    );

    let ws = wb.worksheets[0];

    testsHelper.writeReport(wb);

    expect(ws.name).toEqual('RPD');
    expect(ws.getCell('A3').text).toEqual('Table QA1: Relative Percentage Difference Results – Soil Sampling');
    expect(ws.getCell('A7').text).toEqual('Lab Report No');
    expect(ws.getCell('A8').text).toEqual('Sample ID');
    expect(ws.getCell('A9').text).toEqual('Depth');
    expect(ws.getCell('A10').text).toEqual('Sample Date');
    expect(ws.getCell('A11').text).toEqual('Sample Type');
    expect(ws.getCell('A12').text).toEqual('Units');

    expect(ws.getCell('C7').text).toEqual('300928');
    expect(ws.getCell('D7').text).toEqual('300928');
    expect(ws.getCell('C8').text).toEqual('SP21-2');
    expect(ws.getCell('D8').text).toEqual('SP21-1');
    expect(ws.getCell('C9').text).toEqual('0 m');
    expect(ws.getCell('D9').text).toEqual('0 m');
    expect(ws.getCell('C10').text).toEqual('20/07/22');
    expect(ws.getCell('D10').text).toEqual('20/07/22');
    expect(ws.getCell('E10').text).toEqual('Difference');
    expect(ws.getCell('F10').text).toEqual('RPD');
    expect(ws.getCell('C11').text).toEqual('Soil');
    expect(ws.getCell('D11').text).toEqual('Soil');
    expect(ws.getCell('C12').text).toEqual('mg/l caco3');
    expect(ws.getCell('D12').text).toEqual('mg/l caco3');
    expect(ws.getCell('F12').text).toEqual('%');

    expect(ws.getCell('A13').text).toEqual('Priority metals');
    expect(ws.getCell('B13').text).toEqual('Arsenic');
    expect(ws.getCell('C13').text).toEqual('20');
    expect(ws.getCell('D13').text).toEqual('100');
    expect(ws.getCell('E13').text).toEqual('80');
    expect(ws.getCell('F13').text).toEqual('133%');
  });
});
