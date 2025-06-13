import {Workbook, Worksheet} from 'exceljs';
let Excel = require('exceljs');
import seedDataReader from '../../../readers/seedDataReader';

import summarySheetRenderer from '../../../report/summarySheet/summarySheetRenderer';

/* 
  THIS TEST checks if Samples are being merged correctly
*/
const unitMgKg = 'mg/kg';
const unitMgL = 'ug/l';
const unitPercent = '%';
const unitPpm = 'ppm';

describe('should render summary sheet report with merged Samples', () => {
  let wb: Workbook = null;
  let ws: Worksheet = null;

  let seedDataSoil: SoilAssessmentCalculationData = null;

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
    seedDataSoil = seedData.soilData;
  });

  beforeEach(() => {
    jest.setTimeout(50000);
    wb = new Excel.Workbook();
  });

  test('testing: renderSummarySheet() with merged Samples having different units', async () => {
    let dataFolderPath: string = './data';
    let tableNumber: number = 0;
    let showDepthColumn: boolean = true;

    await summarySheetRenderer.renderSummarySheet(
      wb,
      seedDataSoil,
      dataFolderPath,
      reportItems(),
      samples(),
      tableGroups(),
      selectedTableGroupsKeys(),
      tableNumber,
      sessionParameters(),
      showDepthColumn
    );

    ws = wb.worksheets[0];

    expect(ws.getCell('A3').text).toBe('Table 0: Summary of Laboratory Results – Metals');

    // test chemicals names row
    expect(ws.getCell('D7').text).toBe('Arsenic');
    expect(ws.getCell('E7').text).toBe('Beryllium');
    expect(ws.getCell('F7').text).toBe('TCLP Beryllium');
    expect(ws.getCell('G7').text).toBe('Cadmium');

    // test units row
    expect(ws.getCell('D9').text).toBe('mg/kg');
    expect(ws.getCell('E9').text).toBe('mg/kg');
    expect(ws.getCell('F9').text).toBe('mg/L');
    expect(ws.getCell('G9').text).toBe('mg/kg');

    // test result values
    expect(ws.getCell('D10').text).toBe('0.6');
    expect(ws.getCell('E10').text).toBe('0.1');
    expect(ws.getCell('F10').text).toBe('0.77');
    expect(ws.getCell('G10').text).toBe('0.8');

    expect(ws.getCell('D11').text).toBe('6');
    expect(ws.getCell('E11').text).toBe('1');
    expect(ws.getCell('F11').text).toBe('7.7');
    expect(ws.getCell('G11').text).toBe('8');

    expect(ws.getCell('D12').text).toBe('6.6');
    expect(ws.getCell('E12').text).toBe('1.1');
    expect(ws.getCell('F12').text).toBe('-');
    expect(ws.getCell('G12').text).toBe('90.9');

    expect(ws.getCell('D13').text).toBe('-');
    expect(ws.getCell('E13').text).toBe('-');
    expect(ws.getCell('F13').text).toBe('700.07');
    expect(ws.getCell('G13').text).toBe('8.8');

    expect(ws.getCell('D14').text).toBe('-');
    expect(ws.getCell('E14').text).toBe('-');
    expect(ws.getCell('F14').text).toBe('-');
    expect(ws.getCell('G14').text).toBe('110,000');

    expect(ws.getCell('D15').text).toBe('-');
    expect(ws.getCell('E15').text).toBe('-');
    expect(ws.getCell('F15').text).toBe('-');
    expect(ws.getCell('G15').text).toBe('12');
  });
});

function selectedTableGroupsKeys(): string[] {
  return ['Metals_std'];
}

function tableGroups(): ChemicalGroup[] {
  return [
    {
      code: 'Metals_std',
      name: 'Metals',
      description: '9 metals - As, Cd, Cr (VI), Cu, Pb, Mn, Hg, Ni, Zn',
      sortOrder: 1,
      isStandardContaminantSuite: true,

      chemicals: [
        {
          code: '7440-38-2',
          name: 'Arsenic',
          sortOrder: 1,
          chemicalGroup: 'Metals_std',
          calculated: false,
          calculationFormulaType: CalculationFormulaType.NotDefined,
          codeForAssessing: '',
        },
        {
          code: '7440-41-7',
          name: 'Beryllium',
          sortOrder: 2,
          chemicalGroup: 'Metals_std',
          calculated: false,
          calculationFormulaType: CalculationFormulaType.NotDefined,
          codeForAssessing: '',
        },
        {
          code: '7440-43-9',
          name: 'Cadmium',
          sortOrder: 4,
          chemicalGroup: 'Metals_std',
          calculated: false,
          calculationFormulaType: CalculationFormulaType.NotDefined,
          codeForAssessing: '',
        },
      ],
    },
  ];
}

function sessionParameters(): SessionParameters {
  return {
    applyBiodegradation: false,
    highlightAllDetections: true,
    chemicalGroups: {
      Soil: ['Metals_std'],
    } as SessionChemicalGroups,
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
    criteria: [],
    waterAssessmentParameters: {
      waterEnvironment: GwWaterEnvironment.Fresh,
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
}

function samples(): Sample[] {
  return [
    {
      labSampleId: '286813-1',
      labReportNo: null,
      dateSampled: '17/01/22',
      dpSampleId: '286813-1',
      depth: {
        from: 0,
        to: 0.1,
      },
      matrixType: 'Soil',
      sampleType: 'Normal',
      labName: 'Unknown',
      measurements: [
        {
          laboratorySampleId: '286813-1',
          chemical: {
            code: '7440-38-2',
            name: 'Arsenic',
          },
          units: unitMgKg,
          pqlValue: 0.4,
          pqlPrefix: 'less',
          prefix: 'exactValue',
          resultValue: 0.6,
          asbestosValue: null,
          aslpTclpType: null,
          method: null,
        },
        {
          laboratorySampleId: '286813-1',
          chemical: {
            code: '7440-41-7',
            name: 'Beryllium',
          },
          units: unitMgKg,
          pqlValue: 0.5,
          pqlPrefix: 'less',
          prefix: 'exactValue',
          resultValue: 0.1,
          asbestosValue: null,
          aslpTclpType: null,
          method: null,
        },
        {
          laboratorySampleId: '286813-1',
          chemical: {
            code: '7440-41-7',
            name: 'Beryllium',
          },
          units: unitMgL,
          pqlValue: 50,
          pqlPrefix: 'less',
          prefix: 'exactValue',
          resultValue: 770,
          asbestosValue: null,
          aslpTclpType: null,
          method: null,
        },
        {
          laboratorySampleId: '286813-1',
          chemical: {
            code: '7440-43-9',
            name: 'Cadmium',
          },
          units: unitMgKg,
          pqlValue: 0.6,
          pqlPrefix: 'less',
          prefix: 'exactValue',
          resultValue: 0.8,
          asbestosValue: null,
          aslpTclpType: null,
          method: null,
        },
      ],
      hasStandardContaminationChemicals: true,
    },
    {
      labSampleId: '286813-2',
      labReportNo: null,
      dateSampled: '17/01/22',
      dpSampleId: '286813-2',
      depth: {
        from: 0,
        to: 0.1,
      },
      matrixType: 'Soil',
      sampleType: 'Normal',
      labName: 'Unknown',
      measurements: [
        {
          laboratorySampleId: '286813-2',
          chemical: {
            code: '7440-38-2',
            name: 'Arsenic',
          },
          units: unitMgKg,
          pqlValue: 0.4,
          pqlPrefix: 'less',
          prefix: 'exactValue',
          resultValue: 6,
          asbestosValue: null,
          aslpTclpType: null,
          method: null,
        },
        {
          laboratorySampleId: '286813-2',
          chemical: {
            code: '7440-41-7',
            name: 'Beryllium',
          },
          units: unitMgKg,
          pqlValue: 0.5,
          pqlPrefix: 'less',
          prefix: 'exactValue',
          resultValue: 1,
          asbestosValue: null,
          aslpTclpType: null,
          method: null,
        },
        {
          laboratorySampleId: '286813-2',
          chemical: {
            code: '7440-41-7',
            name: 'Beryllium',
          },
          units: unitMgL,
          pqlValue: 50,
          pqlPrefix: 'less',
          prefix: 'exactValue',
          resultValue: 7700,
          asbestosValue: null,
          aslpTclpType: null,
          method: null,
        },
        {
          laboratorySampleId: '286813-2',
          chemical: {
            code: '7440-43-9',
            name: 'Cadmium',
          },
          units: unitMgKg,
          pqlValue: 0.6,
          pqlPrefix: 'less',
          prefix: 'exactValue',
          resultValue: 8,
          asbestosValue: null,
          aslpTclpType: null,
          method: null,
        },
      ],
      hasStandardContaminationChemicals: true,
    },
    {
      labSampleId: '286813-3',
      labReportNo: null,
      dateSampled: '17/01/22',
      dpSampleId: '286813-3',
      depth: {
        from: 0,
        to: 0.1,
      },
      matrixType: 'Soil',
      sampleType: 'Normal',
      labName: 'Unknown',
      measurements: [
        {
          laboratorySampleId: '286813-3',
          chemical: {
            code: '7440-38-2',
            name: 'Arsenic',
          },
          units: unitMgKg,
          pqlValue: 0.4,
          pqlPrefix: 'less',
          prefix: 'exactValue',
          resultValue: 6.6,
          asbestosValue: null,
          aslpTclpType: null,
          method: null,
        },
        {
          laboratorySampleId: '286813-3',
          chemical: {
            code: '7440-41-7',
            name: 'Beryllium',
          },
          units: unitMgKg,
          pqlValue: 0.5,
          pqlPrefix: 'less',
          prefix: 'exactValue',
          resultValue: 1.1,
          asbestosValue: null,
          aslpTclpType: null,
          method: null,
        },
        {
          laboratorySampleId: '286813-3',
          chemical: {
            code: '7440-43-9',
            name: 'Cadmium',
          },
          units: 'ug/kg',
          pqlValue: 0.6,
          pqlPrefix: 'less',
          prefix: 'exactValue',
          resultValue: 90900,
          asbestosValue: null,
          aslpTclpType: null,
          method: null,
        },
      ],
      hasStandardContaminationChemicals: true,
    },
    {
      labSampleId: '286813-5',
      labReportNo: null,
      dateSampled: '17/01/22',
      dpSampleId: '286813-5',
      depth: {
        from: 0,
        to: 0.1,
      },
      matrixType: 'Soil',
      sampleType: 'Normal',
      labName: 'Unknown',
      measurements: [
        {
          laboratorySampleId: '286813-5',
          chemical: {
            code: '7440-41-7',
            name: 'Beryllium',
          },
          units: unitMgL,
          pqlValue: 50,
          pqlPrefix: 'less',
          prefix: 'exactValue',
          resultValue: 700070,
          asbestosValue: null,
          aslpTclpType: null,
          method: null,
        },
        {
          laboratorySampleId: '286813-5',
          chemical: {
            code: '7440-43-9',
            name: 'Cadmium',
          },
          units: unitMgKg,
          pqlValue: 0.6,
          pqlPrefix: 'less',
          prefix: 'exactValue',
          resultValue: 8.8,
          asbestosValue: null,
          aslpTclpType: null,
          method: null,
        },
      ],
      hasStandardContaminationChemicals: true,
    },
    {
      labSampleId: '286813-6',
      labReportNo: null,
      dateSampled: '17/01/22',
      dpSampleId: '286813-6',
      depth: {
        from: 0,
        to: 0.1,
      },
      matrixType: 'Soil',
      sampleType: 'Normal',
      labName: 'Unknown',
      measurements: [
        {
          laboratorySampleId: '286813-6',
          chemical: {
            code: '7440-43-9',
            name: 'Cadmium',
          },
          units: unitPercent,
          pqlValue: 0.6,
          pqlPrefix: 'less',
          prefix: 'exactValue',
          resultValue: 11,
          asbestosValue: null,
          aslpTclpType: null,
          method: null,
        },
      ],
      hasStandardContaminationChemicals: true,
    },
    {
      labSampleId: '286813-7',
      labReportNo: null,
      dateSampled: '17/01/22',
      dpSampleId: '286813-7',
      depth: {
        from: 0,
        to: 0.1,
      },
      matrixType: 'Soil',
      sampleType: 'Normal',
      labName: 'Unknown',
      measurements: [
        {
          laboratorySampleId: '286813-7',
          chemical: {
            code: '7440-43-9',
            name: 'Cadmium',
          },
          units: unitPpm,
          pqlValue: 0.6,
          pqlPrefix: 'less',
          prefix: 'exactValue',
          resultValue: 12,
          asbestosValue: null,
          aslpTclpType: null,
          method: null,
        },
      ],
      hasStandardContaminationChemicals: true,
    },
  ];
}

function reportItems(): ReportItem[] {
  return [
    {
      chemical: 'Arsenic',
      code: '7440-38-2',
      group: 'Metals_std',
      isCalculated: false,
      isCalculable: false,
      units: unitMgKg,
      pqlValue: 0.4,
      pqlPrefix: 'NaN',
      groupSortOrder: 2,
      sortOrder: 1,
      isHiddenInReport: false,
      chemicalCodeForAssessing: '7440-38-2',
      replicates: [],
      extraFields: {
        min: null,
        max: null,
        mean: null,
        standardDeviation: null,
        ucl: null,
      },
      reportCells: {
        '286813-1': {
          value: '0.6',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: true,
          prefix: 'exactValue',
          exceededCriteria: {
            'HEALTH INVESTIGATION LEVELS': [],
            'HEALTH SCREENING LEVELS': [],
            'CRC CARE CRITERIA': [],
            'ECOLOGICAL INVESTIGATION LEVELS': [],
            'ECOLOGICAL SCREENING LEVELS': [],
            'MANAGEMENT LIMITS': [],
            'HSL FOR DEPTH 0-1m': [],
            'ECOLOGICAL INVESTIGATION LEVELS INDIRECT': [],
          },
          criteriaLimits: {
            Health: [
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'HIL A',
                },
                value: 100,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'HIL B',
                },
                value: 500,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'HIL C',
                },
                value: 300,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'HIL D',
                },
                value: 3000,
                units: unitMgKg,
              },
            ],
            Ecological: [
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'EIL AES',
                },

                value: 40,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'EIL UR/POS',
                },

                value: 100,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'EIL C/Ind',
                },

                value: 160,
                units: unitMgKg,
              },
            ],
          },
          displayOptions: null,
        },
        '286813-2': {
          value: '6',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: true,
          prefix: 'exactValue',
          exceededCriteria: {
            'HEALTH INVESTIGATION LEVELS': [],
            'HEALTH SCREENING LEVELS': [],
            'CRC CARE CRITERIA': [],
            'ECOLOGICAL INVESTIGATION LEVELS': [],
            'ECOLOGICAL SCREENING LEVELS': [],
            'MANAGEMENT LIMITS': [],
            'HSL FOR DEPTH 0-1m': [],
            'ECOLOGICAL INVESTIGATION LEVELS INDIRECT': [],
          },
          criteriaLimits: {
            Health: [
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'HIL A',
                },
                value: 100,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'HIL B',
                },
                value: 500,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'HIL C',
                },
                value: 300,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'HIL D',
                },
                value: 3000,
                units: unitMgKg,
              },
            ],
            Ecological: [
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'EIL AES',
                },

                value: 40,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'EIL UR/POS',
                },

                value: 100,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'EIL C/Ind',
                },

                value: 160,
                units: unitMgKg,
              },
            ],
          },
          displayOptions: null,
        },
        '286813-3': {
          value: '6.6',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: true,
          prefix: 'exactValue',
          exceededCriteria: {
            'HEALTH INVESTIGATION LEVELS': [],
            'HEALTH SCREENING LEVELS': [],
            'CRC CARE CRITERIA': [],
            'ECOLOGICAL INVESTIGATION LEVELS': [],
            'ECOLOGICAL SCREENING LEVELS': [],
            'MANAGEMENT LIMITS': [],
            'HSL FOR DEPTH 0-1m': [],
            'ECOLOGICAL INVESTIGATION LEVELS INDIRECT': [],
          },
          criteriaLimits: {
            Health: [
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'HIL A',
                },
                value: 100,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'HIL B',
                },
                value: 500,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'HIL C',
                },
                value: 300,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'HIL D',
                },
                value: 3000,
                units: unitMgKg,
              },
            ],
            Ecological: [
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'EIL AES',
                },

                value: 40,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'EIL UR/POS',
                },

                value: 100,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'EIL C/Ind',
                },

                value: 160,
                units: unitMgKg,
              },
            ],
          },
          displayOptions: null,
        },
        '286813-5': {
          value: 'ND',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: false,
          prefix: '',
          exceededCriteria: {},
          criteriaLimits: {},
          displayOptions: null,
        },
        '286813-6': {
          value: 'ND',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: false,
          prefix: '',
          exceededCriteria: {},
          criteriaLimits: {},
          displayOptions: null,
        },
        '286813-7': {
          value: 'ND',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: false,
          prefix: '',
          exceededCriteria: {},
          criteriaLimits: {},
          displayOptions: null,
        },
      },
      wcType: null,
    },
    {
      chemical: 'Beryllium',
      code: '7440-41-7',
      group: 'Metals_std',
      isCalculated: false,
      isCalculable: false,
      units: unitMgKg,
      pqlValue: 0.5,
      pqlPrefix: 'NaN',
      groupSortOrder: 2,
      sortOrder: 2,
      isHiddenInReport: false,
      chemicalCodeForAssessing: '7440-41-7',
      replicates: [],
      extraFields: {
        min: null,
        max: null,
        mean: null,
        standardDeviation: null,
        ucl: null,
      },
      reportCells: {
        '286813-1': {
          value: '0.1',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: true,
          prefix: 'exactValue',
          exceededCriteria: {
            'HEALTH INVESTIGATION LEVELS': [],
            'HEALTH SCREENING LEVELS': [],
            'CRC CARE CRITERIA': [],
            'ECOLOGICAL INVESTIGATION LEVELS': [],
            'ECOLOGICAL SCREENING LEVELS': [],
            'MANAGEMENT LIMITS': [],
            'HSL FOR DEPTH 0-1m': [],
            'ECOLOGICAL INVESTIGATION LEVELS INDIRECT': [],
          },
          criteriaLimits: {
            Health: [
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'HIL A',
                },
                value: 60,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'HIL B',
                },
                value: 90,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'HIL C',
                },
                value: 90,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'HIL D',
                },
                value: 500,
                units: unitMgKg,
              },
            ],
            Ecological: [],
          },
          displayOptions: null,
        },
        '286813-2': {
          value: '1',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: true,
          prefix: 'exactValue',
          exceededCriteria: {
            'HEALTH INVESTIGATION LEVELS': [],
            'HEALTH SCREENING LEVELS': [],
            'CRC CARE CRITERIA': [],
            'ECOLOGICAL INVESTIGATION LEVELS': [],
            'ECOLOGICAL SCREENING LEVELS': [],
            'MANAGEMENT LIMITS': [],
            'HSL FOR DEPTH 0-1m': [],
            'ECOLOGICAL INVESTIGATION LEVELS INDIRECT': [],
          },
          criteriaLimits: {
            Health: [
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'HIL A',
                },
                value: 60,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'HIL B',
                },
                value: 90,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'HIL C',
                },
                value: 90,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'HIL D',
                },
                value: 500,
                units: unitMgKg,
              },
            ],
            Ecological: [],
          },
          displayOptions: null,
        },
        '286813-3': {
          value: '1.1',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: true,
          prefix: 'exactValue',
          exceededCriteria: {
            'HEALTH INVESTIGATION LEVELS': [],
            'HEALTH SCREENING LEVELS': [],
            'CRC CARE CRITERIA': [],
            'ECOLOGICAL INVESTIGATION LEVELS': [],
            'ECOLOGICAL SCREENING LEVELS': [],
            'MANAGEMENT LIMITS': [],
            'HSL FOR DEPTH 0-1m': [],
            'ECOLOGICAL INVESTIGATION LEVELS INDIRECT': [],
          },
          criteriaLimits: {
            Health: [
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'HIL A',
                },
                value: 60,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'HIL B',
                },
                value: 90,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'HIL C',
                },
                value: 90,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'HIL D',
                },
                value: 500,
                units: unitMgKg,
              },
            ],
            Ecological: [],
          },
          displayOptions: null,
        },
        '286813-5': {
          value: 'ND',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: false,
          prefix: '',
          exceededCriteria: {},
          criteriaLimits: {},
          displayOptions: null,
        },
        '286813-6': {
          value: 'ND',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: false,
          prefix: '',
          exceededCriteria: {},
          criteriaLimits: {},
          displayOptions: null,
        },
        '286813-7': {
          value: 'ND',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: false,
          prefix: '',
          exceededCriteria: {},
          criteriaLimits: {},
          displayOptions: null,
        },
      },
      wcType: null,
    },
    {
      chemical: 'Beryllium',
      code: '7440-41-7',
      group: 'Metals_std',
      isCalculated: false,
      isCalculable: false,
      units: 'mg/L',
      pqlValue: 0.05,
      pqlPrefix: 'NaN',
      groupSortOrder: 2,
      sortOrder: 2,
      isHiddenInReport: false,
      chemicalCodeForAssessing: '7440-41-7',
      replicates: [],
      extraFields: {
        min: null,
        max: null,
        mean: null,
        standardDeviation: null,
        ucl: null,
      },
      reportCells: {
        '286813-1': {
          value: '0.77',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: true,
          prefix: 'exactValue',
          exceededCriteria: {},
          criteriaLimits: {},
          displayOptions: null,
        },
        '286813-2': {
          value: '7.7',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: true,
          prefix: 'exactValue',
          exceededCriteria: {},
          criteriaLimits: {},
          displayOptions: null,
        },
        '286813-3': {
          value: 'ND',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: false,
          prefix: '',
          exceededCriteria: {},
          criteriaLimits: {},
          displayOptions: null,
        },
        '286813-5': {
          value: '700.07',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: true,
          prefix: 'exactValue',
          exceededCriteria: {},
          criteriaLimits: {},
          displayOptions: null,
        },
        '286813-6': {
          value: 'ND',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: false,
          prefix: '',
          exceededCriteria: {},
          criteriaLimits: {},
          displayOptions: null,
        },
        '286813-7': {
          value: 'ND',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: false,
          prefix: '',
          exceededCriteria: {},
          criteriaLimits: {},
          displayOptions: null,
        },
      },
      wcType: AslpTclpType.Tclp,
    },
    {
      chemical: 'Cadmium',
      code: '7440-43-9',
      group: 'Metals_std',
      isCalculated: false,
      isCalculable: false,
      units: unitMgKg,
      pqlValue: 0.6,
      pqlPrefix: 'NaN',
      groupSortOrder: 2,
      sortOrder: 4,
      isHiddenInReport: false,
      chemicalCodeForAssessing: '7440-43-9',
      replicates: [],
      extraFields: {
        min: null,
        max: null,
        mean: null,
        standardDeviation: null,
        ucl: null,
      },
      reportCells: {
        '286813-1': {
          value: '0.8',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: true,
          prefix: 'exactValue',
          exceededCriteria: {
            'HEALTH INVESTIGATION LEVELS': [],
            'HEALTH SCREENING LEVELS': [],
            'CRC CARE CRITERIA': [],
            'ECOLOGICAL INVESTIGATION LEVELS': [],
            'ECOLOGICAL SCREENING LEVELS': [],
            'MANAGEMENT LIMITS': [],
            'HSL FOR DEPTH 0-1m': [],
            'ECOLOGICAL INVESTIGATION LEVELS INDIRECT': [],
          },
          criteriaLimits: {
            Health: [
              {
                criterionDetail: {
                  chemicalCode: '7440-43-9',
                  criterionCode: 'HIL A',
                },
                value: 20,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-43-9',
                  criterionCode: 'HIL B',
                },
                value: 150,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-43-9',
                  criterionCode: 'HIL C',
                },
                value: 90,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-43-9',
                  criterionCode: 'HIL D',
                },
                value: 900,
                units: unitMgKg,
              },
            ],
            Ecological: [],
          },
          displayOptions: null,
        },
        '286813-2': {
          value: '8',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: true,
          prefix: 'exactValue',
          exceededCriteria: {
            'HEALTH INVESTIGATION LEVELS': [],
            'HEALTH SCREENING LEVELS': [],
            'CRC CARE CRITERIA': [],
            'ECOLOGICAL INVESTIGATION LEVELS': [],
            'ECOLOGICAL SCREENING LEVELS': [],
            'MANAGEMENT LIMITS': [],
            'HSL FOR DEPTH 0-1m': [],
            'ECOLOGICAL INVESTIGATION LEVELS INDIRECT': [],
          },
          criteriaLimits: {
            Health: [
              {
                criterionDetail: {
                  chemicalCode: '7440-43-9',
                  criterionCode: 'HIL A',
                },
                value: 20,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-43-9',
                  criterionCode: 'HIL B',
                },
                value: 150,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-43-9',
                  criterionCode: 'HIL C',
                },
                value: 90,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-43-9',
                  criterionCode: 'HIL D',
                },
                value: 900,
                units: unitMgKg,
              },
            ],
            Ecological: [],
          },
          displayOptions: null,
        },
        '286813-3': {
          value: '90.9',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: true,
          prefix: 'exactValue',
          exceededCriteria: {
            'HEALTH INVESTIGATION LEVELS': [
              {
                criterionCode: 'HIL A',
                limitValue: 20,
              },
              {
                criterionCode: 'HIL C',
                limitValue: 90,
              },
            ],
            'HEALTH SCREENING LEVELS': [],
            'CRC CARE CRITERIA': [],
            'ECOLOGICAL INVESTIGATION LEVELS': [],
            'ECOLOGICAL SCREENING LEVELS': [],
            'MANAGEMENT LIMITS': [],
            'HSL FOR DEPTH 0-1m': [],
            'ECOLOGICAL INVESTIGATION LEVELS INDIRECT': [],
          },
          criteriaLimits: {
            Health: [
              {
                criterionDetail: {
                  chemicalCode: '7440-43-9',
                  criterionCode: 'HIL A',
                },
                value: 20,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-43-9',
                  criterionCode: 'HIL B',
                },
                value: 150,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-43-9',
                  criterionCode: 'HIL C',
                },
                value: 90,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-43-9',
                  criterionCode: 'HIL D',
                },
                value: 900,
                units: unitMgKg,
              },
            ],
            Ecological: [],
          },
          displayOptions: null,
        },
        '286813-5': {
          value: '8.8',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: true,
          prefix: 'exactValue',
          exceededCriteria: {
            'HEALTH INVESTIGATION LEVELS': [],
            'HEALTH SCREENING LEVELS': [],
            'CRC CARE CRITERIA': [],
            'ECOLOGICAL INVESTIGATION LEVELS': [],
            'ECOLOGICAL SCREENING LEVELS': [],
            'MANAGEMENT LIMITS': [],
            'HSL FOR DEPTH 0-1m': [],
            'ECOLOGICAL INVESTIGATION LEVELS INDIRECT': [],
          },
          criteriaLimits: {
            Health: [
              {
                criterionDetail: {
                  chemicalCode: '7440-43-9',
                  criterionCode: 'HIL A',
                },
                value: 20,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-43-9',
                  criterionCode: 'HIL B',
                },
                value: 150,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-43-9',
                  criterionCode: 'HIL C',
                },
                value: 90,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-43-9',
                  criterionCode: 'HIL D',
                },
                value: 900,
                units: unitMgKg,
              },
            ],
            Ecological: [],
          },
          displayOptions: null,
        },
        '286813-6': {
          value: '110000',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: true,
          prefix: 'exactValue',
          exceededCriteria: {
            'HEALTH INVESTIGATION LEVELS': [
              {
                criterionCode: 'HIL A',
                limitValue: 20,
              },
              {
                criterionCode: 'HIL B',
                limitValue: 150,
              },
              {
                criterionCode: 'HIL C',
                limitValue: 90,
              },
              {
                criterionCode: 'HIL D',
                limitValue: 900,
              },
            ],
            'HEALTH SCREENING LEVELS': [],
            'CRC CARE CRITERIA': [],
            'ECOLOGICAL INVESTIGATION LEVELS': [],
            'ECOLOGICAL SCREENING LEVELS': [],
            'MANAGEMENT LIMITS': [],
            'HSL FOR DEPTH 0-1m': [],
            'ECOLOGICAL INVESTIGATION LEVELS INDIRECT': [],
          },
          criteriaLimits: {
            Health: [
              {
                criterionDetail: {
                  chemicalCode: '7440-43-9',
                  criterionCode: 'HIL A',
                },
                value: 20,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-43-9',
                  criterionCode: 'HIL B',
                },
                value: 150,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-43-9',
                  criterionCode: 'HIL C',
                },
                value: 90,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-43-9',
                  criterionCode: 'HIL D',
                },
                value: 900,
                units: unitMgKg,
              },
            ],
            Ecological: [],
          },
          displayOptions: null,
        },
        '286813-7': {
          value: '12',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: true,
          prefix: 'exactValue',
          exceededCriteria: {
            'HEALTH INVESTIGATION LEVELS': [],
            'HEALTH SCREENING LEVELS': [],
            'CRC CARE CRITERIA': [],
            'ECOLOGICAL INVESTIGATION LEVELS': [],
            'ECOLOGICAL SCREENING LEVELS': [],
            'MANAGEMENT LIMITS': [],
            'HSL FOR DEPTH 0-1m': [],
            'ECOLOGICAL INVESTIGATION LEVELS INDIRECT': [],
          },
          criteriaLimits: {
            Health: [
              {
                criterionDetail: {
                  chemicalCode: '7440-43-9',
                  criterionCode: 'HIL A',
                },
                value: 20,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-43-9',
                  criterionCode: 'HIL B',
                },
                value: 150,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-43-9',
                  criterionCode: 'HIL C',
                },
                value: 90,
                units: unitMgKg,
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-43-9',
                  criterionCode: 'HIL D',
                },
                value: 900,
                units: unitMgKg,
              },
            ],
            Ecological: [],
          },
          displayOptions: null,
        },
      },
      wcType: null,
    },
  ];
}
