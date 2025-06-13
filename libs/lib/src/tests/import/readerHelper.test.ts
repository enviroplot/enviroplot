import * as _ from 'lodash';
import {Workbook} from 'exceljs';
import readerHelper from '../../import/readerHelper';

import * as constants from '../../constants/constants';
let exceljs = require('exceljs');

const INCORRECT_DEPTH_FORMAT = `Incorrect depth ranges in 3 samples, modify depths in file and try to import again. \n
    Common issues to check:
      -‘Depth From’ must be less than ‘Depth To’
      - Depth field should contain numbers, dashes or be blank.`;

describe('should parse depth data string from input files correctly', () => {
  test('should successfully parse input 1-2 (from:1 to:2)', async () => {
    let result = readerHelper.parseDepthData('1-2');
    expect(result.isSuccessfulParse).toBeTruthy;
    expect(result.depth.from).toBe(1);
    expect(result.depth.to).toBe(2);
  });

  test('should successfully parse input 4 (from:4 to:4)', async () => {
    let result = readerHelper.parseDepthData('4');
    expect(result.isSuccessfulParse).toBeTruthy;
    expect(result.depth.from).toBe(4);
    expect(result.depth.to).toBe(4);
  });

  test('should successfully parse input 3-3 (from:3, to:3)', async () => {
    let result = readerHelper.parseDepthData('3-3');
    expect(result.isSuccessfulParse).toBeTruthy;
    expect(result.depth.from).toBe(3);
    expect(result.depth.to).toBe(3);
  });

  test('should unsuccessfully parse 2-1 (from > to)', async () => {
    let result = readerHelper.parseDepthData('2-1');
    expect(result.isSuccessfulParse).toBeFalsy;
    expect(result.depth).toBeUndefined;
  });

  test('should unsuccessfully parse inputted strings', async () => {
    let result = readerHelper.parseDepthData('test-test');
    expect(result.isSuccessfulParse).toBeFalsy;
    expect(result.depth).toBeUndefined;
  });

  test('should successfully parse missing depth', async () => {
    let result = readerHelper.parseDepthData('');
    expect(result.isSuccessfulParse).toBeTruthy;
    expect(result.depth.from).toBe(0);
    expect(result.depth.to).toBe(0);
  });
});

describe('should validate depths in input excel', () => {
  test('should successfully parse depths in provided dp file', async () => {
    let workbook: Workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile('./lib/src/tests/import/tests_data/DP_all_depths_correct.xlsx');
    let ws = workbook.worksheets[0];
    let info = await readerHelper.validateDepthsInWorksheet(ws, LabFileType.DOUGLAS, 0);
    expect(info.messages.length === 0).toBeTruthy;
  });

  test('should validate that 3 depths are wrong', async () => {
    let workbook: Workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile('./lib/src/tests/import/tests_data/DP_three_depths_incorrect.xlsx');
    let ws = workbook.worksheets[0];
    let info = await readerHelper.validateDepthsInWorksheet(ws, LabFileType.DOUGLAS, 0);
    console.log(info);
    expect(info.messages[0].text).toBe(INCORRECT_DEPTH_FORMAT);
  });
});

describe('should validate data file excel', () => {
  test('should check titles from data excel file', async () => {
    let workbook: Workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile('./lib/src/tests/import/tests_data/DP_correct_data_file.xlsx');
    let ws = workbook.worksheets[0];
    expect(ws.getCell('A1').text).toBe(constants.excelTitles.Reference);
    expect(ws.getCell('B1').text).toBe(constants.excelTitles.Details);
    expect(ws.getCell('C1').text).toBe(constants.excelTitles.SampleCode);
    expect(ws.getCell('D1').text).toBe(constants.excelTitles.SampleDescription);
    expect(ws.getCell('E1').text).toBe(constants.excelTitles.SampleNo);
    expect(ws.getCell('F1').text).toBe(constants.excelTitles.Replicate);
    expect(ws.getCell('G1').text).toBe(constants.excelTitles.Depth);
  });

  test('should let pass DP Lab file with blank first rows', async () => {
    let workbook: Workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile('./lib/src/tests/import/tests_data/DP_correct_data_file_with_blank_rows.xlsx');
    let ws = workbook.worksheets[0];
    const rowsToSkip = await readerHelper.getDPBlankRowsToSkip(ws);
    expect(rowsToSkip).toBe(3);
    expect(ws.getCell('A4').text).toBe(constants.excelTitles.Reference);
    expect(ws.getCell('B4').text).toBe(constants.excelTitles.Details);
    expect(ws.getCell('C4').text).toBe(constants.excelTitles.SampleCode);
  });

  test('should check incorrect data file excel', async () => {
    let workbook: Workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile('./lib/src/tests/import/tests_data/REPORT_incorrect_data_file.xlsx');
    let ws = workbook.worksheets[0];

    const readResult = await readerHelper.validateDataInWorksheet(ws, 0);
    console.log(readResult);
    expect(readResult.messages[0].messageType).toBe('Error');
    expect(ws.getCell('A1').text).not.toBe(constants.excelTitles.Reference);
    expect(ws.getCell('B1').text).not.toBe(constants.excelTitles.Details);
    expect(ws.getCell('C1').text).not.toBe(constants.excelTitles.SampleCode);
    expect(ws.getCell('D1').text).not.toBe(constants.excelTitles.SampleDescription);
    expect(ws.getCell('E1').text).not.toBe(constants.excelTitles.SampleNo);
    expect(ws.getCell('F1').text).not.toBe(constants.excelTitles.Replicate);
    expect(ws.getCell('G1').text).not.toBe(constants.excelTitles.Depth);
  });
});

describe('should validate units in DP Lab files', () => {
  test('should check units from Kilos (Kg) units DP Lab file', async () => {
    let workbook: Workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile('./lib/src/tests/import/tests_data/DP_units.xlsx');
    let ws = workbook.worksheets[0]; // 1st out of 3 sheets
    expect(ws.getCell('K3').text).toBe('mg/kg');
    expect(ws.getCell('L3').text).toBe('MG/KG');
    expect(ws.getCell('M3').text).toBe('%');
    expect(ws.getCell('N3').text).toBe('percent');
    expect(ws.getCell('O3').text).toBe('ug/kg');
    expect(ws.getCell('P3').text).toBe('μg/kg');
    expect(ws.getCell('Q3').text).toBe('�g/kg');
    expect(ws.getCell('R3').text).toBe('μG/KG');
    expect(ws.getCell('S3').text).toBe('UG/KG');
    expect(ws.getCell('T3').text).toBe('µG/KG');
  });

  test('should check units from Litres (L) units DP Lab file', async () => {
    let workbook: Workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile('./lib/src/tests/import/tests_data/DP_units.xlsx');
    let ws = workbook.worksheets[1]; // 2nd out of 3 sheets

    expect(ws.getCell('K3').text).toBe('mg/L');
    expect(ws.getCell('L3').text).toBe('MG/L');
    expect(ws.getCell('M3').text).toBe('mg/l');

    expect(ws.getCell('N3').text).toBe('μg/L');
    expect(ws.getCell('O3').text).toBe('μG/L');
    expect(ws.getCell('P3').text).toBe('μg/l');
    expect(ws.getCell('Q3').text).toBe('ug/l');
    expect(ws.getCell('R3').text).toBe('UG/L');
  });

  test('should check units from different units DP Lab file', async () => {
    let workbook: Workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile('./lib/src/tests/import/tests_data/DP_units.xlsx');
    let ws = workbook.worksheets[2]; // 3rd out of 3 sheets

    expect(ws.getCell('K3').text).toBe('cmol/kg');
    expect(ws.getCell('L3').text).toBe('CMOL/KG');
    expect(ws.getCell('M3').text).toBe('cmolc/kg');

    expect(ws.getCell('N3').text).toBe('meq/100g');
    expect(ws.getCell('O3').text).toBe('MEQ/100G');

    expect(ws.getCell('P3').text).toBe('ppm');
    expect(ws.getCell('Q3').text).toBe('PPM');
    expect(ws.getCell('R3').text).toBe('ppb');
    expect(ws.getCell('S3').text).toBe('PPB');
  });
});
