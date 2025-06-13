import {Workbook, Worksheet} from 'exceljs';
let Excel = require('exceljs');
import seedDataReader from '../../../readers/seedDataReader';

import summarySheetRenderer from '../../../report/summarySheet/summarySheetRenderer';

/* 
  THIS TEST checks if Calculated chems are displayed properly when Individuals and Calculated chems come 
  from a Lab file and have their TCLP values as well
*/

describe('should render summary sheet report with Calculated chems (BOTH Calculated + Individuals) and their TCLP chems', () => {
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

  test('testing: renderSummarySheet() with Calculated chemicals (displayed BOTH Calculated + Individuals) with TCLP chemicals', async () => {
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

    expect(ws.getCell('A3').text).toBe('Table 0: Summary of Laboratory Results – PFAS');

    // test chemicals names row
    expect(ws.getCell('D7').text).toBe('PFHxS');
    expect(ws.getCell('E7').text).toBe('TCLP PFHxS');
    expect(ws.getCell('F7').text).toBe('PFOS');
    expect(ws.getCell('G7').text).toBe('TCLP PFOS');
    expect(ws.getCell('H7').text).toBe('PFOS+PFHxS (Calculated)');
    expect(ws.getCell('I7').text).toBe('TCLP PFOS+PFHxS (Calculated)');

    // test units row
    expect(ws.getCell('D9').text).toBe('mg/kg');
    expect(ws.getCell('E9').text).toBe('mg/L');
    expect(ws.getCell('F9').text).toBe('mg/kg');
    expect(ws.getCell('G9').text).toBe('mg/L');
    expect(ws.getCell('H9').text).toBe('mg/kg');
    expect(ws.getCell('I9').text).toBe('mg/L');

    // test result values
    expect(ws.getCell('A10').text).toBe('SP09B-1'); // Sample ID
    expect(ws.getCell('D10').text).toBe('<0.001');
    expect(ws.getCell('E10').text).toBe('<0.0002');
    expect(ws.getCell('F10').text).toBe('0.001');
    expect(ws.getCell('G10').text).toBe('<0.0003');
    expect(ws.getCell('H10').text).toBe('0.05');
    expect(ws.getCell('I10').text).toBe('<0.0004');

    expect(ws.getCell('A11').text).toBe('SP09B-2'); // Sample ID
    expect(ws.getCell('D11').text).toBe('<0.01');
    expect(ws.getCell('E11').text).toBe('<0.0002');
    expect(ws.getCell('F11').text).toBe('0.01');
    expect(ws.getCell('G11').text).toBe('<0.03');
    expect(ws.getCell('H11').text).toBe('0.06');
    expect(ws.getCell('I11').text).toBe('<0.04');
  });
});

function selectedTableGroupsKeys(): string[] {
  return ['PFAS'];
}

function tableGroups(): ChemicalGroup[] {
  return [
    {
      code: 'PFAS',
      name: 'PFAS',
      description: 'PFOA, PFOS+PFHxS',
      sortOrder: 13,
      isStandardContaminantSuite: true,
      chemicals: [
        {
          code: '335-67-1',
          name: 'PFOA',
          sortOrder: 1,
          chemicalGroup: 'PFAS',
          calculated: false,
          calculationFormulaType: CalculationFormulaType.NotDefined,
          codeForAssessing: '',
        },
        {
          code: '355-46-4',
          name: 'PFHxS',
          sortOrder: 2,
          chemicalGroup: 'PFAS',
          calculated: false,
          calculationFormulaType: CalculationFormulaType.NotDefined,
          codeForAssessing: '',
        },
        {
          code: '1763-23-1',
          name: 'PFOS',
          sortOrder: 3,
          chemicalGroup: 'PFAS',
          calculated: false,
          calculationFormulaType: CalculationFormulaType.NotDefined,
          codeForAssessing: '',
        },
        {
          code: '355-46-4/1763-23-1',
          name: 'PFOS+PFHxS (Calculated)',
          sortOrder: 5,
          chemicalGroup: 'PFAS',
          calculated: true,
          calculationFormulaType: CalculationFormulaType.Sum,
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
      Waste: ['PFAS'],
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
      labSampleId: '300008-1',
      labReportNo: null,
      dateSampled: '07/07/22',
      dpSampleId: 'SP09B-1',
      depth: {
        from: 0,
        to: 0,
      },
      matrixType: 'Waste',
      sampleType: 'Normal',
      labName: 'Unknown',
      measurements: [
        {
          laboratorySampleId: '300008-1',
          chemical: {
            code: '355-46-4',
            name: 'Perfluorohexanesulfonic acid - PFHxS',
          },
          units: 'µg/kg',
          pqlValue: 0.1,
          pqlPrefix: 'exactValue',
          prefix: 'less',
          resultValue: 1,
          asbestosValue: null,
          aslpTclpType: null,
          method: null,
        },
        {
          laboratorySampleId: '300008-1',
          chemical: {
            code: '1763-23-1',
            name: 'Perfluorooctanesulfonic acid\rPFOS',
          },
          units: 'µg/kg',
          pqlValue: 0.1,
          pqlPrefix: 'exactValue',
          prefix: 'exactValue',
          resultValue: 1,
          asbestosValue: null,
          aslpTclpType: null,
          method: null,
        },
        {
          laboratorySampleId: '300008-1',
          chemical: {
            code: '355-46-4/1763-23-1',
            name: 'Total Positive PFHxS & PFOS',
          },
          units: 'µg/kg',
          pqlValue: 0.1,
          pqlPrefix: 'exactValue',
          prefix: 'exactValue',
          resultValue: 50,
          asbestosValue: null,
          aslpTclpType: null,
          method: null,
        },
        {
          laboratorySampleId: '300008-1',
          chemical: {
            code: '355-46-4',
            name: 'Perfluorohexanesulfonic acid - PFHxS',
          },
          units: 'µg/l',
          pqlValue: 0.01,
          pqlPrefix: 'exactValue',
          prefix: 'less',
          resultValue: 0.2,
          asbestosValue: null,
          aslpTclpType: AslpTclpType.Tclp,
          method: null,
        },
        {
          laboratorySampleId: '300008-1',
          chemical: {
            code: '1763-23-1',
            name: 'Perfluorooctanesulfonic acid PFOS',
          },
          units: 'µg/l',
          pqlValue: 0.01,
          pqlPrefix: 'exactValue',
          prefix: 'less',
          resultValue: 0.3,
          asbestosValue: null,
          aslpTclpType: AslpTclpType.Tclp,
          method: null,
        },
        {
          laboratorySampleId: '300008-1',
          chemical: {
            code: '355-46-4/1763-23-1',
            name: 'Total Positive PFHxS & PFOS',
          },
          units: 'µg/l',
          pqlValue: 0.01,
          pqlPrefix: 'exactValue',
          prefix: 'less',
          resultValue: 0.4,
          asbestosValue: null,
          aslpTclpType: AslpTclpType.Tclp,
          method: null,
        },
      ],
    },
    {
      labSampleId: '300008-2',
      labReportNo: null,
      dateSampled: '07/07/22',
      dpSampleId: 'SP09B-2',
      depth: {
        from: 0,
        to: 0,
      },
      matrixType: 'Waste',
      sampleType: 'Normal',
      labName: 'Unknown',
      measurements: [
        {
          laboratorySampleId: '300008-2',
          chemical: {
            code: '355-46-4',
            name: 'Perfluorohexanesulfonic acid - PFHxS',
          },
          units: 'µg/kg',
          pqlValue: 0.1,
          pqlPrefix: 'exactValue',
          prefix: 'less',
          resultValue: 10,
          asbestosValue: null,
          aslpTclpType: null,
          method: null,
        },
        {
          laboratorySampleId: '300008-2',
          chemical: {
            code: '1763-23-1',
            name: 'Perfluorooctanesulfonic acid\rPFOS',
          },
          units: 'µg/kg',
          pqlValue: 0.1,
          pqlPrefix: 'exactValue',
          prefix: 'exactValue',
          resultValue: 10,
          asbestosValue: null,
          aslpTclpType: null,
          method: null,
        },
        {
          laboratorySampleId: '300008-2',
          chemical: {
            code: '355-46-4/1763-23-1',
            name: 'Total Positive PFHxS & PFOS',
          },
          units: 'µg/kg',
          pqlValue: 0.1,
          pqlPrefix: 'exactValue',
          prefix: 'exactValue',
          resultValue: 60,
          asbestosValue: null,
          aslpTclpType: null,
          method: null,
        },
        {
          laboratorySampleId: '300008-2',
          chemical: {
            code: '355-46-4',
            name: 'Perfluorohexanesulfonic acid - PFHxS',
          },
          units: 'µg/l',
          pqlValue: 0.01,
          pqlPrefix: 'exactValue',
          prefix: 'less',
          resultValue: 0.2,
          asbestosValue: null,
          aslpTclpType: AslpTclpType.Tclp,
          method: null,
        },
        {
          laboratorySampleId: '300008-2',
          chemical: {
            code: '1763-23-1',
            name: 'Perfluorooctanesulfonic acid PFOS',
          },
          units: 'µg/l',
          pqlValue: 0.01,
          pqlPrefix: 'exactValue',
          prefix: 'less',
          resultValue: 30,
          asbestosValue: null,
          aslpTclpType: AslpTclpType.Tclp,
          method: null,
        },
        {
          laboratorySampleId: '300008-2',
          chemical: {
            code: '355-46-4/1763-23-1',
            name: 'Total Positive PFHxS & PFOS',
          },
          units: 'µg/l',
          pqlValue: 0.01,
          pqlPrefix: 'exactValue',
          prefix: 'less',
          resultValue: 40,
          asbestosValue: null,
          aslpTclpType: AslpTclpType.Tclp,
          method: null,
        },
      ],
    },
    {
      labSampleId: '300008-3',
      labReportNo: null,
      dateSampled: '07/07/22',
      dpSampleId: 'SP10B-1',
      depth: {
        from: 0,
        to: 0,
      },
      matrixType: 'Waste',
      sampleType: 'Normal',
      labName: 'Unknown',
      measurements: [
        {
          laboratorySampleId: '300008-3',
          chemical: {
            code: '355-46-4',
            name: 'Perfluorohexanesulfonic acid - PFHxS',
          },
          units: 'µg/kg',
          pqlValue: 0.1,
          pqlPrefix: 'exactValue',
          prefix: 'less',
          resultValue: 19,
          asbestosValue: null,
          aslpTclpType: null,
          method: null,
        },
        {
          laboratorySampleId: '300008-3',
          chemical: {
            code: '1763-23-1',
            name: 'Perfluorooctanesulfonic acid\rPFOS',
          },
          units: 'µg/kg',
          pqlValue: 0.1,
          pqlPrefix: 'exactValue',
          prefix: 'exactValue',
          resultValue: 20,
          asbestosValue: null,
          aslpTclpType: null,
          method: null,
        },
        {
          laboratorySampleId: '300008-3',
          chemical: {
            code: '355-46-4/1763-23-1',
            name: 'Total Positive PFHxS & PFOS',
          },
          units: 'µg/kg',
          pqlValue: 0.1,
          pqlPrefix: 'exactValue',
          prefix: 'exactValue',
          resultValue: 70,
          asbestosValue: null,
          aslpTclpType: null,
          method: null,
        },
        {
          laboratorySampleId: '300008-3',
          chemical: {
            code: '355-46-4',
            name: 'Perfluorohexanesulfonic acid - PFHxS',
          },
          units: 'µg/l',
          pqlValue: 0.01,
          pqlPrefix: 'exactValue',
          prefix: 'less',
          resultValue: 0.38,
          asbestosValue: null,
          aslpTclpType: AslpTclpType.Tclp,
          method: null,
        },
        {
          laboratorySampleId: '300008-3',
          chemical: {
            code: '1763-23-1',
            name: 'Perfluorooctanesulfonic acid PFOS',
          },
          units: 'µg/l',
          pqlValue: 0.01,
          pqlPrefix: 'exactValue',
          prefix: 'less',
          resultValue: 0.4,
          asbestosValue: null,
          aslpTclpType: AslpTclpType.Tclp,
          method: null,
        },
        {
          laboratorySampleId: '300008-3',
          chemical: {
            code: '355-46-4/1763-23-1',
            name: 'Total Positive PFHxS & PFOS',
          },
          units: 'µg/l',
          pqlValue: 0.01,
          pqlPrefix: 'exactValue',
          prefix: 'less',
          resultValue: 0.5,
          asbestosValue: null,
          aslpTclpType: AslpTclpType.Tclp,
          method: null,
        },
      ],
    },
    {
      labSampleId: '300008-4',
      dateSampled: '07/07/22',
      labReportNo: null,
      dpSampleId: 'SP10B-2',
      depth: {
        from: 0,
        to: 0,
      },
      matrixType: 'Waste',
      sampleType: 'Normal',
      labName: 'Unknown',
      measurements: [
        {
          laboratorySampleId: '300008-4',
          chemical: {
            code: '355-46-4',
            name: 'Perfluorohexanesulfonic acid - PFHxS',
          },
          units: 'µg/kg',
          pqlValue: 0.1,
          pqlPrefix: 'exactValue',
          prefix: 'less',
          resultValue: 28,
          asbestosValue: null,
          aslpTclpType: null,
          method: null,
        },
        {
          laboratorySampleId: '300008-4',
          chemical: {
            code: '1763-23-1',
            name: 'Perfluorooctanesulfonic acid\rPFOS',
          },
          units: 'µg/kg',
          pqlValue: 0.1,
          pqlPrefix: 'exactValue',
          prefix: 'exactValue',
          resultValue: 30,
          asbestosValue: null,
          aslpTclpType: null,
          method: null,
        },
        {
          laboratorySampleId: '300008-4',
          chemical: {
            code: '355-46-4/1763-23-1',
            name: 'Total Positive PFHxS & PFOS',
          },
          units: 'µg/kg',
          pqlValue: 0.1,
          pqlPrefix: 'exactValue',
          prefix: 'exactValue',
          resultValue: 80,
          asbestosValue: null,
          aslpTclpType: null,
          method: null,
        },
        {
          laboratorySampleId: '300008-4',
          chemical: {
            code: '355-46-4',
            name: 'Perfluorohexanesulfonic acid - PFHxS',
          },
          units: 'µg/l',
          pqlValue: 0.01,
          pqlPrefix: 'exactValue',
          prefix: 'less',
          resultValue: 0.56,
          asbestosValue: null,
          aslpTclpType: AslpTclpType.Tclp,
          method: null,
        },
        {
          laboratorySampleId: '300008-4',
          chemical: {
            code: '1763-23-1',
            name: 'Perfluorooctanesulfonic acid PFOS',
          },
          units: 'µg/l',
          pqlValue: 0.01,
          pqlPrefix: 'exactValue',
          prefix: 'less',
          resultValue: 31,
          asbestosValue: null,
          aslpTclpType: AslpTclpType.Tclp,
          method: null,
        },
        {
          laboratorySampleId: '300008-4',
          chemical: {
            code: '355-46-4/1763-23-1',
            name: 'Total Positive PFHxS & PFOS',
          },
          units: 'µg/l',
          pqlValue: 0.01,
          pqlPrefix: 'exactValue',
          prefix: 'less',
          resultValue: 41,
          asbestosValue: null,
          aslpTclpType: AslpTclpType.Tclp,
          method: null,
        },
      ],
    },
  ];
}

function reportItems(): ReportItem[] {
  return [
    {
      chemical: 'PFHxS',
      code: '355-46-4',
      group: 'PFAS',
      isCalculated: false,
      isCalculable: false,
      units: 'mg/kg',
      pqlValue: 0.0001,
      pqlPrefix: 'NaN',
      groupSortOrder: 13,
      sortOrder: 2,
      isHiddenInReport: false,
      chemicalCodeForAssessing: '355-46-4',
      replicates: [],
      extraFields: {
        min: {
          value: 0.001,
        },
        max: {
          value: 0.028,
        },
        mean: {
          value: 0.0145,
        },
        standardDeviation: {
          value: null,
        },
        ucl: {
          value: null,
        },
      },
      reportCells: {
        '300008-1': {
          value: '0.001',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: false,
          prefix: 'less',
          exceededCriteria: {},
          criteriaLimits: {},
          displayOptions: null,
        },
        '300008-2': {
          value: '0.01',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: false,
          prefix: 'less',
          exceededCriteria: {},
          criteriaLimits: {},
          displayOptions: null,
        },
        '300008-3': {
          value: '0.019',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: false,
          prefix: 'less',
          exceededCriteria: {},
          criteriaLimits: {},
          displayOptions: null,
        },
        '300008-4': {
          value: '0.028',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: false,
          prefix: 'less',
          exceededCriteria: {},
          criteriaLimits: {},
          displayOptions: null,
        },
      },
      wcType: null,
    },
    {
      chemical: 'PFHxS',
      code: '355-46-4',
      group: 'PFAS',
      isCalculated: false,
      isCalculable: false,
      units: 'mg/L',
      pqlValue: 0.00001,
      pqlPrefix: 'NaN',
      groupSortOrder: 13,
      sortOrder: 2.5,
      isHiddenInReport: false,
      chemicalCodeForAssessing: '355-46-4',
      replicates: [],
      extraFields: {
        min: {
          value: 0.0002,
        },
        max: {
          value: 0.00056,
        },
        mean: {
          value: 0.00034,
        },
        standardDeviation: {
          value: null,
        },
        ucl: {
          value: null,
        },
      },
      reportCells: {
        '300008-1': {
          value: '0.0002',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: false,
          prefix: 'less',
          exceededCriteria: {},
          criteriaLimits: {},
          displayOptions: null,
        },
        '300008-2': {
          value: '0.0002',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: false,
          prefix: 'less',
          exceededCriteria: {},
          criteriaLimits: {},
          displayOptions: null,
        },
        '300008-3': {
          value: '0.00038',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: false,
          prefix: 'less',
          exceededCriteria: {},
          criteriaLimits: {},
          displayOptions: null,
        },
        '300008-4': {
          value: '0.00056',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: false,
          prefix: 'less',
          exceededCriteria: {},
          criteriaLimits: {},
          displayOptions: null,
        },
      },
      wcType: AslpTclpType.Tclp,
    },
    {
      chemical: 'PFOS',
      code: '1763-23-1',
      group: 'PFAS',
      isCalculated: false,
      isCalculable: false,
      units: 'mg/kg',
      pqlValue: 0.0001,
      pqlPrefix: 'NaN',
      groupSortOrder: 13,
      sortOrder: 3,
      isHiddenInReport: false,
      chemicalCodeForAssessing: '1763-23-1',
      replicates: [],
      extraFields: {
        min: {
          value: 0.001,
        },
        max: {
          value: 0.03,
        },
        mean: {
          value: 0.0153,
        },
        standardDeviation: {
          value: null,
        },
        ucl: {
          value: null,
        },
      },
      reportCells: {
        '300008-1': {
          value: '0.001',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: true,
          prefix: 'exactValue',
          exceededCriteria: {
            Waste: [],
          },
          criteriaLimits: {
            Waste: [],
          },
          displayOptions: null,
        },
        '300008-2': {
          value: '0.01',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: true,
          prefix: 'exactValue',
          exceededCriteria: {
            Waste: [],
          },
          criteriaLimits: {
            Waste: [],
          },
          displayOptions: null,
        },
        '300008-3': {
          value: '0.02',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: true,
          prefix: 'exactValue',
          exceededCriteria: {
            Waste: [],
          },
          criteriaLimits: {
            Waste: [],
          },
          displayOptions: null,
        },
        '300008-4': {
          value: '0.03',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: true,
          prefix: 'exactValue',
          exceededCriteria: {
            Waste: [],
          },
          criteriaLimits: {
            Waste: [],
          },
          displayOptions: null,
        },
      },
      wcType: null,
    },
    {
      chemical: 'PFOS',
      code: '1763-23-1',
      group: 'PFAS',
      isCalculated: false,
      isCalculable: false,
      units: 'mg/L',
      pqlValue: 0.00001,
      pqlPrefix: 'NaN',
      groupSortOrder: 13,
      sortOrder: 3.5,
      isHiddenInReport: false,
      chemicalCodeForAssessing: '1763-23-1',
      replicates: [],
      extraFields: {
        min: {
          value: 0.0003,
        },
        max: {
          value: 0.031,
        },
        mean: {
          value: 0.01543,
        },
        standardDeviation: {
          value: null,
        },
        ucl: {
          value: null,
        },
      },
      reportCells: {
        '300008-1': {
          value: '0.0003',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: false,
          prefix: 'less',
          exceededCriteria: {},
          criteriaLimits: {},
          displayOptions: null,
        },
        '300008-2': {
          value: '0.03',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: false,
          prefix: 'less',
          exceededCriteria: {},
          criteriaLimits: {},
          displayOptions: null,
        },
        '300008-3': {
          value: '0.0004',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: false,
          prefix: 'less',
          exceededCriteria: {},
          criteriaLimits: {},
          displayOptions: null,
        },
        '300008-4': {
          value: '0.031',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: false,
          prefix: 'less',
          exceededCriteria: {},
          criteriaLimits: {},
          displayOptions: null,
        },
      },
      wcType: AslpTclpType.Tclp,
    },
    {
      chemical: 'PFOS+PFHxS (Calculated)',
      code: '355-46-4/1763-23-1',
      group: 'PFAS',
      isCalculated: false,
      isCalculable: true,
      units: 'mg/kg',
      pqlValue: 0.0001,
      pqlPrefix: 'NaN',
      groupSortOrder: 13,
      sortOrder: 5,
      isHiddenInReport: false,
      chemicalCodeForAssessing: '355-46-4/1763-23-1',
      replicates: [],
      extraFields: {
        min: {
          value: 0.05,
        },
        max: {
          value: 0.08,
        },
        mean: {
          value: 0.065,
        },
        standardDeviation: {
          value: null,
        },
        ucl: {
          value: null,
        },
      },
      reportCells: {
        '300008-1': {
          value: '0.05',
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
                  chemicalCode: '355-46-4/1763-23-1',
                  criterionCode: 'SCC1',
                },
                state: 'NSW',
                value: 1.8,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '355-46-4/1763-23-1',
                  criterionCode: 'SCC2',
                },
                state: 'NSW',
                value: 7.2,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '355-46-4/1763-23-1',
                  criterionCode: 'TCLP1',
                },
                state: 'NSW',
                value: 0.05,
                units: 'mg/L',
              },
              {
                criterionDetail: {
                  chemicalCode: '355-46-4/1763-23-1',
                  criterionCode: 'TCLP2',
                },
                state: 'NSW',
                value: 0.2,
                units: 'mg/L',
              },
            ],
          },
          displayOptions: null,
        },
        '300008-2': {
          value: '0.06',
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
                  chemicalCode: '355-46-4/1763-23-1',
                  criterionCode: 'SCC1',
                },
                state: 'NSW',
                value: 1.8,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '355-46-4/1763-23-1',
                  criterionCode: 'SCC2',
                },
                state: 'NSW',
                value: 7.2,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '355-46-4/1763-23-1',
                  criterionCode: 'TCLP1',
                },
                state: 'NSW',
                value: 0.05,
                units: 'mg/L',
              },
              {
                criterionDetail: {
                  chemicalCode: '355-46-4/1763-23-1',
                  criterionCode: 'TCLP2',
                },
                state: 'NSW',
                value: 0.2,
                units: 'mg/L',
              },
            ],
          },
          displayOptions: null,
        },
        '300008-3': {
          value: '0.07',
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
                  chemicalCode: '355-46-4/1763-23-1',
                  criterionCode: 'SCC1',
                },
                state: 'NSW',
                value: 1.8,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '355-46-4/1763-23-1',
                  criterionCode: 'SCC2',
                },
                state: 'NSW',
                value: 7.2,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '355-46-4/1763-23-1',
                  criterionCode: 'TCLP1',
                },
                state: 'NSW',
                value: 0.05,
                units: 'mg/L',
              },
              {
                criterionDetail: {
                  chemicalCode: '355-46-4/1763-23-1',
                  criterionCode: 'TCLP2',
                },
                state: 'NSW',
                value: 0.2,
                units: 'mg/L',
              },
            ],
          },
          displayOptions: null,
        },
        '300008-4': {
          value: '0.08',
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
                  chemicalCode: '355-46-4/1763-23-1',
                  criterionCode: 'SCC1',
                },
                state: 'NSW',
                value: 1.8,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '355-46-4/1763-23-1',
                  criterionCode: 'SCC2',
                },
                state: 'NSW',
                value: 7.2,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '355-46-4/1763-23-1',
                  criterionCode: 'TCLP1',
                },
                state: 'NSW',
                value: 0.05,
                units: 'mg/L',
              },
              {
                criterionDetail: {
                  chemicalCode: '355-46-4/1763-23-1',
                  criterionCode: 'TCLP2',
                },
                state: 'NSW',
                value: 0.2,
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
      chemical: 'PFOS+PFHxS (Calculated)',
      code: '355-46-4/1763-23-1',
      group: 'PFAS',
      isCalculated: false,
      isCalculable: true,
      units: 'mg/L',
      pqlValue: 0.00001,
      pqlPrefix: 'NaN',
      groupSortOrder: 13,
      sortOrder: 5.5,
      isHiddenInReport: false,
      chemicalCodeForAssessing: '355-46-4/1763-23-1',
      replicates: [],
      extraFields: {
        min: {
          value: 0.0004,
        },
        max: {
          value: 0.041,
        },
        mean: {
          value: 0.02048,
        },
        standardDeviation: {
          value: null,
        },
        ucl: {
          value: null,
        },
      },
      reportCells: {
        '300008-1': {
          value: '0.0004',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: false,
          prefix: 'less',
          exceededCriteria: {
            Waste: [],
          },
          criteriaLimits: {
            Waste: [
              {
                criterionDetail: {
                  chemicalCode: '355-46-4/1763-23-1',
                  criterionCode: 'SCC1',
                },
                state: 'NSW',
                value: 1.8,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '355-46-4/1763-23-1',
                  criterionCode: 'SCC2',
                },
                state: 'NSW',
                value: 7.2,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '355-46-4/1763-23-1',
                  criterionCode: 'TCLP1',
                },
                state: 'NSW',
                value: 0.05,
                units: 'mg/L',
              },
              {
                criterionDetail: {
                  chemicalCode: '355-46-4/1763-23-1',
                  criterionCode: 'TCLP2',
                },
                state: 'NSW',
                value: 0.2,
                units: 'mg/L',
              },
            ],
          },
          displayOptions: null,
        },
        '300008-2': {
          value: '0.04',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: false,
          prefix: 'less',
          exceededCriteria: {
            Waste: [],
          },
          criteriaLimits: {
            Waste: [
              {
                criterionDetail: {
                  chemicalCode: '355-46-4/1763-23-1',
                  criterionCode: 'SCC1',
                },
                state: 'NSW',
                value: 1.8,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '355-46-4/1763-23-1',
                  criterionCode: 'SCC2',
                },
                state: 'NSW',
                value: 7.2,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '355-46-4/1763-23-1',
                  criterionCode: 'TCLP1',
                },
                state: 'NSW',
                value: 0.05,
                units: 'mg/L',
              },
              {
                criterionDetail: {
                  chemicalCode: '355-46-4/1763-23-1',
                  criterionCode: 'TCLP2',
                },
                state: 'NSW',
                value: 0.2,
                units: 'mg/L',
              },
            ],
          },
          displayOptions: null,
        },
        '300008-3': {
          value: '0.0005',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: false,
          prefix: 'less',
          exceededCriteria: {
            Waste: [],
          },
          criteriaLimits: {
            Waste: [
              {
                criterionDetail: {
                  chemicalCode: '355-46-4/1763-23-1',
                  criterionCode: 'SCC1',
                },
                state: 'NSW',
                value: 1.8,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '355-46-4/1763-23-1',
                  criterionCode: 'SCC2',
                },
                state: 'NSW',
                value: 7.2,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '355-46-4/1763-23-1',
                  criterionCode: 'TCLP1',
                },
                state: 'NSW',
                value: 0.05,
                units: 'mg/L',
              },
              {
                criterionDetail: {
                  chemicalCode: '355-46-4/1763-23-1',
                  criterionCode: 'TCLP2',
                },
                state: 'NSW',
                value: 0.2,
                units: 'mg/L',
              },
            ],
          },
          displayOptions: null,
        },
        '300008-4': {
          value: '0.041',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: false,
          prefix: 'less',
          exceededCriteria: {
            Waste: [],
          },
          criteriaLimits: {
            Waste: [
              {
                criterionDetail: {
                  chemicalCode: '355-46-4/1763-23-1',
                  criterionCode: 'SCC1',
                },
                state: 'NSW',
                value: 1.8,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '355-46-4/1763-23-1',
                  criterionCode: 'SCC2',
                },
                state: 'NSW',
                value: 7.2,
                units: 'mg/kg',
              },
              {
                criterionDetail: {
                  chemicalCode: '355-46-4/1763-23-1',
                  criterionCode: 'TCLP1',
                },
                state: 'NSW',
                value: 0.05,
                units: 'mg/L',
              },
              {
                criterionDetail: {
                  chemicalCode: '355-46-4/1763-23-1',
                  criterionCode: 'TCLP2',
                },
                state: 'NSW',
                value: 0.2,
                units: 'mg/L',
              },
            ],
          },
          displayOptions: null,
        },
      },
      wcType: AslpTclpType.Tclp,
    },
  ];
}
