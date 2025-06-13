import dtSheetRenderer from '../../report/dtSheetRenderer';
import {Workbook, Worksheet} from 'exceljs';
import {sessionParametersWater} from '../test_data/parametersForTests';

describe('tests for dtSheetRenderer file', () => {
  const Excel = require('exceljs');
  let wb: Workbook = new Excel.Workbook();
  let ws: Worksheet = wb.addWorksheet('test');
  let sampleParametersData: SampleParameterItem[] = [
    {
      cec: '5.00',
      clayContent: '10.00',
      depth: '0 - 0.1 m',
      dpId: 'BH101',
      labId: '213536-1',
      ph: '4.00',
      soilTexture: 'Coarse',
      soilType: 'Sand',
    },
  ];

  test('generateSheetDT function', () => {
    let dataFolderPath: string = './data';
    let sessionParametersSoil: SessionParameters = {...sessionParametersWater};
    sessionParametersSoil.projectDetails.assessmentType = AssessmentType.Soil;

    dtSheetRenderer.generate(wb, dataFolderPath, sampleParametersData, sessionParametersSoil);
    expect(wb.worksheets[1].name).toBe('Derivation table');
    expect(wb.worksheets[1].getCell('A3').text).toBe('Table A1: Derivation Table');

    expect(wb.worksheets[1].getCell('A5').text).toBe('Sample ID');
    expect(wb.worksheets[1].getCell('A5').font.size).toEqual(7);
    expect(wb.worksheets[1].getCell('A6').text).toBe('BH101');
    expect(wb.worksheets[1].getCell('A6').font.size).toEqual(7);
  });

  test('addDerivationTable function', () => {
    let rowNumberHeader: number = 5;
    let startCellIndex: number = 0;
    let headersData: any[] = [
      {key: 'dpId', name: 'Sample ID'},
      {key: 'depth', name: 'Sample Depth'},
      {key: 'soilType', name: 'Soil Type'},
      {key: 'soilTexture', name: 'Soil Texture'},
      {key: 'clayContent', name: 'Clay Content'},
      {key: 'cec', name: 'CEC'},
      {key: 'ph', name: 'pH'},
    ];

    dtSheetRenderer.addDerivationTable(ws, rowNumberHeader, startCellIndex, sampleParametersData, headersData);
    expect(ws.getCell('A5').text).toBe('Sample ID');
    expect(ws.getCell('A5').font.size).toEqual(7);
    expect(ws.getCell('A6').text).toBe('BH101');
    expect(ws.getCell('A6').font.size).toEqual(7);

    expect(ws.getCell('B5').text).toBe('Sample Depth');
    expect(ws.getCell('B5').font.size).toEqual(7);
    expect(ws.getCell('B6').text).toBe('0 - 0.1 m');
    expect(ws.getCell('B6').font.size).toEqual(7);

    expect(ws.getCell('C5').text).toBe('Soil Type');
    expect(ws.getCell('C5').font.size).toEqual(7);
    expect(ws.getCell('C6').text).toBe('Sand');
    expect(ws.getCell('C6').font.size).toEqual(7);

    expect(ws.getCell('D5').text).toBe('Soil Texture');
    expect(ws.getCell('D5').font.size).toEqual(7);
    expect(ws.getCell('D6').text).toBe('Coarse');
    expect(ws.getCell('D6').font.size).toEqual(7);

    expect(ws.getCell('E5').text).toBe('Clay Content');
    expect(ws.getCell('E5').font.size).toEqual(7);
    expect(ws.getCell('E6').text).toBe('10.00');
    expect(ws.getCell('E6').font.size).toEqual(7);

    expect(ws.getCell('F5').text).toBe('CEC');
    expect(ws.getCell('F5').font.size).toEqual(7);
    expect(ws.getCell('F6').text).toBe('5.00');
    expect(ws.getCell('F6').font.size).toEqual(7);

    expect(ws.getCell('G5').text).toBe('pH');
    expect(ws.getCell('G5').font.size).toEqual(7);
    expect(ws.getCell('G6').text).toBe('4.00');
    expect(ws.getCell('G6').font.size).toEqual(7);
  });
});
