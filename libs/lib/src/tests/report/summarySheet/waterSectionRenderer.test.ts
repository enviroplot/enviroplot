import {Workbook, Worksheet} from 'exceljs';
let Excel = require('exceljs');
import waterSectionRenderer from '../../../report/summarySheet/waterSectionRenderer';
import seedDataReader from '../../../readers/seedDataReader';

describe('should generate correct water specific sections', () => {
  let wb: Workbook = null;
  let ws: Worksheet = null;
  let seedDataGw: GwCalculationData = null;

  let bioaccumulativeChemicals: Chemical[] = [];

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
    seedDataGw = seedData.waterData;

    bioaccumulativeChemicals = seedDataGw.chemicals.filter((chemical) => chemical.isBioaccumulative === true);
  });

  beforeEach(() => {
    jest.setTimeout(50000);
    wb = new Excel.Workbook();
    ws = wb.addWorksheet('test');
  });
  const criteriaDetailsByChemical: CriteriaDetailsByChemical[] = [
    {
      chemicalCode: '16984-48-8',
      criteriaDetails: [
        {
          criterionDetail: {
            chemicalCode: '16984-48-8',
            criterionCode: 'PUHealth',
          },
          value: 1500,
        },
      ],
    },
  ];
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
  const color: ReportColors = ReportColors.DarkRed;
  const gwCriteria: any[] = [
    {
      category: AssessmentType.Water,
      code: 'PUHealth',
      color: ReportColors.DarkBlue,
      dataSource: 'NHMRC (2018) Australian Drinking Water Guidelines 6 2011, drinking water aesthetic-based criteria',
      group: 'PU',
      name: 'NHMRC (2018) ADWG Health',
      sortOrder: 8,
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

  test('generateWaterSpecificSections function', () => {
    let startCriteriaRowNumber = 8;
    let startColumnIndex = 0;
    let startContentColumnIndex = 3;

    waterSectionRenderer.generateWaterSpecificSectionsRegular(
      ws,
      startCriteriaRowNumber,
      startColumnIndex,
      startContentColumnIndex,
      sessionParameters,
      reportItems,
      seedDataGw as GwCalculationData
    );
    expect(ws.getCell('A9').text).toContain('NHMRC ');
    expect(ws.getCell('D9').text).toBe('1,500');
  });

  test('addGwCriteriaHorizontal function', () => {
    let lastTableRow: number = 8;
    let startColumnIndex: number = 0;
    let startContentColumnIndex: number = 2;
    let selectedCriteria: string[] = ['PUHealth'];
    waterSectionRenderer.addGwCriteriaHorizontal(
      ws,
      lastTableRow,
      startColumnIndex,
      startContentColumnIndex,
      reportItems,
      selectedCriteria,
      criteriaDetailsByChemical,
      gwCriteria,
      bioaccumulativeChemicals,
      sessionParameters
    );
    expect(ws.getCell('A9').text).toBe('NHMRC (2018) ADWG Health');
    expect(ws.getCell('C9').text).toBe('1,500');
  });

  test('addCriteriaRow', () => {
    let rowNumber: number = 9;
    let startColumnIndex: number = 0;
    let startContentColumnIndex: number = 2;
    let criterionCode: string = 'PUHealth';
    let title: string = 'NHMRC (2018) ADWG Health';

    waterSectionRenderer.addCriteriaRow(
      ws,
      rowNumber,
      startColumnIndex,
      startContentColumnIndex,
      criteriaDetailsByChemical,
      reportItems,
      bioaccumulativeChemicals,
      criterionCode,
      title,
      color,
      false
    );
    expect(ws.getCell('A9').text).toBe('NHMRC (2018) ADWG Health');
    expect(ws.getCell('C9').text).toBe('1,500');
  });

  describe('addCriteriaCell function', () => {
    test('criteria cell with display options', () => {
      let cellAddress: string = 'E6';
      let value: number = null;
      let displayOptions: ReportCellDisplayOptions = {
        textColor: ReportColors.DarkRed,
        backgroundColor: ReportColors.Green,
        isBold: true,
        borderColor: ReportColors.Grey,
      };

      waterSectionRenderer.addCriteriaCell(ws, cellAddress, value, displayOptions);
      expect(ws.getCell('E6').fill).toBeTruthy();
    });

    test('criteria cell without display options', () => {
      let cellAdddress: string = 'E6';
      let value: number = null;
      let displayOptions: ReportCellDisplayOptions = {};

      waterSectionRenderer.addCriteriaCell(ws, cellAdddress, value, displayOptions);
      expect(ws.getCell('E6').fill).toBeFalsy();
    });
  });

  test('addRowTitle function', () => {
    let rowNumber: number = 9;
    let startColumnIndex: number = 0;
    let startContentColumnIndex: number = 2;
    let title: string = 'NHMRC (2018) ADWG Health';
    let backgroundColour: ReportColors = ReportColors.DarkRed;

    waterSectionRenderer.addRowTitle(ws, rowNumber, startColumnIndex, startContentColumnIndex, title, backgroundColour);
    expect(ws.getCell('A9').text).toBe('NHMRC (2018) ADWG Health');
  });
  test('getUnknownLop function', () => {
    let criteriaDetailsByChemical: CriteriaDetailsByChemical[] = [
      {
        chemicalCode: 'TDS',
        criteriaDetails: [],
      },
    ];
    let chemicalCode: string = 'TDS';
    let criterionCode: string = 'PUHealth';
    let units: string = 'μg/L';

    let resultFalse = waterSectionRenderer.getUnknownLop(criteriaDetailsByChemical, chemicalCode, units, criterionCode);
    expect(resultFalse).toBeFalsy();
    criteriaDetailsByChemical[0].criteriaDetails.push({
      criterionDetail: {chemicalCode: 'TDS', criterionCode: 'PUHealth'},
      value: null,
    });
    let resultTrue = waterSectionRenderer.getUnknownLop(criteriaDetailsByChemical, chemicalCode, units, criterionCode);
    expect(resultTrue).toBeFalsy();
  });
});
