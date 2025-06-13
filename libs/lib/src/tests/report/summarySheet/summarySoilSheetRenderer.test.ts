import {Workbook, Worksheet} from 'exceljs';
const Excel = require('exceljs');
import summarySoilSheetRenderer from '../../../report/summarySheet/summarySoilSheetRenderer';
import seedDataReader from '../../../readers/seedDataReader';

describe('should generate correct table1', () => {
  let seedData: SeedData = null;
  let wb: Workbook = new Excel.Workbook();
  let chemicalsSeedFilePath = './data/seed/SeedData_chemicals.xlsx';
  let soilAssessmentSeedFilePath = './data/seed/SeedData_soil.xlsx';
  let wasteAssessmentSeedFilePath = './data/seed/SeedData_waste.xlsx';
  let waterAssessmentSeedFilePath = './data/seed/SeedData_water.xlsx';
  let reportItems: ReportItem[] = [
    {
      chemical: 'Arsenic',
      chemicalCodeForAssessing: '7440-38-2',
      code: '7440-38-2',
      extraFields: {min: null, max: null, mean: null, standardDeviation: null, ucl: null},
      group: 'Metals_std',
      groupSortOrder: 1,
      isCalculated: false,
      isHiddenInReport: false,
      pqlPrefix: 'exactValue',
      pqlValue: 4,
      replicates: [],
      reportCells: {
        '213536-1': {
          criteriaLimits: {
            Ecological: [
              {
                criterionDetail: {chemicalCode: '7440-38-2', criterionCode: 'EIL AES'},
                value: 40,
              },
            ],
            Health: [{criterionDetail: {chemicalCode: '7440-38-2', criterionCode: 'HIL A'}, value: 100}],
          },
          displayOptions: null,
          exceededCriteria: {},
          highlightDetection: true,
          isAsbestosDetected: false,
          isAsbestosValue: false,
          prefix: 'exactValue',
          value: '8',
        },
      },
      sortOrder: 1,
      units: 'mg/kg',
      wcType: null,
    },
  ];
  let samples: Sample[] = [
    {
      dateSampled: '13/03/2019',
      depth: {from: 0, to: 0.1},
      dpSampleId: 'BH101',
      labName: 'Unknown',
      labSampleId: '213536-1',
      matrixType: 'soil',
      labReportNo: null,
      measurements: [
        {
          asbestosValue: 'NAD',
          chemical: {code: 'TA_AS', name: 'Trace Analysis'},
          laboratorySampleId: '213536-1',
          pqlPrefix: 'exactValue',
          pqlValue: null,
          prefix: 'exactValue',
          resultValue: null,
          aslpTclpType: null,
          units: '-',
          method: null,
        },
      ],
      sampleType: 'Normal',
      isTripBlank: true,
      isTripSpike: true,
      soilType: '',
    },
  ];
  let sessionParameters: SessionParameters = {
    applyBiodegradation: false,
    highlightAllDetections: false,
    chemicalGroups: {Soil: ['Metals_std']} as SessionChemicalGroups,
    displayOptions: {
      showDepthColumn: true,
      showStatisticalInfoForContaminants: false,
      showSummaryStatistics: false,
    },
    combinedChemicalsDisplay: {},
    edits: {},
    projectDetails: {
      assessmentType: AssessmentType.Soil,
      state: 'NSW',
      type: '',
      name: '',
      number: '',
      date: '',
      location: '',
    },
    criteria: ['HIL A', 'HSL A/B', 'EIL AES', 'ESL AES'],
    waterAssessmentParameters: {
      waterEnvironment: null,
      levelOfProtection: {
        bioAccumulative: null,
        others: null,
        pfas: null,
      },
      potentialUse: null,
      soilType: null,
      waterDepth: null,
      vapourIntrusionHsl: null,
    },
    reportOutputFormat: ReportOutputFormat.STANDARD_OUTPUT_FORMAT,
  };
  let showDepthColumn: boolean = true;

  beforeAll(async () => {
    jest.setTimeout(50000);
    seedData = await seedDataReader.readSeedData(
      chemicalsSeedFilePath,
      soilAssessmentSeedFilePath,
      wasteAssessmentSeedFilePath,
      waterAssessmentSeedFilePath
    );
  });

  test('renderSoilSummarySheet function', async () => {
    let seedDataSoil: SoilAssessmentCalculationData = seedData.soilData;
    let dataFolderPath: string = './data';
    let tableGroups: ChemicalGroup[] = [
      {
        chemicals: [
          {
            calculated: false,
            calculationFormulaType: CalculationFormulaType.NotDefined,
            chemicalGroup: 'Metals_std',
            code: '7440-38-2',
            codeForAssessing: '',
            name: 'Arsenic',
            sortOrder: 1,
          },
        ],
        code: 'Metals_std',
        description: '9 metals - As, Cd, Cr (VI), Cu, Pb, Mn, Hg, Ni, Zn',
        isStandardContaminantSuite: true,
        name: 'Metals',
        sortOrder: 1,
      },
    ];
    let selectedTableGroupsKeys: string[] = ['Metals_std'];
    let tableNumber: number = 1;

    await summarySoilSheetRenderer.renderSoilSummarySheet(
      wb,
      seedDataSoil,
      dataFolderPath,
      reportItems,
      samples,
      tableGroups,
      selectedTableGroupsKeys,
      tableNumber,
      sessionParameters,
      showDepthColumn
    );

    let ws: Worksheet = wb.getWorksheet(1);
    expect(ws.getCell('A3').text).toBe('Table 1: Summary of Laboratory Results – Metals');
    expect(ws.getCell('D6').text).toBe('Metals');
    expect(ws.getCell('D7').text).toBe('Arsenic');
    expect(ws.getCell('C8').text).toBe('PQL');
    expect(ws.getCell('D8').text).toBe('4');
    expect(ws.getCell('A9').text).toBe('Sample ID');
    expect(ws.getCell('B9').text).toBe('Depth');
    expect(ws.getCell('C9').text).toBe('Sample Date');
    expect(ws.getCell('D9').text).toBe('mg/kg');
    expect(ws.getCell('A10').text).toBe('BH101');
    expect(ws.getCell('B10').text).toBe('0 - 0.1 m');
    expect(ws.getCell('C10').text).toBe('13/03/2019');
    expect(ws.getCell('D10').text).toEqual('8');
    expect(ws.getCell('D11').text).toEqual('100');
    expect(ws.getCell('E11').text).toEqual('40');
  });

  test('addSamplesRow function', () => {
    let ws: Worksheet = wb.getWorksheet(1);

    summarySoilSheetRenderer.addSamplesRow(ws, reportItems, samples, sessionParameters, showDepthColumn);
    expect(ws.getCell('A10').text).toBe('BH101');
    expect(ws.getCell('B10').text).toBe('0 - 0.1 m');
    expect(ws.getCell('C10').text).toBe('13/03/2019');
    expect(ws.getCell('D10').text).toEqual('8');
    expect(ws.getCell('D11').text).toEqual('100');
    expect(ws.getCell('E11').text).toEqual('40');
  });

  test(' addSampleCell function', () => {
    let wb: Workbook = new Excel.Workbook();
    let ws: Worksheet = wb.addWorksheet('test');
    let rowNumber: number = 10;
    let index: number = 0;
    let value: string = 'BH101';

    summarySoilSheetRenderer.addSampleCell(ws, rowNumber, index, value);
    expect(ws.getCell('A10').text).toBe('BH101');
  });

  test('addChemicalCriteria function', () => {
    let wb: Workbook = new Excel.Workbook();
    let ws: Worksheet = wb.addWorksheet('test');
    let rowNumber: number = 11;
    let index: number = 3;
    let reportCellData: ReportCellWithLimits = {
      criteriaLimits: {
        Ecological: [
          {
            criterionDetail: {chemicalCode: '7440-38-2', criterionCode: 'EIL AES'},
            value: 40,
          },
        ],
        Health: [
          {
            criterionDetail: {chemicalCode: '7440-38-2', criterionCode: 'HIL A'},
            value: 100,
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
    let criteria: string[] = ['HIL A', 'EIL AES'];
    let hasHealth: boolean = true;
    let hasEcological: boolean = true;

    summarySoilSheetRenderer.addChemicalCriteria(
      ws,
      rowNumber,
      index,
      reportCellData,
      criteria,
      hasHealth,
      hasEcological
    );
    expect(ws.getCell('D11').text).toBe('100');
    expect(ws.getCell('E11').text).toBe('40');
  });

  test('getCriterionValue function', () => {
    let category: CriterionCategory = CriterionCategory.Health;
    let hasLimit: boolean = true;
    let reportCellData: ReportCellWithLimits = {
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
    let criteriaForValue: string[] = ['HIL A'];
    let calculatedResultValue = summarySoilSheetRenderer.getCriterionValue(
      category,
      hasLimit,
      reportCellData,
      criteriaForValue
    );
    expect(calculatedResultValue).toBe('100');

    let criteriaForDash: string[] = ['EIL AES'];
    let calculatedResultDash = summarySoilSheetRenderer.getCriterionValue(
      category,
      hasLimit,
      reportCellData,
      criteriaForDash
    );
    expect(calculatedResultDash).toBe('-');
  });
});
