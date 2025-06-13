import * as _ from 'lodash';
import * as constants from '../../../src/constants/constants';
import extras from '../../calculations/extras';
import {Workbook, Worksheet} from 'exceljs';
import reportHelper from '../../report/reportHelper';

const Excel = require('exceljs');

describe('check assessment type', () => {
  test('should check that assessment type is soil', () => {
    let sessionParameters: SessionParameters = {
      applyBiodegradation: null,
      highlightAllDetections: null,
      chemicalGroups: {
        Soil: [],
      } as SessionChemicalGroups,
      displayOptions: {
        showDepthColumn: null,
        showStatisticalInfoForContaminants: null,
        showSummaryStatistics: null,
      },
      combinedChemicalsDisplay: {},
      edits: {},
      projectDetails: {
        assessmentType: AssessmentType.Soil,
        state: '',
        type: '',
        name: '',
        number: '',
        date: '',
        location: '',
      },
      criteria: [],
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
      reportOutputFormat: null,
    };
    expect(extras.isSoilAssessment(sessionParameters)).toBeTruthy();
  });

  test('should check that assessment type is waste', () => {
    let sessionParameters: SessionParameters = {
      applyBiodegradation: null,
      highlightAllDetections: null,
      chemicalGroups: {
        Waste: [],
      } as SessionChemicalGroups,
      displayOptions: {
        showDepthColumn: null,
        showStatisticalInfoForContaminants: null,
        showSummaryStatistics: null,
      },
      combinedChemicalsDisplay: {},
      edits: {},
      projectDetails: {
        assessmentType: AssessmentType.Waste,
        state: '',
        type: '',
        name: '',
        number: '',
        date: '',
        location: '',
      },
      criteria: [],
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
      reportOutputFormat: null,
    };
    expect(extras.isWasteAssessment(sessionParameters)).toBeTruthy();
  });

  test('should check that assessment type is water ', () => {
    let sessionParameters: SessionParameters = {
      applyBiodegradation: null,
      highlightAllDetections: null,
      chemicalGroups: {
        Water: [],
      } as SessionChemicalGroups,
      displayOptions: {
        showDepthColumn: null,
        showStatisticalInfoForContaminants: null,
        showSummaryStatistics: null,
      },
      combinedChemicalsDisplay: {},
      edits: {},
      projectDetails: {
        assessmentType: AssessmentType.Water,
        state: '',
        type: '',
        name: '',
        number: '',
        date: '',
        location: '',
      },
      criteria: [],
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
      reportOutputFormat: null,
    };
    expect(extras.isWaterAssessment(sessionParameters)).toBeTruthy();
  });
});

describe('should return correct depth string for report', () => {
  test('should return correct depth for same from=3 and to=3', () => {
    const depth: Depth = {from: 3, to: 3};

    const actual = reportHelper.getDepth(depth);
    expect(actual).toBe('3 m');
  });
  test('should return correct depth for from=0 and to=0.9', () => {
    const depth: Depth = {from: 0, to: 0.9};

    const actual = reportHelper.getDepth(depth);
    expect(actual).toBe('0 - 0.9 m');
  });
});

test('getAlignment function', () => {
  let horizontal = 'left';
  let vertical = 'middle';
  let wrapText = false;
  let textRotation = 0;
  let mockResult = {horizontal: horizontal, vertical: vertical, wrapText: wrapText, textRotation: textRotation};
  let calculatedResultForAllParameters = reportHelper.getAlignment(horizontal, vertical, wrapText, textRotation);
  expect(calculatedResultForAllParameters).toMatchObject(mockResult);
});

test('getMiddleCenterAlignment function', () => {
  let horizontal = 'center';
  let vertical = 'middle';
  let wrapText = false;
  let textRotation = 0;
  let calculatedResult = reportHelper.getMiddleCenterAlignment(wrapText, textRotation);
  let mockResult = {horizontal: horizontal, vertical: vertical, wrapText: wrapText, textRotation: textRotation};
  expect(calculatedResult).toMatchObject(mockResult);
});

test('getLeftCenterAlignment function', () => {
  let calculatedResult = reportHelper.getLeftCenterAlignment();
  expect(calculatedResult.horizontal).toBe('left');
  expect(calculatedResult.vertical).toBe('middle');
});

test('getCenterAlignment function', () => {
  let calculatedResult = reportHelper.getCenterAlignment();
  expect(calculatedResult.horizontal).toBe('center');
});

describe('getBorderStyle function', () => {
  test('check border style object if params is string value "all"', () => {
    let type: string = 'hair';
    let params: any = 'all';
    let mockResult = {top: {style: type}, left: {style: type}, bottom: {style: type}, right: {style: type}};
    let calculatedResult = reportHelper.getBorderStyle(type, params);
    expect(calculatedResult).toMatchObject(mockResult);
  });

  test('check border style object if params is object', () => {
    let type: string = 'hair';
    let params: any = {top: {style: type}};
    let calculatedResult = reportHelper.getBorderStyle(type, params);
    expect(calculatedResult).toMatchObject(params);
  });
});

test('getHairBorderAround function', () => {
  let calculatedResult = reportHelper.getHairBorderAround();
  expect(calculatedResult.bottom.style).toBe('hair');
  expect(calculatedResult.left.style).toBe('hair');
  expect(calculatedResult.right.style).toBe('hair');
  expect(calculatedResult.top.style).toBe('hair');
});

test('getCellAddress function', () => {
  let row: number = 6;
  let index: number = 0;
  let calculatedResult = reportHelper.getCellAddress(row, index);
  expect(calculatedResult).toBe('A6');
});

test('setCell function', () => {
  let wb: Workbook = new Excel.Workbook();
  let ws: Worksheet = wb.addWorksheet('test');

  let cellAddress: string = 'D11';
  let value: any = 'Title';
  let fontSize: number = 7;
  let isBold = false;
  let alignment: any = 'Center';
  let border: any = {
    bottom: {style: 'hair'},
    left: {style: 'hair'},
  };

  reportHelper.setCell(ws, cellAddress, value, fontSize, isBold, alignment, border);

  expect(ws.getCell('D11').address).toBe('D11');
  expect(ws.getCell('D11').value).toBe('Title');
  expect(ws.getCell('D11').font.size).toBe(7);
  expect(ws.getCell('D11').font.bold).toBe(false);
  expect(ws.getCell('D11').alignment).toBe('Center');
  expect(ws.getCell('D11').border.bottom.style).toBe('hair');
  expect(ws.getCell('D11').border.left.style).toBe('hair');
});

test('setRowHeight function', () => {
  let wb: Workbook = new Excel.Workbook();
  let ws: Worksheet = wb.addWorksheet('test');

  let rowNr: number = 2;
  let height: number = 9.5;

  reportHelper.setRowHeight(ws, rowNr, height);

  expect(ws.getRow(2).number).toBe(2);
  expect(ws.getRow(2).height).toBe(9.5);
});

test('setColumnWidth function', () => {
  let wb: Workbook = new Excel.Workbook();
  let ws: Worksheet = wb.addWorksheet('test');

  let columnIndex0: number = 0;
  let widthForIndex0: number = 20;

  let columnIndex3: number = 3;
  let widthForIndex3: number = 30;

  reportHelper.setColumnWidth(ws, columnIndex0, widthForIndex0);
  expect(ws.getColumn('A').width).toBe(20);

  reportHelper.setColumnWidth(ws, columnIndex3, widthForIndex3);
  expect(ws.getColumn('D').width).toBe(30);
});

test('hideRow function', () => {
  let wb: Workbook = new Excel.Workbook();
  let ws: Worksheet = wb.addWorksheet('test');

  let rowNr: number = 4;
  reportHelper.hideRow(ws, rowNr);
  expect(ws.getRow(4).number).toBe(4);
  expect(ws.getRow(4).hidden).toBeTruthy();
});

test('applyCellDisplayOptions function', () => {
  let wb: Workbook = new Excel.Workbook();
  let ws: Worksheet = wb.addWorksheet('test');

  let cell = ws.getCell('A1');
  cell.font = {name: constants.fontName, size: 5, bold: true};

  let displayOptions: ReportCellDisplayOptions = {
    backgroundColor: ReportColors.Grey,
    isBold: false,
    textColor: ReportColors.Green,
  };
  let stubResultForCellFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: {
      argb: 'FFa9a9a9',
    },
  };

  reportHelper.applyCellDisplayOptions(cell, displayOptions);
  expect(ws.getCell('A1').fill).toEqual(stubResultForCellFill);
  expect(ws.getCell('A1').font.bold).toBeTruthy();
  expect(ws.getCell('A1').font.color).toEqual({argb: 'FF98FB98'});
});

test('getColumnNumberByWidth function', () => {
  let wb: Workbook = new Excel.Workbook();
  let ws: Worksheet = wb.addWorksheet('test');

  ws.columns = [
    {key: 'A', width: 8},
    {key: 'B', width: 8},
  ];
  let width7: number = 7;
  let calculatedResultForWidth7 = reportHelper.getColumnNumberByWidth(ws, width7);
  expect(calculatedResultForWidth7).toBe(1);

  let width9: number = 9;
  let calculatedResultForWidth9 = reportHelper.getColumnNumberByWidth(ws, width9);
  expect(calculatedResultForWidth9).toBe(2);
});

test('getGwCriteriaTitle function', () => {
  let criteriaCodeForCodeDefault: string = 'PUHealth';
  let criteriaCodeForCodeVI_2_4: string = 'VI_2_4';
  let criteriaCodeForCodeVI_4_8: string = 'VI_4_8';
  let criteriaCodeForCodeVI_8more: string = 'VI_8more';
  let criteriaNameForCodeDefault: string = 'NHMRC (2018) ADWG Health';
  let criteriaNameForCodeValue: string = 'NHMRC (2018) ADWG Health [soilType] [depth]';
  let sessionParameters: SessionParameters = {
    applyBiodegradation: null,
    highlightAllDetections: null,
    chemicalGroups: {
      Water: [],
    } as SessionChemicalGroups,
    displayOptions: {
      showDepthColumn: null,
      showStatisticalInfoForContaminants: null,
      showSummaryStatistics: null,
    },
    combinedChemicalsDisplay: {},
    edits: {},
    projectDetails: {
      assessmentType: AssessmentType.Undefined,
      state: '',
      type: '',
      name: '',
      number: '',
      date: '',
      location: '',
    },
    criteria: [''],
    waterAssessmentParameters: {
      waterEnvironment: GwWaterEnvironment.Both,
      levelOfProtection: {
        bioAccumulative: null,
        others: null,
        pfas: null,
      },
      potentialUse: null,
      soilType: SoilType.Clay,
      waterDepth: GwHslDepthLevel.Depth_2_to_4,
      vapourIntrusionHsl: null,
    },
    reportOutputFormat: null,
  };
  let calculatedResultForCodeDefault = reportHelper.getGwCriteriaTitle(
    criteriaCodeForCodeDefault,
    criteriaNameForCodeDefault,
    sessionParameters
  );
  let calculatedResultForCodeVI_2_4 = reportHelper.getGwCriteriaTitle(
    criteriaCodeForCodeVI_2_4,
    criteriaNameForCodeValue,
    sessionParameters
  );
  let calculatedResultForCodeVI_4_8 = reportHelper.getGwCriteriaTitle(
    criteriaCodeForCodeVI_4_8,
    criteriaNameForCodeValue,
    sessionParameters
  );
  let calculatedResultForCodeVI_8more = reportHelper.getGwCriteriaTitle(
    criteriaCodeForCodeVI_8more,
    criteriaNameForCodeValue,
    sessionParameters
  );
  expect(calculatedResultForCodeDefault).toBe('NHMRC (2018) ADWG Health');
  expect(calculatedResultForCodeVI_2_4).toBe('NHMRC (2018) ADWG Health Clay 2-4m');
  expect(calculatedResultForCodeVI_4_8).toBe('NHMRC (2018) ADWG Health Clay 2-4m');
  expect(calculatedResultForCodeVI_8more).toBe('NHMRC (2018) ADWG Health Clay 2-4m');
});

test('getWaterCriteriaDetailsWithColor function', () => {
  let seedData: GwCalculationData = {
    chemicalGroups: [],
    chemicals: [],
    chemicalsByGroup: [],
    calculatedChemicals: [],
    calculations: [],
    criteriaGroups: [],
    criteria: [
      {
        category: CriterionCategory.Water,
        code: 'VI_2_4',
        dataSource:
          'NEPC (2013) National Environment Protection (Assessment of Site Contamination) Measure 1999 (as amended 2013), health screening level [soilType] [depth]',
        group: 'VI',
        name: 'NEPC (2013) HSL 2-4m',
        sortOrder: 1,
      },
    ],
    vapourIntrusionCriterionDetails: [],
    waterQualityCriterionDetails: [],
    potentialUseCriterionDetails: [],
  };
  let calculatedResult = reportHelper.getWaterCriteriaDetailsWithColor(seedData);
  let stubResult: any = {
    category: CriterionCategory.Water,
    code: 'VI_2_4',
    color: 'LightOrange',
    dataSource:
      'NEPC (2013) National Environment Protection (Assessment of Site Contamination) Measure 1999 (as amended 2013), health screening level [soilType] [depth]',
    group: 'VI',
    name: 'NEPC (2013) HSL 2-4m',
    sortOrder: 1,
  };

  expect(calculatedResult[0]).toEqual(stubResult);
});

test('getChemicalTitle function', () => {
  let reportItem: ReportItem = {
    chemical: 'Total dissolved solids',
    chemicalCodeForAssessing: 'TDS',
    code: 'TDS',
    extraFields: {min: null, max: null, mean: null, standardDeviation: null, ucl: null},
    group: 'PHYSICAL_PARAM',
    groupSortOrder: 1,
    isCalculated: false,
    isHiddenInReport: false,
    pqlPrefix: 'exactValue',
    pqlValue: 5,
    replicates: null,
    reportCells: {},
    sortOrder: 9,
    units: 'mg/L',
    wcType: null,
  };
  let sessionParameters: SessionParameters = {
    applyBiodegradation: null,
    highlightAllDetections: null,
    chemicalGroups: {
      Soil: [],
      Waste: [],
      Water: [],
    } as SessionChemicalGroups,
    displayOptions: {
      showDepthColumn: null,
      showStatisticalInfoForContaminants: null,
      showSummaryStatistics: null,
    },
    combinedChemicalsDisplay: {},
    edits: {},
    projectDetails: {
      assessmentType: AssessmentType.Water,
      state: '',
      type: '',
      name: '',
      number: '',
      date: '',
      location: '',
    },
    criteria: [],
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
    reportOutputFormat: null,
  };
  let calculatedResult = reportHelper.getChemicalTitle(reportItem, sessionParameters);
  expect(calculatedResult).toEqual('Total dissolved solids');
});

describe('getReplicatedSamples function', () => {
  test('without replicated samples', () => {
    let samples: Sample[] = [
      {
        dateSampled: '04/12/2018',
        depth: {from: 0, to: null},
        dpSampleId: '7',
        labName: 'Unknown',
        labSampleId: '207346-1',
        labReportNo: null,
        matrixType: AssessmentType.Water,
        measurements: [],
        sampleType: 'Normal',
        isTripBlank: true,
        isTripSpike: true,
        soilType: '',
      },
      {
        dateSampled: '04/12/2018',
        depth: {from: 0, to: null},
        dpSampleId: '9',
        labName: 'Unknown',
        labReportNo: null,
        labSampleId: '207346-2',
        matrixType: AssessmentType.Water,
        measurements: [],
        sampleType: 'Normal',
        isTripBlank: true,
        isTripSpike: true,
        soilType: '',
      },
      {
        dateSampled: '04/12/2018',
        depth: {from: 0, to: null},
        dpSampleId: '10',
        labName: 'Unknown',
        labSampleId: '207346-3',
        labReportNo: null,
        matrixType: AssessmentType.Water,
        measurements: [],
        sampleType: 'Normal',
        isTripBlank: true,
        isTripSpike: true,
        soilType: '',
      },
    ];
    let calculatedResult = reportHelper.getReplicatedSamples(samples);
    expect(calculatedResult.length).toEqual(0);
  });

  test('with replicated sample', () => {
    let samples: Sample[] = [
      {
        dateSampled: '04/12/2018',
        depth: {from: 0, to: null},
        dpSampleId: '9',
        labName: 'Unknown',
        labSampleId: '207346-2',
        labReportNo: null,
        matrixType: AssessmentType.Water,
        measurements: [],
        sampleType: 'Normal',
        isTripBlank: true,
        isTripSpike: true,
        soilType: '',
      },
      {
        dateSampled: '04/12/2018',

        depth: {from: 0, to: null},
        dpSampleId: '7',
        labName: 'Unknown',
        labSampleId: '207346-1',
        labReportNo: null,
        matrixType: AssessmentType.Water,
        measurements: [],
        primarySampleId: '207346-2',
        sampleType: 'Normal',
        isTripBlank: true,
        isTripSpike: true,
        soilType: '',
      },
      {
        dateSampled: '04/12/2018',
        depth: {from: 0, to: null},
        dpSampleId: '10',
        labReportNo: null,
        labName: 'Unknown',
        labSampleId: '207346-3',
        matrixType: AssessmentType.Water,
        measurements: [],
        sampleType: 'Normal',
        isTripBlank: true,
        isTripSpike: true,
        soilType: '',
      },
    ];
    let calculatedResult = reportHelper.getReplicatedSamples(samples);
    expect(calculatedResult.length).toEqual(1);
  });
});

test('getCriteriaDetailsByChemical function', () => {
  let reportItem: ReportItem[] = [
    {
      chemical: 'Total dissolved solids',
      chemicalCodeForAssessing: 'TDS',
      code: 'TDS',
      extraFields: {min: null, max: null, mean: null, standardDeviation: null, ucl: null},
      group: 'PHYSICAL_PARAM',
      groupSortOrder: 1,
      isCalculated: false,
      isHiddenInReport: false,
      pqlPrefix: 'exactValue',
      pqlValue: 5,
      replicates: null,
      reportCells: {
        '207346-1': {
          criteriaLimits: {
            Water: [
              {
                criterionDetail: {
                  chemicalCode: 'TDS',
                  criterionCode: 'PUHealth',
                },
                value: null,
              },
              {
                criterionDetail: {
                  chemicalCode: 'TDS',
                  criterionCode: 'PURecreation',
                },
                value: null,
              },
            ],
          },
          displayOptions: {},
          exceededCriteria: {},
          highlightDetection: true,
          isAsbestosDetected: false,
          isAsbestosValue: false,
          prefix: 'exactValue',
          value: '14000',
        },
      },
      sortOrder: 9,
      units: 'mg/L',
      wcType: null,
    },
    {
      chemical: 'Ammonia (as NH3)',
      chemicalCodeForAssessing: '7664-41-7',
      code: '7664-41-7',
      extraFields: {min: null, max: null, mean: null, standardDeviation: null, ucl: null},
      group: 'NUTRIENTS',
      groupSortOrder: 2,
      isCalculated: false,
      isHiddenInReport: false,
      pqlPrefix: 'exactValue',
      pqlValue: 0.005,
      replicates: null,
      reportCells: {
        '207346-1': {
          criteriaLimits: {
            Water: [
              {
                criterionDetail: {
                  chemicalCode: '7664-41-7',
                  criterionCode: 'PUHealth',
                },
                value: null,
              },
              {
                criterionDetail: {
                  chemicalCode: '7664-41-7',
                  criterionCode: 'PURecreation',
                },
                value: null,
              },
              {
                criterionDetail: {
                  chemicalCode: '7664-41-7',
                  criterionCode: 'WQFresh',
                },
                value: 900,
              },
            ],
          },
          displayOptions: {},
          exceededCriteria: {},
          highlightDetection: true,
          isAsbestosDetected: false,
          isAsbestosValue: false,
          prefix: 'exactValue',
          value: '7.6',
        },
      },
      sortOrder: 1,
      units: 'mg/L',
      wcType: null,
    },
  ];
  let assessmentType: AssessmentType = AssessmentType.Water;
  let mockCriteriaByChemical: CriteriaDetailsByChemical[] = [
    {
      chemicalCode: 'TDS',
      criteriaDetails: [
        {criterionDetail: {chemicalCode: 'TDS', criterionCode: 'PUHealth'}, value: null},
        {criterionDetail: {chemicalCode: 'TDS', criterionCode: 'PURecreation'}, value: null},
      ],
    },
    {
      chemicalCode: '7664-41-7',
      criteriaDetails: [
        {criterionDetail: {chemicalCode: '7664-41-7', criterionCode: 'PUHealth'}, value: null},
        {criterionDetail: {chemicalCode: '7664-41-7', criterionCode: 'PURecreation'}, value: null},
        {criterionDetail: {chemicalCode: '7664-41-7', criterionCode: 'WQFresh'}, value: 900},
      ],
    },
  ];
  let calculatedResult = reportHelper.getCriteriaDetailsByChemical(reportItem, assessmentType);
  expect(calculatedResult.length).toEqual(2);
  expect(calculatedResult).toEqual(mockCriteriaByChemical);
});
describe('getCriterionDetail function', () => {
  test('check function for return object', () => {
    let criteriaDetailsByChemical: CriteriaDetailsByChemical[] = [
      {
        chemicalCode: 'TDS',
        criteriaDetails: [
          {criterionDetail: {chemicalCode: 'TDS', criterionCode: 'PUHealth'}, value: null},
          {criterionDetail: {chemicalCode: 'TDS', criterionCode: 'PURecreation'}, value: null},
        ],
      },
      {
        chemicalCode: '7664-41-7',
        criteriaDetails: [
          {criterionDetail: {chemicalCode: '7664-41-7', criterionCode: 'PUHealth'}, value: null},
          {criterionDetail: {chemicalCode: '7664-41-7', criterionCode: 'PURecreation'}, value: null},
          {criterionDetail: {chemicalCode: '7664-41-7', criterionCode: 'WQFresh'}, value: 900},
        ],
      },
    ];
    let chemicalCode = 'TDS';
    let criterionCode = 'PUHealth';
    let units = 'μg/L';
    let mockCriterionDetail: IHasCriterionDetailAndValue = {
      criterionDetail: {chemicalCode: 'TDS', criterionCode: 'PUHealth'},
      value: null,
    };
    let calculatedResult = reportHelper.getCriterionDetail(
      criteriaDetailsByChemical,
      chemicalCode,
      units,
      criterionCode
    );
    expect(calculatedResult).toMatchObject(mockCriterionDetail);
  });

  test('check function for return null', () => {
    let criteriaDetailsByChemical: CriteriaDetailsByChemical[] = [
      {
        chemicalCode: 'TDS',
        criteriaDetails: [
          {criterionDetail: {chemicalCode: 'TDS', criterionCode: 'PUHealth'}, value: null},
          {criterionDetail: {chemicalCode: 'TDS', criterionCode: 'PURecreation'}, value: null},
        ],
      },
      {
        chemicalCode: '7664-41-7',
        criteriaDetails: [
          {criterionDetail: {chemicalCode: '7664-41-7', criterionCode: 'PUHealth'}, value: null},
          {criterionDetail: {chemicalCode: '7664-41-7', criterionCode: 'PURecreation'}, value: null},
          {criterionDetail: {chemicalCode: '7664-41-7', criterionCode: 'WQFresh'}, value: 900},
        ],
      },
    ];
    let chemicalCode = '16887-00-6';
    let criterionCode = 'PUHealth';
    let units = 'μg/L';
    let mockCriterionDetail: IHasCriterionDetailAndValue = null;
    let calculatedResult = reportHelper.getCriterionDetail(
      criteriaDetailsByChemical,
      chemicalCode,
      units,
      criterionCode
    );
    expect(calculatedResult).toBe(mockCriterionDetail);
  });
});

test('getCriterionValue function', () => {
  let criteriaDetailsByChemical: CriteriaDetailsByChemical[] = [
    {
      chemicalCode: 'TDS',
      criteriaDetails: [
        {criterionDetail: {chemicalCode: 'TDS', criterionCode: 'PUHealth'}, value: null},
        {criterionDetail: {chemicalCode: 'TDS', criterionCode: 'PURecreation'}, value: null},
      ],
    },
    {
      chemicalCode: '7664-41-7',
      criteriaDetails: [
        {criterionDetail: {chemicalCode: '7664-41-7', criterionCode: 'PUHealth'}, value: null},
        {criterionDetail: {chemicalCode: '7664-41-7', criterionCode: 'PURecreation'}, value: null},
        {criterionDetail: {chemicalCode: '7664-41-7', criterionCode: 'WQFresh'}, value: 900},
      ],
    },
  ];
  let chemicalCodeForResultNull = 'TDS';
  let criterionCodeForResultNull = 'PUHealth';
  let mockResultNull = null;
  let units = 'μg/L';
  let calculatedResultNull = reportHelper.getCriterionValue(
    criteriaDetailsByChemical,
    chemicalCodeForResultNull,
    units,
    criterionCodeForResultNull
  );
  expect(calculatedResultNull).toBe(mockResultNull);

  let chemicalCodeForResultNumber = '7664-41-7';
  let criterionCodeForResultNumber = 'WQFresh';
  let mockResultNumber = 900;
  let calculatedResultNumber = reportHelper.getCriterionValue(
    criteriaDetailsByChemical,
    chemicalCodeForResultNumber,
    units,
    criterionCodeForResultNumber
  );
  expect(calculatedResultNumber).toEqual(mockResultNumber);
});

describe('test getting correct hslDepth', () => {
  test('should get correct depth for border values', () => {
    expect(reportHelper.getHslDepthLevelCriterion(0)).toEqual(HslDepthLevel.Depth_0_to_1);
    expect(reportHelper.getHslDepthLevelCriterion(1)).toEqual(HslDepthLevel.Depth_1_to_2);
    expect(reportHelper.getHslDepthLevelCriterion(2)).toEqual(HslDepthLevel.Depth_2_to_4);
    expect(reportHelper.getHslDepthLevelCriterion(4)).toEqual(HslDepthLevel.Depth_4_to_unlimited);
  });

  test('should get correct depth for middle values', () => {
    expect(reportHelper.getHslDepthLevelCriterion(0.3)).toEqual(HslDepthLevel.Depth_0_to_1);
    expect(reportHelper.getHslDepthLevelCriterion(1.999)).toEqual(HslDepthLevel.Depth_1_to_2);
    expect(reportHelper.getHslDepthLevelCriterion(2.00001)).toEqual(HslDepthLevel.Depth_2_to_4);
    expect(reportHelper.getHslDepthLevelCriterion(400)).toEqual(HslDepthLevel.Depth_4_to_unlimited);
  });
});

describe('testing that worksheets/workbooks/cells are changing properly', () => {
  test('should draw hair border around the cell #setHairBorderAroundCells', () => {
    let wb: Workbook = new Excel.Workbook();
    let ws: Worksheet = wb.addWorksheet('test');

    reportHelper.setHairBorderAroundCellsByColumn(ws, 1, 1, 3);

    expect(ws.getCell('B1').border.top.style).toBe('hair');
    expect(ws.getCell('B1').border.bottom.style).toBe('hair');
    expect(ws.getCell('B1').border.right.style).toBe('hair');
    expect(ws.getCell('B1').border.left.style).toBe('hair');
  });
});
