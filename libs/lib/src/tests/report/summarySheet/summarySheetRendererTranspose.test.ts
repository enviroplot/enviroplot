import {Workbook, Worksheet} from 'exceljs';
const Excel = require('exceljs');
import summarySheetRendererTranspose from './../../../report/summarySheet/summarySheetRendererTranspose';

const wb: Workbook = new Excel.Workbook();
let ws: Worksheet = wb.addWorksheet('test');
const samples: Sample[] = [
  {
    dateSampled: '04/12/2018',
    depth: {from: 0, to: 0},
    dpSampleId: '7',
    labName: 'Unknown',
    labSampleId: '207346-1',
    labReportNo: null,
    matrixType: AssessmentType.Water,
    measurements: [
      {
        asbestosValue: null,
        chemical: {code: 'C6-C9', name: 'TRH C6 - C9'},
        laboratorySampleId: '207346-1',
        pqlPrefix: 'exactValue',
        pqlValue: 10,
        prefix: 'less',
        resultValue: 10,
        aslpTclpType: null,
        units: 'µg/L',
        method: null,
      },
    ],
    sampleType: 'Normal',
    isTripBlank: false,
    isTripSpike: false,
    soilType: null,
  },
  {
    dateSampled: '04/12/2018',
    depth: {from: 0, to: 0},
    dpSampleId: '9',
    labName: 'Unknown',
    labSampleId: '207346-2',
    matrixType: AssessmentType.Water,
    labReportNo: null,
    measurements: [
      {
        asbestosValue: null,
        chemical: {code: 'C6-C9', name: 'TRH C6 - C9'},
        laboratorySampleId: '207346-2',
        pqlPrefix: 'exactValue',
        pqlValue: 10,
        prefix: 'less',
        resultValue: 10,
        aslpTclpType: null,
        units: 'µg/L',
        method: null,
      },
    ],
    sampleType: 'Normal',
    isTripBlank: false,
    isTripSpike: false,
    soilType: null,
  },
];
const sessionParameters: SessionParameters = {
  applyBiodegradation: false,
  highlightAllDetections: false,
  chemicalGroups: {Water: ['METALS']} as SessionChemicalGroups,
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
  criteria: ['VI_2_4', 'WQFresh', 'PUHealth'],
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
  reportOutputFormat: ReportOutputFormat.TRANSPOSED_OUTPUT_FORMAT,
};
const reportItems: ReportItem[] = [
  {
    chemical: 'Aluminium',
    chemicalCodeForAssessing: '7429-90-5',
    code: '7429-90-5',
    extraFields: {},
    group: 'METALS',
    groupSortOrder: 4,
    isCalculated: false,
    isHiddenInReport: false,
    pqlPrefix: 'exactValue',
    pqlValue: 10,
    replicates: [],
    reportCells: {
      '207346-1': {
        criteriaLimits: {},
        displayOptions: {},
        exceededCriteria: {},
        highlightDetection: false,
        isAsbestosDetected: false,
        isAsbestosValue: false,
        prefix: 'less',
        value: '10',
      },
      '207346-2': {
        criteriaLimits: {},
        displayOptions: {},
        exceededCriteria: {},
        highlightDetection: false,
        isAsbestosDetected: false,
        isAsbestosValue: false,
        prefix: 'less',
        value: '20',
      },
    },
    sortOrder: 2,
    units: 'µg/L',
    wcType: null,
  },
  {
    chemical: 'Arsenic',
    chemicalCodeForAssessing: '7440-38-2',
    code: '7440-38-2',
    extraFields: {},
    group: 'METALS',
    groupSortOrder: 4,
    isCalculated: false,
    isHiddenInReport: false,
    pqlPrefix: 'exactValue',
    pqlValue: 1,
    replicates: [],
    reportCells: {
      '207346-1': {
        criteriaLimits: {},
        displayOptions: {},
        exceededCriteria: {},
        highlightDetection: false,
        isAsbestosDetected: false,
        isAsbestosValue: false,
        prefix: 'less',
        value: '1',
      },
      '207346-2': {
        criteriaLimits: {},
        displayOptions: {},
        exceededCriteria: {},
        highlightDetection: false,
        isAsbestosDetected: false,
        isAsbestosValue: false,
        prefix: 'less',
        value: '2',
      },
    },
    sortOrder: 4,
    units: 'µg/L',
    wcType: null,
  },
];

//taken from summarySheetRendererTranspose
const startRowNumber = 6;
const startColumnIndex = 0;
const pqlColumnIndex = startColumnIndex + 2;
const unitsColumnIndex = startColumnIndex + 3;
const startContentColumnIndex = startColumnIndex + 4;
const pqlUnitsRowNumber = startRowNumber + 1;
const startContentRowNumber = startRowNumber + 3;

describe('should generate correct GW transpose table', () => {
  // test main entire function
  test('addReportTableHeader function', () => {
    summarySheetRendererTranspose.addReportTableHeader(
      ws,
      samples,
      startRowNumber,
      startColumnIndex,
      startContentColumnIndex,
      pqlColumnIndex,
      unitsColumnIndex,
      pqlUnitsRowNumber,
      startContentRowNumber
    );

    expect(ws.getCell('A7').text).toBe('Sample ID');
    expect(ws.getCell('A8').text).toBe('Sample Date');
    expect(ws.getCell('B7').text).toBe('');
    expect(ws.getCell('B8').text).toBe('');

    expect(ws.getCell('C7').text).toBe('');
    expect(ws.getCell('C8').text).toBe('PQL');
    expect(ws.getCell('D7').text).toBe('');

    expect(ws.getCell('D8').text).toBe('Units');

    expect(ws.getCell('E7').text).toBe('7');
    expect(ws.getCell('E8').text).toBe('04/12/2018');

    expect(ws.getCell('F7').text).toBe('9');
    expect(ws.getCell('F8').text).toBe('04/12/2018');

    // clear 'ws' object for further included functions tests
    wb.removeWorksheet('test');
    ws = wb.addWorksheet('test');
  });

  // test 2nd-level functions separately

  test('addSampleIdsAndSampleDateHeader function', () => {
    summarySheetRendererTranspose.addSampleIdsAndSampleDateHeader(
      ws,
      samples,
      startRowNumber + 1,
      startColumnIndex,
      startContentColumnIndex
    );
    expect(ws.getCell('E7').text).toBe('7');
    expect(ws.getCell('E8').text).toBe('04/12/2018');
    expect(ws.getCell('F7').text).toBe('9');
    expect(ws.getCell('F8').text).toBe('04/12/2018');
  });

  test('addUnitPqlRowHeader function', () => {
    let pqlUnitsRowNumber = startRowNumber + 1;
    summarySheetRendererTranspose.addUnitPqlRowHeader(ws, pqlUnitsRowNumber, pqlColumnIndex, unitsColumnIndex);

    expect(ws.getCell('C8').text).toBe('PQL');
    expect(ws.getCell('D8').text).toBe('Units');
  });

  test('addChemicalValues function', () => {
    let rowNumber: number = 9;
    let cellIndex: number = 10;

    summarySheetRendererTranspose.addChemicalValues(ws, rowNumber, cellIndex, reportItems, samples, sessionParameters);
    expect(ws.getCell('K9').text).toBe('<10');
    expect(ws.getCell('L9').text).toBe('<20');
    expect(ws.getCell('K10').text).toBe('<1');
    expect(ws.getCell('L10').text).toBe('<2');
  });

  test('addTableHeader function', () => {
    let labelID: string = 'Sample ID';
    let labelData: string = 'Sample Data';
    let rowNumberID: number = 6;
    let rowNumberData: number = 7;
    let cellIndex: number = 1;

    summarySheetRendererTranspose.addTableHeader(ws, labelID, rowNumberID, cellIndex);
    expect(ws.getCell('B6').text).toBe('Sample ID');
    summarySheetRendererTranspose.addTableHeader(ws, labelData, rowNumberData, cellIndex);
    expect(ws.getCell('B7').text).toBe('Sample Data');
  });

  test('addPqlValue function', () => {
    let rowNumber: number = 9;
    let pqlCellIndex: number = 2;

    summarySheetRendererTranspose.addPqlValue(ws, rowNumber, pqlCellIndex, reportItems);
    expect(ws.getCell('C9').text).toBe('10');
    expect(ws.getCell('C10').text).toBe('1');
  });

  test('setColumnsWidths function', () => {
    let startCellIndex: number = 0;
    let reportChemicalsCellIndex: number = 1;
    let unitsCellIndex: number = 3;

    summarySheetRendererTranspose.setColumnsWidths(ws, startCellIndex, reportChemicalsCellIndex, unitsCellIndex);
    expect(ws.getColumn('A').width).toEqual(20);
    expect(ws.getColumn('B').width).toEqual(25);
    expect(ws.getColumn('D').width).toEqual(10);
  });
});
