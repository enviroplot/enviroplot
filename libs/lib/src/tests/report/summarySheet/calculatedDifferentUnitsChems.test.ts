import {Workbook, Worksheet} from 'exceljs';
let Excel = require('exceljs');
import seedDataReader from '../../../readers/seedDataReader';

import summarySheetRenderer from '../../../report/summarySheet/summarySheetRenderer';

/* 
  THIS TEST checks if Calculated chems are displayed properly when units are different but compatible
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

  test('testing: renderSummarySheet() checks if Calculated chems are displayed properly when units are different but compatible', async () => {
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

    // test units row
    expect(ws.getCell('D9').text).toBe('mg/kg');
    expect(ws.getCell('E9').text).toBe('mg/L');
    expect(ws.getCell('F9').text).toBe('mg/kg');
    expect(ws.getCell('G9').text).toBe('mg/L');
    expect(ws.getCell('H9').text).toBe('cmol/kg');

    // test result values
    expect(ws.getCell('A10').text).toBe('SP09B-1'); // Sample ID
    expect(ws.getCell('D10').text).toBe('<0.1');
    expect(ws.getCell('E10').text).toBe('0.201');
    expect(ws.getCell('F10').text).toBe('1');
    expect(ws.getCell('G10').text).toBe('<0.3');
    expect(ws.getCell('H10').text).toBe('50');

    expect(ws.getCell('A11').text).toBe('SP09B-2'); // Sample ID
    expect(ws.getCell('D11').text).toBe('<1');
    expect(ws.getCell('E11').text).toBe('<0.201');
    expect(ws.getCell('F11').text).toBe('10');
    expect(ws.getCell('G11').text).toBe('<30');
    expect(ws.getCell('H11').text).toBe('60');
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
    combinedChemicalsDisplay: {'355-46-4/1763-23-1': 'all'},
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
      dateSampled: '07/07/22',
      dpSampleId: 'SP09B-1',
      labReportNo: null,
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
          units: 'ug/kg',
          pqlValue: 12,
          pqlPrefix: 'exactValue',
          prefix: 'less',
          resultValue: 100,
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
          units: 'mg/kg',
          pqlValue: 1,
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
          units: 'cmol/kg',
          pqlValue: 12,
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
          units: 'μg/l',
          pqlValue: 12,
          pqlPrefix: 'exactValue',
          prefix: 'exactValue',
          resultValue: 201,
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
          units: 'mg/l',
          pqlValue: 2,
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
          units: 'cmol/kg',
          pqlValue: 12,
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
      dateSampled: '07/07/22',
      labReportNo: null,
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
          units: 'ug/kg',
          pqlValue: 12,
          pqlPrefix: 'exactValue',
          prefix: 'less',
          resultValue: 1000,
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
          units: 'mg/kg',
          pqlValue: 1,
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
          units: 'cmol/kg',
          pqlValue: 12,
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
          units: 'μg/l',
          pqlValue: 12,
          pqlPrefix: 'exactValue',
          prefix: 'less',
          resultValue: 201,
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
          units: 'mg/l',
          pqlValue: 2,
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
          units: 'cmol/kg',
          pqlValue: 12,
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
          units: 'ug/kg',
          pqlValue: 12,
          pqlPrefix: 'exactValue',
          prefix: 'less',
          resultValue: 1900,
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
          units: 'mg/kg',
          pqlValue: 1,
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
          units: 'cmol/kg',
          pqlValue: 12,
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
          units: 'μg/l',
          pqlValue: 12,
          pqlPrefix: 'exactValue',
          prefix: 'exactValue',
          resultValue: 3801,
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
          units: 'mg/l',
          pqlValue: 2,
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
          units: 'cmol/kg',
          pqlValue: 12,
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
          units: 'ug/kg',
          pqlValue: 12,
          pqlPrefix: 'exactValue',
          prefix: 'less',
          resultValue: 2800,
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
          units: 'mg/kg',
          pqlValue: 1,
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
          units: 'cmol/kg',
          pqlValue: 12,
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
          units: 'μg/l',
          pqlValue: 12,
          pqlPrefix: 'exactValue',
          prefix: 'exactValue',
          resultValue: 5601,
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
          units: 'mg/l',
          pqlValue: 2,
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
          units: 'cmol/kg',
          pqlValue: 12,
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
      pqlValue: 0.012,
      pqlPrefix: 'NaN',
      groupSortOrder: 13,
      sortOrder: 2,
      isHiddenInReport: false,
      chemicalCodeForAssessing: '355-46-4',
      replicates: [],
      extraFields: {
        min: {
          value: 0.1,
        },
        max: {
          value: 2.8,
        },
        mean: {
          value: 1.45,
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
          value: '0.1',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: false,
          prefix: 'less',
          exceededCriteria: {},
          criteriaLimits: {},
          displayOptions: null,
        },
        '300008-2': {
          value: '1',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: false,
          prefix: 'less',
          exceededCriteria: {},
          criteriaLimits: {},
          displayOptions: null,
        },
        '300008-3': {
          value: '1.9',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: false,
          prefix: 'less',
          exceededCriteria: {},
          criteriaLimits: {},
          displayOptions: null,
        },
        '300008-4': {
          value: '2.8',
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
      pqlValue: 0.012,
      pqlPrefix: 'NaN',
      groupSortOrder: 13,
      sortOrder: 2.5,
      isHiddenInReport: false,
      chemicalCodeForAssessing: '355-46-4',
      replicates: [],
      extraFields: {
        min: {
          value: 0.201,
        },
        max: {
          value: 5.601,
        },
        mean: {
          value: 2.451,
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
          value: '0.201',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: true,
          prefix: 'exactValue',
          exceededCriteria: {},
          criteriaLimits: {},
          displayOptions: null,
        },
        '300008-2': {
          value: '0.201',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: false,
          prefix: 'less',
          exceededCriteria: {},
          criteriaLimits: {},
          displayOptions: null,
        },
        '300008-3': {
          value: '3.801',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: true,
          prefix: 'exactValue',
          exceededCriteria: {},
          criteriaLimits: {},
          displayOptions: null,
        },
        '300008-4': {
          value: '5.601',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: true,
          prefix: 'exactValue',
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
      pqlValue: 1,
      pqlPrefix: 'NaN',
      groupSortOrder: 13,
      sortOrder: 3,
      isHiddenInReport: false,
      chemicalCodeForAssessing: '1763-23-1',
      replicates: [],
      extraFields: {
        min: {
          value: 1,
        },
        max: {
          value: 30,
        },
        mean: {
          value: 15,
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
          value: '1',
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
          value: '10',
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
          value: '20',
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
          value: '30',
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
      pqlValue: 2,
      pqlPrefix: 'NaN',
      groupSortOrder: 13,
      sortOrder: 3.5,
      isHiddenInReport: false,
      chemicalCodeForAssessing: '1763-23-1',
      replicates: [],
      extraFields: {
        min: {
          value: 0.3,
        },
        max: {
          value: 31,
        },
        mean: {
          value: 15,
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
          value: '0.3',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: false,
          prefix: 'less',
          exceededCriteria: {},
          criteriaLimits: {},
          displayOptions: null,
        },
        '300008-2': {
          value: '30',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: false,
          prefix: 'less',
          exceededCriteria: {},
          criteriaLimits: {},
          displayOptions: null,
        },
        '300008-3': {
          value: '0.4',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: false,
          prefix: 'less',
          exceededCriteria: {},
          criteriaLimits: {},
          displayOptions: null,
        },
        '300008-4': {
          value: '31',
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
      units: 'cmol/kg',
      pqlValue: 12,
      pqlPrefix: 'NaN',
      groupSortOrder: 13,
      sortOrder: 5,
      isHiddenInReport: false,
      chemicalCodeForAssessing: '355-46-4/1763-23-1',
      replicates: [],
      extraFields: {
        min: {
          value: 50,
        },
        max: {
          value: 80,
        },
        mean: {
          value: 65,
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
          value: '50',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: true,
          prefix: 'exactValue',
          exceededCriteria: {
            Waste: [
              {
                criterionCode: 'SCC2',
                limitValue: 7.2,
              },
            ],
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
          displayOptions: {
            backgroundColor: ReportColors.Orange,
            textColor: null,
            isBold: false,
          },
        },
        '300008-2': {
          value: '60',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: true,
          prefix: 'exactValue',
          exceededCriteria: {
            Waste: [
              {
                criterionCode: 'SCC2',
                limitValue: 7.2,
              },
            ],
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
          displayOptions: {
            backgroundColor: ReportColors.Orange,
            textColor: null,
            isBold: false,
          },
        },
        '300008-3': {
          value: '70',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: true,
          prefix: 'exactValue',
          exceededCriteria: {
            Waste: [
              {
                criterionCode: 'SCC2',
                limitValue: 7.2,
              },
            ],
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
          displayOptions: {
            backgroundColor: ReportColors.Orange,
            textColor: null,
            isBold: false,
          },
        },
        '300008-4': {
          value: '80',
          isAsbestosValue: false,
          isAsbestosDetected: false,
          highlightDetection: true,
          prefix: 'exactValue',
          exceededCriteria: {
            Waste: [
              {
                criterionCode: 'SCC2',
                limitValue: 7.2,
              },
            ],
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
          displayOptions: {
            backgroundColor: ReportColors.Orange,
            textColor: null,
            isBold: false,
          },
        },
      },
      wcType: null,
    },
  ];
}
