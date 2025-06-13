import {Workbook} from 'exceljs';
let Excel = require('exceljs');
import seedDataReader from '../../../readers/seedDataReader';
import {reportItems, sessionParametersWater, chemicalGroups, tableGroups} from '../../test_data/parametersForTests';

import summarySheetGenerator from '../../../report/summarySheet/summarySheetGenerator';

describe('should generate summary sheet report', () => {
  let wb: Workbook = null;
  let seedDataSoil: SoilAssessmentCalculationData = null;
  let seedDataGw: GwCalculationData = null;
  let seedDataWaste: WasteClassificationCalculationData = null;

  let chemicalsSeedFilePath = './data/seed/SeedData_chemicals.xlsx';
  let soilAssessmentSeedFilePath = './data/seed/SeedData_soil.xlsx';
  let wasteAssessmentSeedFilePath = './data/seed/SeedData_waste.xlsx';
  let waterAssessmentSeedFilePath = './data/seed/SeedData_water.xlsx';

  beforeEach(() => {
    jest.setTimeout(50000);
    wb = new Excel.Workbook();
    wb.addWorksheet('test');
  });

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
    seedDataGw = seedData.waterData;
    seedDataWaste = seedData.wasteData;
  });

  const samples: Sample[] = [
    {
      dateSampled: '13/03/2019',
      depth: {from: 0, to: 0.1},
      dpSampleId: 'BH101',
      labName: 'Unknown',
      labSampleId: '213536-1',
      labReportNo: null,
      matrixType: 'soil',
      measurements: [],
      sampleType: 'Normal',
      isTripBlank: false,
      isTripSpike: false,
      soilType: 'Sand',
    },
  ];

  test('generateWaterSummarySheet function', async () => {
    let selectedGroupsKeys: string[] = [
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
    ];
    let dataFolderPath: string = './data';
    let showDepthColumn: boolean = true;
    let reportItemForWater: ReportItem[] = [
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
        replicates: [],
        reportCells: {
          '207346-1': {
            criteriaLimits: {
              Water: [{criterionDetail: {chemicalCode: 'TDS', criterionCode: 'PUHealth'}, value: null}],
            },
            displayOptions: {backgroundColor: null, textColor: null, isBold: false},
            exceededCriteria: {
              PU: [
                {
                  criterionCode: 'PUHealth',
                  limitValue: null,
                },
              ],
              VI: [],
              WQ: [],
            },
            highlightDetection: true,
            isAsbestosDetected: false,
            isAsbestosValue: false,
            prefix: 'exactValue',
            value: '14,000',
          },
        },
        sortOrder: 9,
        units: 'mg/L',
        wcType: null,
      },
    ];
    let samplesWater: Sample[] = [
      {
        dateSampled: '04/12/2018',
        depth: {from: 0, to: 0},
        dpSampleId: '7',
        labReportNo: null,
        labName: 'Unknown',
        labSampleId: '207346-1',
        matrixType: AssessmentType.Water,
        measurements: [],
        sampleType: 'Normal',
        isTripBlank: false,
        isTripSpike: false,
        soilType: null,
      },
    ];

    await summarySheetGenerator.generateWaterSummarySheet(
      wb,
      selectedGroupsKeys,
      reportItemForWater,
      seedDataGw,
      sessionParametersWater,
      samplesWater,
      dataFolderPath,
      showDepthColumn
    );
    expect(wb.worksheets[1].getCell('A3').text).toBe('Table : Summary of Laboratory Results – Physical Parameters');
    expect(wb.worksheets[1].getCell('D6').text).toBe('Physical Parameters');
    expect(wb.worksheets[1].getCell('D7').text).toBe('Total dissolved solids');
    expect(wb.worksheets[1].getCell('D8').text).toBe('5');
    expect(wb.worksheets[1].getCell('C8').text).toBe('PQL');
    expect(wb.worksheets[1].getCell('A14').text).toBe('Sample ID');
    expect(wb.worksheets[1].getCell('B14').text).toBe('Depth');
    expect(wb.worksheets[1].getCell('B15').text).toBe('0 m');
    expect(wb.worksheets[1].getCell('C14').text).toBe('Sample Date');
    expect(wb.worksheets[1].getCell('D14').text).toBe('mg/L');
    expect(wb.worksheets[1].getCell('A15').text).toBe('7');
    expect(wb.worksheets[1].getCell('B15').text).toBe('0 m');
    expect(wb.worksheets[1].getCell('C15').text).toBe('04/12/2018');
    expect(wb.worksheets[1].getCell('D15').text).toBe('14,000');
    expect(wb.worksheets[1].getCell('A17').text).toBe('Notes:');
  });

  test('generateWasteSummarySheet function', async () => {
    let selectedGroupsKeys: string[] = ['Metals', 'TRH', 'BTEX', 'PAH', 'OCP', 'OPP', 'PCB', 'Asbestos'];
    let dataFolderPath: string = './data';
    let showDepthColumn: boolean = true;
    let reportItemForWaste: ReportItem[] = [
      {
        chemical: 'Arsenic',
        chemicalCodeForAssessing: '7440-38-2',
        code: '7440-38-2',
        extraFields: {min: {value: 4}, max: {value: 4}, mean: {value: 4}, standardDeviation: null, ucl: null},
        group: 'Metals',
        groupSortOrder: 1,
        isCalculated: false,
        isHiddenInReport: false,
        pqlPrefix: 'exactValue',
        pqlValue: 4,
        replicates: [],
        reportCells: {
          '221669-1': {
            criteriaLimits: {
              Waste: [
                {
                  criterionDetail: {chemicalCode: '7440-38-2', criterionCode: 'CT1'},
                  value: 100,
                },
              ],
            },
            displayOptions: null,
            exceededCriteria: {
              Waste: [],
            },
            highlightDetection: false,
            isAsbestosDetected: false,
            isAsbestosValue: false,
            prefix: 'less',
            value: '4',
          },
        },
        sortOrder: 1,
        units: 'mg/kg',
        wcType: null,
      },
    ];
    let samplesWaste: Sample[] = [
      {
        dateSampled: '10/07/2019',
        depth: {from: 0, to: 0},
        dpSampleId: '1/0-0.1',
        labName: 'Unknown',
        labSampleId: '221669-1',
        matrixType: AssessmentType.Soil,
        measurements: [],
        sampleType: 'Normal',
        isTripBlank: false,
        isTripSpike: false,
        soilType: 'Sand',
        labReportNo: null,
      },
    ];
    let sessionParametersWaste = {...sessionParametersWater};
    sessionParametersWaste.chemicalGroups = {
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
    } as SessionChemicalGroups;
    sessionParametersWaste.criteria = [];
    sessionParametersWaste.projectDetails.assessmentType = AssessmentType.Waste;
    sessionParametersWaste.displayOptions = {
      showDepthColumn: true,
      showStatisticalInfoForContaminants: true,
      showSummaryStatistics: true,
    };

    await summarySheetGenerator.generateWasteSummarySheet(
      wb,
      selectedGroupsKeys,
      reportItemForWaste,
      seedDataWaste,
      sessionParametersWaste,
      samplesWaste,
      dataFolderPath,
      showDepthColumn
    );
    expect(wb.worksheets[1].getCell('A3').text).toBe('Table : Summary of Laboratory Results – Metals');
    expect(wb.worksheets[1].getCell('D6').text).toBe('Metals');
    expect(wb.worksheets[1].getCell('D7').text).toBe('Arsenic');
    expect(wb.worksheets[1].getCell('D8').text).toBe('4');
    expect(wb.worksheets[1].getCell('C8').text).toBe('PQL');
    expect(wb.worksheets[1].getCell('A9').text).toBe('Sample ID');
    expect(wb.worksheets[1].getCell('B9').text).toBe('Depth');
    expect(wb.worksheets[1].getCell('C9').text).toBe('Sample Date');
    expect(wb.worksheets[1].getCell('D9').text).toBe('mg/kg');
    expect(wb.worksheets[1].getCell('A10').text).toBe('1/0-0.1');
    expect(wb.worksheets[1].getCell('B10').text).toBe('0 m');
    expect(wb.worksheets[1].getCell('C10').text).toBe('10/07/2019');
    expect(wb.worksheets[1].getCell('D10').text).toBe('<4');
    expect(wb.worksheets[1].getCell('A11').text).toBe('Summary Statistics  ');

    expect(wb.worksheets[1].getCell('A12').text).toBe('Min');
    expect(wb.worksheets[1].getCell('D12').text).toBe('4');
    expect(wb.worksheets[1].getCell('A13').text).toBe('Max');
    expect(wb.worksheets[1].getCell('D13').text).toBe('4');
    expect(wb.worksheets[1].getCell('A14').text).toBe('Mean');
    expect(wb.worksheets[1].getCell('D14').text).toBe('4');
    expect(wb.worksheets[1].getCell('A15').text).toBe('Standard Deviation');
    expect(wb.worksheets[1].getCell('A16').text).toBe('95% UCL');

    expect(wb.worksheets[1].getCell('A17').text).toBe('Waste Classification Criteria  f');
    expect(wb.worksheets[1].getCell('A18').text).toBe('CT1');
    expect(wb.worksheets[1].getCell('D18').text).toBe('100');

    expect(wb.worksheets[1].getCell('A27').text).toBe('Notes:');
  });

  test('generateSoilSummarySheet function', async () => {
    let selectedGroupsKeys: string[] = [
      'Metals_std',
      'TRH_std',
      'BTEX_std',
      'PAH_std',
      'Phenol_std',
      'OCP_std',
      'OPP_std',
      'PCB_std',
      'ASB_std_AS',
    ];
    let dataFolderPath: string = './data';
    let showDepthColumn: boolean = true;
    const reportItemForOneCell: ReportItem[] = [
      {
        chemical: 'Arsenic',
        chemicalCodeForAssessing: '7440-38-2',
        code: '7440-38-2',
        extraFields: {},
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
                  value: 40,
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
          },
        },
        sortOrder: 1,
        units: 'mg/kg',
        wcType: null,
      },
    ];
    let sessionParametersSoil = {...sessionParametersWater};
    sessionParametersSoil.criteria = [
      'HIL A',
      'HSL A/B',
      'EIL AES',
      'ESL AES',
      'EGV-indir All',
      'ML C/Ind',
      'DC HSL A',
    ];
    sessionParametersSoil.projectDetails.assessmentType = AssessmentType.Soil;

    await summarySheetGenerator.generateSoilSummarySheet(
      wb,
      selectedGroupsKeys,
      reportItemForOneCell,
      seedDataSoil,
      sessionParametersSoil,
      samples,
      dataFolderPath,
      showDepthColumn
    );
    expect(wb.worksheets[1].getCell('A3').text).toBe('Table 1: Summary of Laboratory Results – Priority metals');
    expect(wb.worksheets[1].getCell('D6').text).toBe('Priority metals');
    expect(wb.worksheets[1].getCell('C8').text).toBe('PQL');
    expect(wb.worksheets[1].getCell('D8').text).toBe('4');
    expect(wb.worksheets[1].getCell('D9').text).toBe('mg/kg');
    expect(wb.worksheets[1].getCell('A9').text).toBe('Sample ID');
    expect(wb.worksheets[1].getCell('B9').text).toBe('Depth');
    expect(wb.worksheets[1].getCell('C9').text).toBe('Sample Date');
    expect(wb.worksheets[1].getCell('A10').text).toBe('BH101');
    expect(wb.worksheets[1].getCell('B10').text).toBe('0 - 0.1 m');
    expect(wb.worksheets[1].getCell('C10').text).toBe('13/03/2019');
    expect(wb.worksheets[1].getCell('D10').text).toBe('8');
    expect(wb.worksheets[1].getCell('D11').text).toBe('100');
    expect(wb.worksheets[1].getCell('E11').text).toBe('40');
    expect(wb.worksheets[1].getCell('A14').text).toBe('Lab result');
    expect(wb.worksheets[1].getCell('A15').text).toBe('HIL/HSL value');
    expect(wb.worksheets[1].getCell('B15').text).toBe('EIL/ESL/EGV value');
  });

  test('getSoilExcelTableGroups function', () => {
    let reportGroups: string[] = [
      'Metals_std',
      'TRH_std',
      'BTEX_std',
      'PAH_std',
      'Phenol_std',
      'OCP_std',
      'OPP_std',
      'PCB_std',
      'ASB_std_AS',
    ];

    let chemicalGroupsTable1: any[] = chemicalGroups.slice(0, 4);
    let chemicalGroupsTable2: any[] = chemicalGroups.slice(4);

    let excelTableGroups = summarySheetGenerator.getSoilExcelTableGroups(chemicalGroups, reportGroups);
    expect(excelTableGroups.table1).toStrictEqual(chemicalGroupsTable1);
    expect(excelTableGroups.table2).toStrictEqual(chemicalGroupsTable2);
    expect(excelTableGroups.table3).toStrictEqual(chemicalGroups);
  });

  test('getTableDataByPage function', () => {
    let pageGroupsTable1: ChemicalGroup[] = tableGroups.slice(0, 4);
    let pageGroupsTable2: ChemicalGroup[] = tableGroups.slice(4);
    let resultTable1: ReportItem[] = reportItems.slice(0, 4);
    let resultTable2: ReportItem[] = reportItems.slice(4);
    expect(summarySheetGenerator.getTableDataByPage(reportItems, pageGroupsTable1)).toStrictEqual(resultTable1);
    expect(summarySheetGenerator.getTableDataByPage(reportItems, pageGroupsTable2)).toStrictEqual(resultTable2);
    expect(summarySheetGenerator.getTableDataByPage(reportItems, tableGroups)).toStrictEqual(reportItems);
  });

  test('removePfasCriteriaIfNotTested function', () => {
    let sessionParametersPfasRemoved: SessionParameters = {
      applyBiodegradation: false,
      highlightAllDetections: true,
      chemicalGroups: {
        Soil: ['Metals_std'],
        Waste: ['Metals'],
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
        type: 'type',
        name: 'name',
        number: 'number',
        date: 'date',
        location: 'location',
      },
      criteria: ['PUHealth', 'PUIrrigationLTV', 'PUIrrigationSTV', 'PURecreation', 'WQFresh'],
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
    sessionParametersWater.projectDetails.assessmentType = AssessmentType.Water;
    summarySheetGenerator.removePfasCriteriaIfNotTested(sessionParametersWater, reportItems);
    expect(sessionParametersWater).toStrictEqual(sessionParametersPfasRemoved);
  });
});
