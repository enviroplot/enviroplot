import {Workbook, Worksheet} from 'exceljs';
let Excel = require('exceljs');
import wasteSectionsRenderer from '../../../report/summarySheet/wasteSectionsRenderer';

describe('should generate correct waste specific sections', () => {
  let wb: Workbook = null;
  let ws: Worksheet = null;

  beforeEach(() => {
    jest.setTimeout(50000);
    wb = new Excel.Workbook();
    ws = wb.addWorksheet('test');
  });

  const reportItems: ReportItem[] = [
    {
      chemical: 'Arsenic',
      chemicalCodeForAssessing: '7440-38-2',
      code: '7440-38-2',
      extraFields: {
        max: {value: 501},
        mean: {value: 128},
        min: {value: 4, displayOptions: {isBold: true}},
        standardDeviation: {value: null},
        ucl: {value: null},
      },
      group: 'Metals',
      groupSortOrder: 1,
      isCalculated: false,
      isHiddenInReport: false,
      pqlPrefix: 'exactValue',
      pqlValue: 4,
      replicates: [],
      reportCells: {
        '218873-1': {
          criteriaLimits: {
            Waste: [
              {
                criterionDetail: {
                  chemicalCode: '7440-38-2',
                  criterionCode: 'CT1',
                },
                value: 100,
              },
            ],
          },
          displayOptions: null,
          exceededCriteria: {Waste: []},
          highlightDetection: false,
          isAsbestosDetected: false,
          isAsbestosValue: false,
          prefix: '',
          value: 'NT',
        },
      },
      sortOrder: 1,
      units: 'mg/kg',
      wcType: null,
    },
  ];
  const sessionParameters: SessionParameters = {
    applyBiodegradation: false,
    chemicalGroups: {Waste: ['Metals']} as SessionChemicalGroups,
    combinedChemicalsDisplay: {},
    criteria: [],
    displayOptions: {showDepthColumn: true, showSummaryStatistics: true, showStatisticalInfoForContaminants: true},
    edits: {},
    highlightAllDetections: true,
    projectDetails: {
      assessmentType: AssessmentType.Waste,
      date: undefined,
      location: undefined,
      name: undefined,
      number: undefined,
      state: 'NSW',
      type: undefined,
    },
    reportOutputFormat: ReportOutputFormat.STANDARD_OUTPUT_FORMAT,
    waterAssessmentParameters: {
      levelOfProtection: {
        bioAccumulative: GwSpeciesProtectionLevel.Level_99,
        pfas: GwSpeciesProtectionLevel.Level_95,
        others: GwSpeciesProtectionLevel.Level_99,
      },
      potentialUse: GwPotentialUse.Health,
      soilType: SoilType.Sand,
      vapourIntrusionHsl: GwHslType.GW_HSL_AB,
      waterDepth: GwHslDepthLevel.Depth_2_to_4,
      waterEnvironment: GwWaterEnvironment.Both,
    },
  };
  const criteriaDetailsByChemical: CriteriaDetailsByChemical[] = [
    {
      chemicalCode: '7440-38-2',
      criteriaDetails: [
        {
          criterionDetail: {
            chemicalCode: '7440-38-2',
            criterionCode: 'CT1',
          },
          value: 100,
        },
      ],
    },
  ];

  describe('generateWasteSpecificSectionsHorizontal and generateWasteSpecificSectionsVertical functions testing', () => {
    test('generateWasteSpecificSectionsHorizontal function', () => {
      let lastTableRow: number = 17;
      let lastContentColumnIndex: number = 74;
      let startColumnIndex: number = 0;
      let startContentColumnIndex: number = 3;

      wasteSectionsRenderer.generateWasteSpecificSectionsHorizontal(
        ws,
        lastTableRow,
        lastContentColumnIndex,
        startColumnIndex,
        startContentColumnIndex,
        reportItems,
        sessionParameters
      );
      expect(ws.getCell('A17').text).toBe('Summary Statistics  ');
      expect(ws.getCell('A18').text).toBe('Min');
      expect(ws.getCell('A19').text).toBe('Max');
      expect(ws.getCell('A20').text).toBe('Mean');
      expect(ws.getCell('A21').text).toBe('Standard Deviation');
      expect(ws.getCell('A22').text).toBe('95% UCL');
      expect(ws.getCell('A23').text).toBe('Waste Classification Criteria  f');
      expect(ws.getCell('A24').text).toBe('CT1');
      expect(ws.getCell('D24').text).toBe('100');
    });

    test('generateWasteSpecificSectionsVertical function', () => {
      let startRowNumber: number = 6;
      let lastColumnIndex: number = 11;

      wasteSectionsRenderer.generateWasteSpecificSectionsVertical(
        ws,
        startRowNumber,
        lastColumnIndex,
        reportItems,
        sessionParameters
      );
      expect(ws.getCell('L6').text).toBe('Summary Statistics  ');
      expect(ws.getCell('L7').text).toBe('Min');
      expect(ws.getCell('M7').text).toBe('Max');
      expect(ws.getCell('N7').text).toBe('Mean');
      expect(ws.getCell('O7').text).toBe('Standard Deviation');
      expect(ws.getCell('P7').text).toBe('95% UCL');
      expect(ws.getCell('L8').text).toBe('');
      expect(ws.getCell('Q6').text).toBe('Waste Classification Criteria  f');
      expect(ws.getCell('Q7').text).toBe('CT1');
      expect(ws.getCell('Q8').text).toBe('');
      expect(ws.getCell('Q9').text).toBe('100');
    });
  });

  describe('addSummaryStatisticsHorizontal and addSummaryStatisticsVertical functions testing', () => {
    let displayOptions: ReportDisplayOptions = {
      showDepthColumn: true,
      showSummaryStatistics: true,
      showStatisticalInfoForContaminants: true,
    };
    test('addSummaryStatisticsHorizontal function', () => {
      let lastRowNumber: number = 17;
      let startColumnIndex: number = 0;
      let startContentColumnIndex: number = 3;
      let lastContentColumnIndex: number = 74;

      wasteSectionsRenderer.addSummaryStatisticsHorizontal(
        ws,
        lastRowNumber,
        startColumnIndex,
        startContentColumnIndex,
        lastContentColumnIndex,
        reportItems,
        displayOptions
      );
      expect(ws.getCell('A17').text).toBe('Summary Statistics  ');
      expect(ws.getCell('A18').text).toBe('Min');
      expect(ws.getCell('A19').text).toBe('Max');
      expect(ws.getCell('A20').text).toBe('Mean');
      expect(ws.getCell('A21').text).toBe('Standard Deviation');
      expect(ws.getCell('A22').text).toBe('95% UCL');
    });

    test('addSummaryStatisticsVertical function', () => {
      let startRowNumber: number = 6;
      let lastColumnIndex: number = 11;

      wasteSectionsRenderer.addSummaryStatisticsVertical(
        ws,
        startRowNumber,
        lastColumnIndex,
        reportItems,
        displayOptions
      );
      expect(ws.getCell('L6').text).toBe('Summary Statistics  ');
      expect(ws.getCell('L7').text).toBe('Min');
      expect(ws.getCell('M7').text).toBe('Max');
      expect(ws.getCell('N7').text).toBe('Mean');
      expect(ws.getCell('O7').text).toBe('Standard Deviation');
      expect(ws.getCell('P7').text).toBe('95% UCL');
      expect(ws.getCell('L8').text).toBe('');
    });
  });

  describe('addWcCriteriaHorizontal and addWcCriteriaVertical functions testing', () => {
    test('addWcCriteriaHorizontal function', () => {
      let lastTableRow: number = 23;
      let startColumnIndex: number = 0;
      let startContentColumnIndex: number = 3;
      let lastContentColumnIndex: number = 74;

      wasteSectionsRenderer.addWcCriteriaHorizontal(
        ws,
        lastTableRow,
        startColumnIndex,
        startContentColumnIndex,
        lastContentColumnIndex,
        reportItems,
        criteriaDetailsByChemical
      );
      expect(ws.getCell('A23').text).toBe('Waste Classification Criteria  f');
      expect(ws.getCell('A24').text).toBe('CT1');
      expect(ws.getCell('D24').text).toBe('100');
    });

    test('addWcCriteriaVertical function', () => {
      let rowNumber: number = 6;
      let startColumnIndex: number = 16;

      wasteSectionsRenderer.addWcCriteriaVertical(
        ws,
        rowNumber,
        startColumnIndex,
        reportItems,
        criteriaDetailsByChemical
      );
      expect(ws.getCell('Q6').text).toBe('Waste Classification Criteria  f');
      expect(ws.getCell('Q7').text).toBe('CT1');
      expect(ws.getCell('Q8').text).toBe('');
      expect(ws.getCell('Q9').text).toBe('100');
    });
  });

  test('getDisplayOptionsFromExtraField function', () => {
    let key: string = 'min';

    expect(wasteSectionsRenderer.getDisplayOptionsFromExtraField(reportItems[0], key)).toEqual({isBold: true});
  });

  test('getValueFromExtraField function', () => {
    let key: string = 'min';

    expect(wasteSectionsRenderer.getValueFromExtraField(reportItems[0], key)).toEqual(4);
  });

  describe('addStatRow and addStatColumn functions testing ', () => {
    test('addStatRow function', () => {
      let rowNumber: number = 18;
      let startColumnIndex: number = 0;
      let startContentColumnIndex: number = 3;
      let key: string = 'min';
      let title: string = 'min';

      wasteSectionsRenderer.addStatRow(
        ws,
        rowNumber,
        startColumnIndex,
        startContentColumnIndex,
        reportItems,
        key,
        title
      );
      expect(ws.getCell('D18').text).toBe('4');
    });
    test('addStatColumn function', () => {
      let rowNumber: number = 7;
      let lastColumnIndex: number = 11;
      let key: string = 'min';
      let title: string = 'min';

      wasteSectionsRenderer.addStatColumn(ws, rowNumber, lastColumnIndex, reportItems, key, title);
      expect(ws.getCell('L9').text).toBe('4');
    });
  });

  test('addColumnTitle function', () => {
    let rowNumber: number = 7;
    let columnIndex: number = 11;
    let title: string = 'min';

    wasteSectionsRenderer.addColumnTitle(ws, rowNumber, columnIndex, title);
    expect(ws.getCell('L7').text).toBe('Min');
  });

  test('addRowTitle function', () => {
    let rowNumber: number = 18;
    let startColumnIndex: number = 0;
    let startContentColumnIndex: number = 3;
    let title: string = 'min';

    wasteSectionsRenderer.addRowTitle(ws, rowNumber, startColumnIndex, startContentColumnIndex, title);
    expect(ws.getCell('A18').text).toBe('Min');
  });

  test('addCriteriaColumn function', () => {
    let rowNumber: number = 7;
    let columnIndex: number = 16;
    let titleItem: KeyLabelItem = {
      key: 'CT1',
      label: 'CT1',
    };

    wasteSectionsRenderer.addCriteriaColumn(
      ws,
      rowNumber,
      columnIndex,
      reportItems,
      criteriaDetailsByChemical,
      titleItem
    );
    expect(ws.getCell('Q7').text).toBe('CT1');
    expect(ws.getCell('Q8').text).toBe('');
    expect(ws.getCell('Q9').text).toBe('100');
  });

  test('getDisplayValue function', () => {
    let criterionCodeCT1: string = 'CT1';
    let criterionCodeTCLP1: string = 'TCLP1';
    let calculatedResultCT1 = wasteSectionsRenderer.getDisplayValue(
      reportItems[0],
      criteriaDetailsByChemical,
      criterionCodeCT1
    );
    expect(calculatedResultCT1).toBe('100');

    let calculatedResultTCLP1 = wasteSectionsRenderer.getDisplayValue(
      reportItems[0],
      criteriaDetailsByChemical,
      criterionCodeTCLP1
    );
    expect(calculatedResultTCLP1).toBe('-');

    let criteriaDetailsByChemicalForNC = [...criteriaDetailsByChemical];
    criteriaDetailsByChemicalForNC[0].criteriaDetails = [];
    let calculatedResultForNC = wasteSectionsRenderer.getDisplayValue(
      reportItems[0],
      criteriaDetailsByChemicalForNC,
      criterionCodeCT1
    );
    expect(calculatedResultForNC).toBe('-');

    let itemForOCP: ReportItem = {
      chemical: 'Total Analysed OCP',
      chemicalCodeForAssessing: 'SCHLD_CHEM',
      code: 'TotalOCP',
      extraFields: {},
      group: 'OCP',
      groupSortOrder: 7,
      isCalculated: true,
      isHiddenInReport: true,
      pqlPrefix: null,
      pqlValue: 0.1,
      replicates: [],
      reportCells: {
        '218873-1': {
          criteriaLimits: {
            Waste: [
              {
                criterionDetail: {
                  chemicalCode: 'SCHLD_CHEM',
                  criterionCode: 'CT1',
                },
                value: 49.99,
              },
            ],
          },
          displayOptions: null,
          exceededCriteria: {Waste: []},
          highlightDetection: false,
          isAsbestosDetected: false,
          isAsbestosValue: false,
          prefix: 'exactValue',
          value: 'NT',
        },
      },
      sortOrder: 22,
      units: 'mg/kg',
      wcType: null,
    };
    let criteriaDetailsByChemicalOCP: CriteriaDetailsByChemical[] = [
      {
        chemicalCode: 'TotalOCP',
        criteriaDetails: [
          {
            criterionDetail: {
              chemicalCode: 'SCHLD_CHEM',
              criterionCode: 'CT1',
            },
            value: 49.99,
          },
        ],
      },
    ];
    let calculatedResultForOCP = wasteSectionsRenderer.getDisplayValue(
      itemForOCP,
      criteriaDetailsByChemicalOCP,
      criterionCodeCT1
    );
    expect(calculatedResultForOCP).toBe('49.99');

    let itemForPCB: ReportItem = {
      chemical: 'Total PCB',
      chemicalCodeForAssessing: '1336-36-3',
      code: '1336-36-3',
      extraFields: {},
      group: 'PCB',
      groupSortOrder: 9,
      isCalculated: true,
      isHiddenInReport: false,
      pqlPrefix: null,
      pqlValue: 0.1,
      replicates: [],
      reportCells: {
        '218873-1': {
          criteriaLimits: {
            Waste: [
              {
                criterionDetail: {
                  chemicalCode: '1336-36-3',
                  criterionCode: 'CT1',
                },
                value: 49.99,
              },
            ],
          },
          displayOptions: null,
          exceededCriteria: {Waste: []},
          highlightDetection: false,
          isAsbestosDetected: false,
          isAsbestosValue: false,
          prefix: 'exactValue',
          value: 'NT',
        },
      },
      sortOrder: 22,
      units: 'mg/kg',
      wcType: null,
    };
    let criteriaDetailsByChemicalPCB: CriteriaDetailsByChemical[] = [
      {
        chemicalCode: '1336-36-3',
        criteriaDetails: [
          {
            criterionDetail: {
              chemicalCode: '1336-36-3',
              criterionCode: 'CT1',
            },
            value: 49.99,
          },
        ],
      },
    ];
    let calculatedResultForPCB = wasteSectionsRenderer.getDisplayValue(
      itemForPCB,
      criteriaDetailsByChemicalPCB,
      criterionCodeCT1
    );
    expect(calculatedResultForPCB).toBe('49.99');
  });

  test('addCriteriaRow function', () => {
    let rowNumber: number = 24;
    let startColumnIndex: number = 0;
    let startContentColumnIndex: number = 3;
    let titleItem: KeyLabelItem = {
      key: 'CT1',
      label: 'CT1',
    };

    wasteSectionsRenderer.addCriteriaRow(
      ws,
      rowNumber,
      startColumnIndex,
      startContentColumnIndex,
      reportItems,
      criteriaDetailsByChemical,
      titleItem
    );

    expect(ws.getCell('A24').text).toBe('CT1');
    expect(ws.getCell('D24').text).toBe('-');
  });

  test('addSectionHeader function for empty notes', () => {
    let rowNumber: number = 17;
    let startColumnIndex: number = 0;
    let lastColumnIndex: number = 74;
    let title: string = 'Summary Statistics';
    let note: string = '';

    wasteSectionsRenderer.addSectionHeader(ws, rowNumber, startColumnIndex, lastColumnIndex, title, note);
    expect(ws.getCell('A17').text).toBe('Summary Statistics  ');
  });

  test('addSectionHeader function for expected notes', () => {
    let rowNumber: number = 17;
    let startColumnIndex: number = 0;
    let lastColumnIndex: number = 74;
    let title: string = 'Summary Statistics';
    let note: string = 'Test';

    wasteSectionsRenderer.addSectionHeader(ws, rowNumber, startColumnIndex, lastColumnIndex, title, note);
    expect(ws.getCell('A17').text).toBe('Summary Statistics  Test');
  });
});
