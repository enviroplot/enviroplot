import {Workbook, Worksheet} from 'exceljs';
let Excel = require('exceljs');
import seedDataReader from '../../../readers/seedDataReader';

import summarySheetRenderer from '../../../report/summarySheet/summarySheetRenderer';

describe('should render summary sheet report', () => {
  let wb: Workbook = null;
  let ws: Worksheet = null;

  let seedDataGw: GwCalculationData = null;

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
    seedDataGw = seedData.waterData;
  });

  beforeEach(() => {
    jest.setTimeout(50000);
    wb = new Excel.Workbook();
    ws = wb.addWorksheet('test');
  });

  const reportItems: ReportItem[] = [
    {
      chemical: 'Fluoride',
      chemicalCodeForAssessing: '16984-48-8',
      code: '16984-48-8',
      extraFields: {min: null, max: null, mean: null, standardDeviation: null, ucl: null},
      group: 'ANIONS_CATIONS',
      groupSortOrder: 3,
      isCalculated: false,
      isHiddenInReport: false,
      pqlPrefix: 'exactValue',
      pqlValue: 0.1,
      replicates: [],
      reportCells: {
        '207346-1': {
          criteriaLimits: {
            Water: [
              {
                criterionDetail: {chemicalCode: '16984-48-8', criterionCode: 'PUHealth'},
                value: 1500,
              },
            ],
          },
          displayOptions: {backgroundColor: null, textColor: null, isBold: false},
          exceededCriteria: {PU: [], WQ: [], VI: []},
          highlightDetection: true,
          isAsbestosDetected: false,
          isAsbestosValue: false,
          prefix: 'exactValue',
          value: '0.1',
        },
      },
      sortOrder: 5,
      units: 'mg/L',
      wcType: null,
    },
  ];
  const sessionParameters: SessionParameters = {
    applyBiodegradation: false,
    highlightAllDetections: true,
    chemicalGroups: {
      Water: [
        'PHYSICAL_PARAM',
        'NUTRIENTS',
        'ANIONS_CATIONS',
        'METALS',
        'TRH',
        'BTEX',
        'PAH',
        'PHENOLS',
        'OCP',
        'OPP',
        'PCB',
        'VOC',
        'PFAS',
        'HERBICIDES',
        'ASBESTOS',
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
      assessmentType: AssessmentType.Water,
      state: 'NSW',
      type: '',
      name: '',
      number: '',
      date: '',
      location: '',
    },
    criteria: ['PUHealth'],
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
  const samples: Sample[] = [
    {
      dateSampled: '04/12/2018',
      depth: {from: 1, to: 2},
      dpSampleId: '7',
      labName: 'Unknown',
      labSampleId: '207346-1',
      labReportNo: null,
      matrixType: AssessmentType.Water,
      measurements: [],
      sampleType: 'Normal',
      isTripBlank: false,
      isTripSpike: false,
      soilType: 'Sand',
    },
  ];

  test('renderSummarySheet function', async () => {
    let dataFolderPath: string = './data';
    let tableGroups: ChemicalGroup[] = [
      {
        chemicals: [
          {
            calculated: false,
            calculationFormulaType: CalculationFormulaType.NotDefined,
            chemicalGroup: 'PHYSICAL_PARAM',
            code: 'DO',
            codeForAssessing: '',
            isBioaccumulative: false,
            name: 'Dissolved oxygen',
            sortOrder: 1,
          },
        ],
        code: 'PHYSICAL_PARAM',
        description: 'PHYSICAL PARAMETERS',
        isStandardContaminantSuite: true,
        name: 'PHYSICAL PARAMETERS',
        sortOrder: 1,
      },
      {
        chemicals: [
          {
            calculated: false,
            calculationFormulaType: CalculationFormulaType.NotDefined,
            chemicalGroup: 'ANIONS_CATIONS',
            code: '16984-48-8',
            codeForAssessing: '',
            isBioaccumulative: false,
            name: 'Fluoride',
            sortOrder: 5,
          },
        ],
        code: 'ANIONS_CATIONS',
        description: 'ANIONS & CATIONS',
        isStandardContaminantSuite: true,
        name: 'ANIONS AND CATIONS',
        sortOrder: 3,
      },
    ];
    let selectedTableGroupsKeys: string[] = ['PHYSICAL_PARAM', 'ANIONS_CATIONS'];
    let tableNumber: number = 0;
    let showDepthColumn: boolean = false;

    await summarySheetRenderer.renderSummarySheet(
      wb,
      seedDataGw,
      dataFolderPath,
      reportItems,
      samples,
      tableGroups,
      selectedTableGroupsKeys,
      tableNumber,
      sessionParameters,
      showDepthColumn
    );
    expect(wb.worksheets[1].getCell('A3').text).toBe('Table 0: Summary of Laboratory Results – ANIONS AND CATIONS');
    expect(wb.worksheets[1].getCell('C6').text).toBe('ANIONS AND CATIONS');
    expect(wb.worksheets[1].getCell('B8').text).toBe('PQL');
    expect(wb.worksheets[1].getCell('C7').text).toBe('Fluoride');
    expect(wb.worksheets[1].getCell('C8').text).toBe('0.1');
  });

  test('addSamplesRows function', () => {
    let rowNumber: number = 14;
    let startIndex: number = 0;
    let showDepthColumn: boolean = true;

    summarySheetRenderer.addSamplesRows(
      ws,
      rowNumber,
      startIndex,
      reportItems,
      samples,
      sessionParameters,
      showDepthColumn
    );
    expect(ws.getCell('A14').text).toBe('7');
    expect(ws.getCell('B14').text).toBe('1 - 2 m');
    expect(ws.getCell('C14').text).toBe('04/12/2018');
    expect(ws.getCell('D14').text).toBe('0.1');
  });
});
