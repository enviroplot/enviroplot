import commonSectionsRenderer from '../../report/commonSectionsRenderer';
import {Workbook, Worksheet} from 'exceljs';
import seedDataReader from '../../readers/seedDataReader';
import {reportItems, sessionParametersWater, tableGroups} from '../test_data/parametersForTests';
import helper from '../../report/reportHelper';

describe('tests for commonSectionsRenderer file', () => {
  const Excel = require('exceljs');
  let wb: Workbook = new Excel.Workbook();
  let ws: Worksheet = wb.addWorksheet('test');
  let sessionParameters: SessionParameters = {...sessionParametersWater};
  let seedDataAll: SeedData = null;

  let chemicalsSeedFilePath = './data/seed/SeedData_chemicals.xlsx';
  let soilAssessmentSeedFilePath = './data/seed/SeedData_soil.xlsx';
  let wasteAssessmentSeedFilePath = './data/seed/SeedData_waste.xlsx';
  let waterAssessmentSeedFilePath = './data/seed/SeedData_water.xlsx';

  beforeAll(async () => {
    let seedData: SeedData = null;

    jest.setTimeout(90000);

    seedData = await seedDataReader.readSeedData(
      chemicalsSeedFilePath,
      soilAssessmentSeedFilePath,
      wasteAssessmentSeedFilePath,
      waterAssessmentSeedFilePath
    );
    seedDataAll = seedData;
  });

  test('addSheetHeader function', () => {
    let headerText: string = 'Table 1: Summary of Laboratory Results';

    commonSectionsRenderer.addSheetHeader(ws, headerText);
    expect(ws.getCell('A3').text).toBe('Table 1: Summary of Laboratory Results');
  });

  test('addReportChemicalsHorizontal function', async () => {
    let rowNumber: number = 7;
    let columnIndex: number = 3;
    let numberOfNestedColumns: number = 2;

    await commonSectionsRenderer.addReportChemicalsHorizontal(
      ws,
      rowNumber,
      columnIndex,
      reportItems,
      sessionParameters,
      numberOfNestedColumns
    );
    expect(ws.getCell('D7').text).toBe('Arsenic');
    expect(ws.getCell('F7').text).toBe('TRH C6 - C10');
  });

  test('addReportPQLHorizontal function', async () => {
    let rowNumber: number = 8;
    let columnIndex: number = 3;
    let numberOfNestedColumns: number = 2;

    await commonSectionsRenderer.addReportPQLHorizontal(ws, rowNumber, columnIndex, reportItems, numberOfNestedColumns);
    expect(ws.getCell('C8').text).toBe('PQL');
    expect(ws.getCell('D8').text).toBe('4');
  });

  test('addReportUnitsHorizontal function', () => {
    let rowNumber: number = 9;
    let columnIndex: number = 3;
    let showDepthColumn: boolean = true;
    let numberOfNestedColumns: number = 2;

    commonSectionsRenderer.addReportUnitsHorizontal(
      ws,
      rowNumber,
      columnIndex,
      reportItems,
      showDepthColumn,
      numberOfNestedColumns
    );
    expect(ws.getCell('D9').text).toBe('mg/kg');
    expect(ws.getCell('F9').text).toBe('mg/kg');
  });

  test('addSimpleTableContent function', () => {
    let rowNumberHeader: number = 5;
    let startColumnIndex: number = 0;
    let contentData: any = [
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
    let headersData: KeyLabelItem[] = [
      {key: 'dpId', label: 'Sample ID'},
      {key: 'depth', label: 'Sample Depth'},
      {key: 'soilType', label: 'Soil Type'},
      {key: 'soilTexture', label: 'Soil Texture'},
      {key: 'clayContent', label: 'Clay Content'},
      {key: 'cec', label: 'CEC'},
      {key: 'ph', label: 'pH'},
    ];

    commonSectionsRenderer.addSimpleTableContentHorizontal(
      ws,
      rowNumberHeader,
      startColumnIndex,
      contentData,
      headersData
    );
    expect(ws.getCell('A6').text).toBe('BH101');
    expect(ws.getCell('B6').text).toBe('0 - 0.1 m');
    expect(ws.getCell('C6').text).toBe('Sand');
    expect(ws.getCell('D6').text).toBe('Coarse');
    expect(ws.getCell('E6').text).toBe('10.00');
    expect(ws.getCell('F6').text).toBe('5.00');
    expect(ws.getCell('G6').text).toBe('4.00');
  });

  test('addReportGroupsHorizontal function', () => {
    let groupsRowNumber: number = 6;
    let startColumnIndex: number = 3;
    let nestedColumnsNumber: number = 1;

    commonSectionsRenderer.addReportGroupsHorizontal(
      ws,
      groupsRowNumber,
      startColumnIndex,
      reportItems,
      tableGroups,
      nestedColumnsNumber
    );
    expect(ws.getCell('D6').text).toBe('Metals');
    expect(ws.getCell('E6').text).toBe('TRH');
    expect(ws.getCell('F6').text).toBe('BTEX');
    expect(ws.getCell('G6').text).toBe('PAH');
    expect(ws.getCell('H6').text).toBe('Phenol');
    expect(ws.getCell('I6').text).toBe('OCP');
    expect(ws.getCell('J6').text).toBe('OPP');
    expect(ws.getCell('K6').text).toBe('PCB');
    expect(ws.getCell('L6').text).toBe('Asbestos');
  });

  test('addChemicalValue function', () => {
    let cellAddress: string = 'D10';
    let cellItemWithValue: ReportCellWithLimits = {
      criteriaLimits: {
        Health: [
          {
            criterionDetail: {
              chemicalCode: '7440-38-2',
              criterionCode: 'HIL A',
            },
            value: 100,
          },
        ],
        Ecological: [
          {
            criterionDetail: {
              chemicalCode: '7440-38-2',
              criterionCode: 'EIL AES',
            },
            value: null,
          },
        ],
      },
      displayOptions: null,
      exceededCriteria: {},
      highlightDetection: true,
      isAsbestosDetected: false,
      isAsbestosValue: false,
      prefix: 'exactValue',
      value: '8',
    };

    commonSectionsRenderer.addChemicalValue(ws, cellAddress, cellItemWithValue, sessionParameters);
    expect(ws.getCell('D10').text).toBe('8');
    expect(ws.getCell('D10').style.font.bold).toBeTruthy();

    let cellItemWithValue01 = {...cellItemWithValue};
    cellItemWithValue01.prefix = 'less';
    cellItemWithValue01.value = '0.4';

    commonSectionsRenderer.addChemicalValue(ws, cellAddress, cellItemWithValue01, sessionParameters);
    expect(ws.getCell('D10').text).toBe('<0.4');

    let cellItemWithDash: ReportCellWithLimits = {...cellItemWithValue};
    cellItemWithDash.value = 'ND';
    commonSectionsRenderer.addChemicalValue(ws, cellAddress, cellItemWithDash, sessionParameters);
    expect(ws.getCell('D10').text).toBe('-');
  });

  test('mergeNestedColumns function', () => {
    let wb: Workbook = new Excel.Workbook();
    let ws: Worksheet = wb.addWorksheet('test');
    let rowNumber: number = 8;
    let columnIndex: number = 3;
    let numberOfNestedColumns: number = 2;
    let firstCellAddress: string = 'D8';

    commonSectionsRenderer.mergeNestedColumns(ws, rowNumber, columnIndex, numberOfNestedColumns, firstCellAddress);
    expect(ws.getCell('E8').master).toBe(ws.getCell('D8'));

    let numberOfNestedColumns1: number = 1;

    commonSectionsRenderer.mergeNestedColumns(ws, rowNumber, columnIndex, numberOfNestedColumns1, firstCellAddress);
    expect(ws.getCell('D8').master).toBe(ws.getCell('D8'));
  });

  test('addReportFooter function', () => {
    let lastRow: number = 44;
    let startColumnIndex: number = 0;
    let sessionParameters: SessionParameters = {...sessionParametersWater};
    sessionParameters.projectDetails.assessmentType = AssessmentType.Soil;

    const isPhenolsPresent = helper.isPhenolsInReportItems(reportItems);
    commonSectionsRenderer.addReportFooter(
      ws,
      lastRow,
      startColumnIndex,
      seedDataAll.soilData,
      sessionParameters,
      isPhenolsPresent
    );
    expect(ws.getCell('A44').text).toBe('Notes:');
    expect(ws.getCell('A45').text).toBe('a');
    expect(ws.getCell('B45').text).toBe('QA/QC replicate of sample listed directly below the primary sample');
    expect(ws.getCell('A50').text).toBe('Site Assessment Criteria (SAC):');
    expect(ws.getCell('A52').text).toBe(
      'Refer to the SAC section of report for information of SAC sources and rationale.  Summary information as follows:'
    );
    expect(ws.getCell('A51').text).toBe('SAC based on generic land use thresholds for:  [user input required]');
  });

  test('addProjectDetails function', () => {
    let projectDetails: ProjectDetails = {
      assessmentType: AssessmentType.Soil,
      state: 'NSW',
      type: 'type',
      name: 'name',
      number: 'number',
      location: 'location',
      date: 'date',
    };
    let lastColumn: number = 31;

    commonSectionsRenderer.addProjectDetails(ws, projectDetails, lastColumn);
    expect(ws.getCell('B63').text).toBe('type');
    expect(ws.getCell('Q63').text).toBe('number');
    expect(ws.getCell('B64').text).toBe('location');
    expect(ws.getCell('Q64').text).toBe('date');
  });

  test('addReportGroupsVertical function', () => {
    let rowNumber: number = 9;
    let startCell: number = 0;

    commonSectionsRenderer.addReportGroupsVertical(ws, rowNumber, startCell, reportItems, tableGroups);
    expect(ws.getCell('A9').text).toBe('Metals');
    expect(ws.getCell('A10').text).toBe('TRH');
    expect(ws.getCell('A11').text).toBe('BTEX');
    expect(ws.getCell('A12').text).toBe('PAH');
    expect(ws.getCell('A13').text).toBe('Phenol');
    expect(ws.getCell('A14').text).toBe('OCP');
    expect(ws.getCell('A15').text).toBe('OPP');
    expect(ws.getCell('A16').text).toBe('PCB');
    expect(ws.getCell('A17').text).toBe('Asbestos');
  });

  test('addReportChemicalsVertical function', () => {
    let rowNumber: number = 9;
    let reportChemicalsCellIndex: number = 1;

    commonSectionsRenderer.addReportChemicalsVertical(
      ws,
      rowNumber,
      reportChemicalsCellIndex,
      reportItems,
      sessionParametersWater
    );
    expect(ws.getCell('B9').text).toBe('Arsenic');
    expect(ws.getCell('B10').text).toBe('TRH C6 - C10');
    expect(ws.getCell('B11').text).toBe('Benzene');
  });

  test('addReportUnitsVertical function', () => {
    let rowNumber: number = 9;
    let unitsCellIndex: number = 3;

    commonSectionsRenderer.addReportUnitsVertical(ws, rowNumber, unitsCellIndex, reportItems);
    expect(ws.getCell('D9').text).toBe('mg/kg');
  });
});
