import {Workbook, Worksheet} from 'exceljs';
let Excel = require('exceljs');
import seedDataReader from '../../../readers/seedDataReader';

import summarySheetRenderer from '../../../report/summarySheet/summarySheetRenderer';

/* 
  THIS TEST CONTAINS 'ug/l' UNITS FOR INPUT DATA and checks whether they are successfully converted
  to standard 'mg/L' units. Also, TCLP columns should be created correspondingly
*/
const unitUGL = 'ug/l';

describe('should render summary sheet report with TCLP chems', () => {
  let wb: Workbook = null;
  let ws: Worksheet = null;

  let seedDataWaste: WasteClassificationCalculationData = null;

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
    seedDataWaste = seedData.wasteData;
  });

  beforeEach(() => {
    jest.setTimeout(50000);
    wb = new Excel.Workbook();
  });

  test('testing: renderSummarySheet() with TCLP chemicals and ug/l units converted to standard mg/L', async () => {
    let dataFolderPath: string = './data';
    let tableNumber: number = 0;
    let showDepthColumn: boolean = true;

    await summarySheetRenderer.renderSummarySheet(
      wb,
      seedDataWaste,
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
    expect(ws.getCell('E7').text).toBe('TCLP Arsenic');
    expect(ws.getCell('F7').text).toBe('Beryllium');
    expect(ws.getCell('G7').text).toBe('TCLP Beryllium');

    // test units row
    expect(ws.getCell('D9').text).toBe('mg/kg');
    expect(ws.getCell('E9').text).toBe('mg/L');
    expect(ws.getCell('F9').text).toBe('mg/kg');
    expect(ws.getCell('G9').text).toBe('mg/L');

    // test result values
    expect(ws.getCell('D10').text).toBe('0.6');
    expect(ws.getCell('E10').text).toBe('0.00022');
    expect(ws.getCell('F10').text).toBe('0.8');
    expect(ws.getCell('G10').text).toBe('0.55');

    expect(ws.getCell('D11').text).toBe('6');
    expect(ws.getCell('E11').text).toBe('0.002');
    expect(ws.getCell('F11').text).toBe('8');
    expect(ws.getCell('G11').text).toBe('5');

    expect(ws.getCell('D12').text).toBe('6.6');
    expect(ws.getCell('E12').text).toBe('0.022');
    expect(ws.getCell('F12').text).toBe('8.8');
    expect(ws.getCell('G12').text).toBe('55');
  });
});

function selectedTableGroupsKeys(): string[] {
  return ['Metals'];
}

function tableGroups(): ChemicalGroup[] {
  return [
    {
      code: 'Metals',
      name: 'Metals',
      description: 'As, Cd, Cr (VI), Pb, Hg, Ni',
      sortOrder: 1,
      isStandardContaminantSuite: true,

      chemicals: [
        {
          code: '7440-38-2',
          name: 'Arsenic',
          sortOrder: 1,
          chemicalGroup: 'Metals',
          calculated: false,
          calculationFormulaType: CalculationFormulaType.NotDefined,
          codeForAssessing: '',
        },
        {
          code: '7440-41-7',
          name: 'Beryllium',
          sortOrder: 2,
          chemicalGroup: 'Metals',
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
      Waste: [
        'Metals',
        'TRH',
        'TPH_SG',
        'BTEX',
        'PAH',
        'Phenol',
        'OCP',
        'OPP',
        'PCB',
        'Asbestos',
        'Non-Metals',
        'VOC',
        'PFAS',
        'Plasticer Compounds',
      ],
    } as SessionChemicalGroups,
    displayOptions: {
      showDepthColumn: true,
      showStatisticalInfoForContaminants: false,
      showSummaryStatistics: false,
    },
    combinedChemicalsDisplay: {},
    edits: {},
    projectDetails: {
      assessmentType: AssessmentType.Waste,
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
      dateSampled: '17/01/22',
      dpSampleId: '286813-1',
      labReportNo: null,
      depth: {
        from: 0,
        to: 0.1,
      },
      matrixType: 'Waste',
      sampleType: 'Normal',
      labName: 'Unknown',
      measurements: [
        {
          laboratorySampleId: '286813-1',
          chemical: {
            code: '7440-38-2',
            name: 'Arsenic',
          },
          units: 'mg/kg',
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
          units: 'mg/kg',
          pqlValue: 0.5,
          pqlPrefix: 'less',
          prefix: 'exactValue',
          resultValue: 0.8,
          asbestosValue: null,
          aslpTclpType: null,
          method: null,
        },
        {
          laboratorySampleId: '286813-1',
          chemical: {
            code: '7440-38-2',
            name: 'Arsenic',
          },
          units: unitUGL,
          pqlValue: 0.77,
          pqlPrefix: 'less',
          prefix: 'exactValue',
          resultValue: 0.22,
          asbestosValue: null,
          aslpTclpType: AslpTclpType.Tclp,
          method: null,
        },
        {
          laboratorySampleId: '286813-1',
          chemical: {
            code: '7440-41-7',
            name: 'Beryllium',
          },
          units: 'mg/l',
          pqlValue: 0.78,
          pqlPrefix: 'less',
          prefix: 'exactValue',
          resultValue: 0.55,
          asbestosValue: null,
          aslpTclpType: AslpTclpType.Tclp,
          method: null,
        },
      ],
      hasStandardContaminationChemicals: true,
    },
    {
      labSampleId: '286813-2',
      dateSampled: '17/01/22',
      dpSampleId: '286813-2',
      labReportNo: null,
      depth: {
        from: 0,
        to: 0.1,
      },
      matrixType: 'Waste',
      sampleType: 'Normal',
      labName: 'Unknown',
      measurements: [
        {
          laboratorySampleId: '286813-2',
          chemical: {
            code: '7440-38-2',
            name: 'Arsenic',
          },
          units: 'mg/kg',
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
          units: 'mg/kg',
          pqlValue: 0.5,
          pqlPrefix: 'less',
          prefix: 'exactValue',
          resultValue: 8,
          asbestosValue: null,
          aslpTclpType: null,
          method: null,
        },
        {
          laboratorySampleId: '286813-2',
          chemical: {
            code: '7440-38-2',
            name: 'Arsenic',
          },
          units: unitUGL,
          pqlValue: 0.77,
          pqlPrefix: 'less',
          prefix: 'exactValue',
          resultValue: 2,
          asbestosValue: null,
          aslpTclpType: AslpTclpType.Tclp,
          method: null,
        },
        {
          laboratorySampleId: '286813-2',
          chemical: {
            code: '7440-41-7',
            name: 'Beryllium',
          },
          units: 'mg/l',
          pqlValue: 0.78,
          pqlPrefix: 'less',
          prefix: 'exactValue',
          resultValue: 5,
          asbestosValue: null,
          aslpTclpType: AslpTclpType.Tclp,
          method: null,
        },
      ],
      hasStandardContaminationChemicals: true,
    },
    {
      labSampleId: '286813-3',
      dateSampled: '17/01/22',
      dpSampleId: '286813-3',
      labReportNo: null,
      depth: {
        from: 0,
        to: 0.1,
      },
      matrixType: 'Waste',
      sampleType: 'Normal',
      labName: 'Unknown',
      measurements: [
        {
          laboratorySampleId: '286813-3',
          chemical: {
            code: '7440-38-2',
            name: 'Arsenic',
          },
          units: 'mg/kg',
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
          units: 'mg/kg',
          pqlValue: 0.5,
          pqlPrefix: 'less',
          prefix: 'exactValue',
          resultValue: 8.8,
          asbestosValue: null,
          aslpTclpType: null,
          method: null,
        },
        {
          laboratorySampleId: '286813-3',
          chemical: {
            code: '7440-38-2',
            name: 'Arsenic',
          },
          units: unitUGL,
          pqlValue: 0.77,
          pqlPrefix: 'less',
          prefix: 'exactValue',
          resultValue: 22,
          asbestosValue: null,
          aslpTclpType: AslpTclpType.Tclp,
          method: null,
        },
        {
          laboratorySampleId: '286813-3',
          chemical: {
            code: '7440-41-7',
            name: 'Beryllium',
          },
          units: 'mg/l',
          pqlValue: 0.78,
          pqlPrefix: 'less',
          prefix: 'exactValue',
          resultValue: 55,
          asbestosValue: null,
          aslpTclpType: AslpTclpType.Tclp,
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
      group: 'Metals',
      isCalculated: false,
      isCalculable: false,
      units: 'mg/kg',
      pqlValue: 0.4,
      pqlPrefix: 'NaN',
      groupSortOrder: 1,
      sortOrder: 1,
      isHiddenInReport: false,
      chemicalCodeForAssessing: '7440-38-2',
      replicates: [],
      extraFields: {
        min: {
          value: 0.6,
        },
        max: {
          value: 6.6,
        },
        mean: {
          value: 4.4,
        },
        standardDeviation: {
          value: null,
        },
        ucl: {
          value: null,
        },
      },
      reportCells: {
        '286813-1': {
          value: '0.6',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: true,
          prefix: 'exactValue',
          exceededCriteria: {
            Waste: [],
          },
          criteriaLimits: {
            Waste: [
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'CT1',
                },
                state: 'NSW',
                value: 100,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'CT2',
                },
                state: 'NSW',
                value: 400,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'SCC1',
                },
                state: 'NSW',
                value: 500,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'SCC2',
                },
                state: 'NSW',
                value: 2000,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'TCLP1',
                },
                state: 'NSW',
                value: 5,
                units: 'mg/L',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'TCLP2',
                },
                state: 'NSW',
                value: 20,
                units: 'mg/L',
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
            Waste: [],
          },
          criteriaLimits: {
            Waste: [
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'CT1',
                },
                state: 'NSW',
                value: 100,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'CT2',
                },
                state: 'NSW',
                value: 400,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'SCC1',
                },
                state: 'NSW',
                value: 500,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'SCC2',
                },
                state: 'NSW',
                value: 2000,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'TCLP1',
                },
                state: 'NSW',
                value: 5,
                units: 'mg/L',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'TCLP2',
                },
                state: 'NSW',
                value: 20,
                units: 'mg/L',
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
            Waste: [],
          },
          criteriaLimits: {
            Waste: [
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'CT1',
                },
                state: 'NSW',
                value: 100,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'CT2',
                },
                state: 'NSW',
                value: 400,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'SCC1',
                },
                state: 'NSW',
                value: 500,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'SCC2',
                },
                state: 'NSW',
                value: 2000,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'TCLP1',
                },
                state: 'NSW',
                value: 5,
                units: 'mg/L',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'TCLP2',
                },
                state: 'NSW',
                value: 20,
                units: 'mg/L',
              },
            ],
          },
          displayOptions: null,
        },
      },
      wcType: null,
    },
    {
      chemical: 'Arsenic',
      code: '7440-38-2',
      group: 'Metals',
      isCalculated: false,
      isCalculable: false,
      units: 'mg/L',
      pqlValue: 0.0007700000000000001,
      pqlPrefix: 'NaN',
      groupSortOrder: 1,
      sortOrder: 1.5,
      isHiddenInReport: false,
      chemicalCodeForAssessing: '7440-38-2',
      replicates: [],
      extraFields: {
        min: {
          value: 0.00022,
        },
        max: {
          value: 0.022,
        },
        mean: {
          value: 0.008073333333333333,
        },
        standardDeviation: {
          value: null,
        },
        ucl: {
          value: null,
        },
      },
      reportCells: {
        '286813-1': {
          value: '0.00022',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: true,
          prefix: 'exactValue',
          exceededCriteria: {
            Waste: [],
          },
          criteriaLimits: {
            Waste: [
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'CT1',
                },
                state: 'NSW',
                value: 100,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'CT2',
                },
                state: 'NSW',
                value: 400,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'SCC1',
                },
                state: 'NSW',
                value: 500,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'SCC2',
                },
                state: 'NSW',
                value: 2000,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'TCLP1',
                },
                state: 'NSW',
                value: 5,
                units: 'mg/L',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'TCLP2',
                },
                state: 'NSW',
                value: 20,
                units: 'mg/L',
              },
            ],
          },
          displayOptions: null,
        },
        '286813-2': {
          value: '0.002',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: true,
          prefix: 'exactValue',
          exceededCriteria: {
            Waste: [],
          },
          criteriaLimits: {
            Waste: [
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'CT1',
                },
                state: 'NSW',
                value: 100,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'CT2',
                },
                state: 'NSW',
                value: 400,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'SCC1',
                },
                state: 'NSW',
                value: 500,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'SCC2',
                },
                state: 'NSW',
                value: 2000,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'TCLP1',
                },
                state: 'NSW',
                value: 5,
                units: 'mg/L',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'TCLP2',
                },
                state: 'NSW',
                value: 20,
                units: 'mg/L',
              },
            ],
          },
          displayOptions: null,
        },
        '286813-3': {
          value: '0.022',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: true,
          prefix: 'exactValue',
          exceededCriteria: {
            Waste: [],
          },
          criteriaLimits: {
            Waste: [
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'CT1',
                },
                state: 'NSW',
                value: 100,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'CT2',
                },
                state: 'NSW',
                value: 400,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'SCC1',
                },
                state: 'NSW',
                value: 500,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'SCC2',
                },
                state: 'NSW',
                value: 2000,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'TCLP1',
                },
                state: 'NSW',
                value: 5,
                units: 'mg/L',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'TCLP2',
                },
                state: 'NSW',
                value: 20,
                units: 'mg/L',
              },
            ],
          },
          displayOptions: null,
        },
      },
      wcType: AslpTclpType.Tclp,
    },
    {
      chemical: 'Beryllium',
      code: '7440-41-7',
      group: 'Metals',
      isCalculated: false,
      isCalculable: false,
      units: 'mg/kg',
      pqlValue: 0.5,
      pqlPrefix: 'NaN',
      groupSortOrder: 1,
      sortOrder: 2,
      isHiddenInReport: false,
      chemicalCodeForAssessing: '7440-41-7',
      replicates: [],
      extraFields: {
        min: {
          value: 0.8,
        },
        max: {
          value: 8.8,
        },
        mean: {
          value: 5.9,
        },
        standardDeviation: {
          value: null,
        },
        ucl: {
          value: null,
        },
      },
      reportCells: {
        '286813-1': {
          value: '0.8',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: true,
          prefix: 'exactValue',
          exceededCriteria: {
            Waste: [],
          },
          criteriaLimits: {
            Waste: [
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'CT1',
                },
                state: 'NSW',
                value: 20,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'CT2',
                },
                state: 'NSW',
                value: 80,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'SCC1',
                },
                state: 'NSW',
                value: 100,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'SCC2',
                },
                state: 'NSW',
                value: 400,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'TCLP1',
                },
                state: 'NSW',
                value: 1,
                units: 'mg/L',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'TCLP2',
                },
                state: 'NSW',
                value: 4,
                units: 'mg/L',
              },
            ],
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
            Waste: [],
          },
          criteriaLimits: {
            Waste: [
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'CT1',
                },
                state: 'NSW',
                value: 20,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'CT2',
                },
                state: 'NSW',
                value: 80,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'SCC1',
                },
                state: 'NSW',
                value: 100,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'SCC2',
                },
                state: 'NSW',
                value: 400,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'TCLP1',
                },
                state: 'NSW',
                value: 1,
                units: 'mg/L',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'TCLP2',
                },
                state: 'NSW',
                value: 4,
                units: 'mg/L',
              },
            ],
          },
          displayOptions: null,
        },
        '286813-3': {
          value: '8.8',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: true,
          prefix: 'exactValue',
          exceededCriteria: {
            Waste: [],
          },
          criteriaLimits: {
            Waste: [
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'CT1',
                },
                state: 'NSW',
                value: 20,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'CT2',
                },
                state: 'NSW',
                value: 80,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'SCC1',
                },
                state: 'NSW',
                value: 100,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'SCC2',
                },
                state: 'NSW',
                value: 400,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'TCLP1',
                },
                state: 'NSW',
                value: 1,
                units: 'mg/L',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'TCLP2',
                },
                state: 'NSW',
                value: 4,
                units: 'mg/L',
              },
            ],
          },
          displayOptions: null,
        },
      },
      wcType: null,
    },
    {
      chemical: 'Beryllium',
      code: '7440-41-7',
      group: 'Metals',
      isCalculated: false,
      isCalculable: false,
      units: 'mg/L',
      pqlValue: 0.78,
      pqlPrefix: 'NaN',
      groupSortOrder: 1,
      sortOrder: 2.5,
      isHiddenInReport: false,
      chemicalCodeForAssessing: '7440-41-7',
      replicates: [],
      extraFields: {
        min: {
          value: 0.55,
        },
        max: {
          value: 55,
        },
        mean: {
          value: 20.18,
        },
        standardDeviation: {
          value: null,
        },
        ucl: {
          value: null,
        },
      },
      reportCells: {
        '286813-1': {
          value: '0.55',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: true,
          prefix: 'exactValue',
          exceededCriteria: {
            Waste: [],
          },
          criteriaLimits: {
            Waste: [
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'CT1',
                },
                state: 'NSW',
                value: 20,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'CT2',
                },
                state: 'NSW',
                value: 80,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'SCC1',
                },
                state: 'NSW',
                value: 100,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'SCC2',
                },
                state: 'NSW',
                value: 400,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'TCLP1',
                },
                state: 'NSW',
                value: 1,
                units: 'mg/L',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'TCLP2',
                },
                state: 'NSW',
                value: 4,
                units: 'mg/L',
              },
            ],
          },
          displayOptions: null,
        },
        '286813-2': {
          value: '5',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: true,
          prefix: 'exactValue',
          exceededCriteria: {
            Waste: [
              {
                criterionCode: 'TCLP2',
                limitValue: 4,
              },
            ],
          },
          criteriaLimits: {
            Waste: [
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'CT1',
                },
                state: 'NSW',
                value: 20,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'CT2',
                },
                state: 'NSW',
                value: 80,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'SCC1',
                },
                state: 'NSW',
                value: 100,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'SCC2',
                },
                state: 'NSW',
                value: 400,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'TCLP1',
                },
                state: 'NSW',
                value: 1,
                units: 'mg/L',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'TCLP2',
                },
                state: 'NSW',
                value: 4,
                units: 'mg/L',
              },
            ],
          },
          displayOptions: {
            backgroundColor: ReportColors.Orange,
            textColor: null,
            isBold: false,
          },
        },
        '286813-3': {
          value: '55',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: true,
          prefix: 'exactValue',
          exceededCriteria: {
            Waste: [
              {
                criterionCode: 'TCLP2',
                limitValue: 4,
              },
            ],
          },
          criteriaLimits: {
            Waste: [
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'CT1',
                },
                state: 'NSW',
                value: 20,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'CT2',
                },
                state: 'NSW',
                value: 80,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'SCC1',
                },
                state: 'NSW',
                value: 100,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'SCC2',
                },
                state: 'NSW',
                value: 400,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'TCLP1',
                },
                state: 'NSW',
                value: 1,
                units: 'mg/L',
              },
              {
                criterionDetail: {
                  chemicalCode: '7440-41-7',
                  criterionCode: 'TCLP2',
                },
                state: 'NSW',
                value: 4,
                units: 'mg/L',
              },
            ],
          },
          displayOptions: {
            backgroundColor: ReportColors.Orange,
            textColor: null,
            isBold: false,
          },
        },
      },
      wcType: AslpTclpType.Tclp,
    },
  ];
}
