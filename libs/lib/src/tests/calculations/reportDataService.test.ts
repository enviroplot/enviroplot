import * as _ from 'lodash';

import reportDataService from './../../calculations/reportDataService';
import utils from '../../utils';

const fs = utils.loadModule('fs-extra');

describe('Returning correct soil criteria items', () => {
  let seedData: SeedData = undefined;
  let sampleParametersForSample: SampleParameters = undefined;
  let depth: Depth = undefined;

  beforeEach(async () => {
    const seedDataPath = './data/seed/seed.json';

    seedData = await fs.readJson(seedDataPath);
    sampleParametersForSample = {
      soilType: SoilType.Sand,
      soilTexture: SoilTexture.Coarse,
      ph: {
        value: 1,
        type: ParameterValueType.Assumed,
      },
      cec: {value: 1, type: ParameterValueType.Assumed},
      clayContent: {value: 1, type: ParameterValueType.Assumed},
      mbc: 1,
      contaminationType: ContaminationType.Aged,
      state: State.ALL,
      trafficVolume: TrafficVolume.High,
      ironContent: {value: 1, type: ParameterValueType.Assumed},
      organicCarbon: {
        value: 1,
        type: ParameterValueType.Assumed,
      },
    };
    depth = {from: 0, to: 1};
  });

  test('getSoilCriteriaInfo function', async () => {
    const chemicalAndValueAndChemCodeForAssessingHilA: ChemicalReportDataAndValue = {
      chemicalCode: '7440-38-2',
      chemicalGroupCode: 'Metals_std',
      resultValue: 101,
      chemicalCodeForAssessing: '7440-38-2',
      units: 'mg/kg',
      wcType: AslpTclpType.Aslp,
    };

    const chemicalAndValueAndChemCodeForAssessingHslAB: ChemicalReportDataAndValue = {
      chemicalCode: '71-43-2',
      chemicalGroupCode: 'BTEX_std',
      resultValue: 10,
      chemicalCodeForAssessing: '71-43-2',
      units: 'mg/kg',
      wcType: AslpTclpType.Aslp,
    };

    const chemicalAndValueAndChemCodeForAssessingEilAES: ChemicalReportDataAndValue = {
      chemicalCode: '7440-66-6',
      chemicalGroupCode: 'Metals_std',
      resultValue: 80,
      chemicalCodeForAssessing: '7440-66-6',
      units: 'mg/kg',
      wcType: AslpTclpType.Aslp,
    };

    const chemicalAndValueAndChemCodeForAssessingEslAES: ChemicalReportDataAndValue = {
      chemicalCode: 'F1-BTEX',
      chemicalGroupCode: 'TRH_std',
      resultValue: 300,
      chemicalCodeForAssessing: 'F1-BTEX',
      units: 'mg/kg',
      wcType: AslpTclpType.Aslp,
    };

    const seedData: SoilAssessmentCalculationData = {
      chemicalGroups: [],
      chemicals: [],
      chemicalsByGroup: [],
      calculatedChemicals: [],
      calculations: [],
      criteriaGroups: [],
      criteria: [
        {
          category: CriterionCategory.Health,
          code: 'HIL A',
          group: 'HEALTH INVESTIGATION LEVELS',
          name: 'Residential / Low - High Density',
          sortOrder: 1,
          dataSource: '',
        },
        {
          category: CriterionCategory.Health,
          code: 'HSL A/B',
          group: 'HEALTH SCREENING LEVELS',
          name: 'Residential / Low - High Density',
          sortOrder: 5,
          dataSource: '',
        },
        {
          category: CriterionCategory.Ecological,
          code: 'EIL AES',
          group: 'ECOLOGICAL INVESTIGATION LEVELS',
          name: 'Areas of Ecological Significance',
          sortOrder: 15,
          dataSource: '',
        },
        {
          category: CriterionCategory.Ecological,
          code: 'ESL AES',
          group: 'ECOLOGICAL SCREENING LEVELS',
          name: 'Areas of Ecological Significance',
          sortOrder: 18,
          dataSource: '',
        },
      ],
      hilCriterionDetails: [
        {
          criterionDetail: {
            chemicalCode: '7440-38-2',
            criterionCode: 'HIL A',
          },
          value: 100,
          units: 'mg/kg',
          criterionDataSource: 'NEPC (2013)',
        },
      ],
      hslCriterionDetails: [
        {
          criterionDetail: {chemicalCode: '71-43-2', criterionCode: 'HSL A/B'},
          depthLevel: HslDepthLevel.Depth_0_to_1,
          isUnlimited: false,
          soilType: SoilType.Sand,
          value: 0.5,
          units: 'mg/kg',
          criterionDataSource: 'NEPC (2013)',
        },
      ],
      dcCriterionDetails: [],
      eilCriterionDetails: [
        {
          cec: 5,
          contaminationType: null,
          criterionDetail: {chemicalCode: '7440-66-6', criterionCode: 'EIL AES'},
          ph: 4,
          value: 15,
          units: 'mg/kg',
          criterionDataSource: 'NEPC (2013)',
        },
      ],
      eslCriterionDetails: [
        {
          criterionDetail: {chemicalCode: 'F1-BTEX', criterionCode: 'ESL AES'},
          soilTexture: SoilTexture.Coarse,
          value: 125,
          units: 'mg/kg',
          criterionDataSource: 'NEPC (2013)',
        },
      ],
      mlCriterionDetails: [],
      egvCriterionDetails: [],
    };

    const stubResultForHilAExceededCriteria = [
      {
        criterionCode: 'HIL A',
        limitValue: 100,
      },
    ];
    const stubResultForHilACriteriaLimits = [
      {
        criterionDetail: {chemicalCode: '7440-38-2', criterionCode: 'HIL A'},
        value: 100,
        units: 'mg/kg',
        criterionDataSource: 'NEPC (2013)',
      },
    ];

    const stubResultForHslABExceededCriteria = [
      {
        criterionCode: 'HSL A/B',
        limitValue: 0.5,
      },
    ];
    const stubResultForHslABCriteriaLimitsDetail = {chemicalCode: '71-43-2', criterionCode: 'HSL A/B'};
    const stubResultForHslABCriteriaLimitsValue = 0.5;

    const stubResultForEilAEExceededCriteria = [
      {
        criterionCode: 'EIL AES',
        limitValue: 2,
      },
    ];
    const stubResultForEilAESCriteriaLimits = [
      {criterionDetail: {chemicalCode: '7440-66-6', criterionCode: 'EIL AES'}, value: 2},
    ];

    const stubResultForEslAESExceededCriteria = [
      {
        criterionCode: 'ESL AES',
        limitValue: 125,
      },
    ];
    const stubResultForEslAESCriteriaLimitsDetail = {chemicalCode: 'F1-BTEX', criterionCode: 'ESL AES'};
    const stubResultForEslAESCriteriaLimitsValue = 125;

    const calculatedResultForHilA = await reportDataService.getSoilCriteriaInfo(
      chemicalAndValueAndChemCodeForAssessingHilA,
      sampleParametersForSample,
      seedData,
      depth
    );
    const calculatedResultForHslAB = await reportDataService.getSoilCriteriaInfo(
      chemicalAndValueAndChemCodeForAssessingHslAB,
      sampleParametersForSample,
      seedData,
      depth
    );
    const calculatedResultForEilAES = await reportDataService.getSoilCriteriaInfo(
      chemicalAndValueAndChemCodeForAssessingEilAES,
      sampleParametersForSample,
      seedData,
      depth
    );
    const calculatedResultForEslAES = await reportDataService.getSoilCriteriaInfo(
      chemicalAndValueAndChemCodeForAssessingEslAES,
      sampleParametersForSample,
      seedData,
      depth
    );

    expect(Object.values(calculatedResultForHilA.exceededCriteria['HEALTH INVESTIGATION LEVELS'])).toEqual(
      stubResultForHilAExceededCriteria
    );
    expect(Object.values(calculatedResultForHilA.criteriaLimits['Health'])).toEqual(stubResultForHilACriteriaLimits);

    expect(Object.values(calculatedResultForHslAB.exceededCriteria['HEALTH SCREENING LEVELS'])).toEqual(
      stubResultForHslABExceededCriteria
    );
    expect(Object.values(calculatedResultForHslAB.criteriaLimits['Health'][0])).toContainEqual(
      stubResultForHslABCriteriaLimitsDetail
    );
    expect(Object.values(calculatedResultForHslAB.criteriaLimits['Health'][0])).toContainEqual(
      stubResultForHslABCriteriaLimitsValue
    );

    expect(Object.values(calculatedResultForEilAES.exceededCriteria['ECOLOGICAL INVESTIGATION LEVELS'])).toEqual(
      stubResultForEilAEExceededCriteria
    );
    expect(Object.values(calculatedResultForEilAES.criteriaLimits['Ecological'])).toEqual(
      stubResultForEilAESCriteriaLimits
    );

    expect(Object.values(calculatedResultForEslAES.exceededCriteria['ECOLOGICAL SCREENING LEVELS'])).toEqual(
      stubResultForEslAESExceededCriteria
    );
    expect(Object.values(calculatedResultForEslAES.criteriaLimits['Ecological'][0])).toContainEqual(
      stubResultForEslAESCriteriaLimitsDetail
    );
    expect(Object.values(calculatedResultForEslAES.criteriaLimits['Ecological'][0])).toContainEqual(
      stubResultForEslAESCriteriaLimitsValue
    );
  });

  test('Should return values for HSL 0-1 m', async () => {
    const chemicalMeasurementStub: ChemicalReportDataAndValue = {
      chemicalCode: '71-43-2',
      chemicalGroupCode: 'BTEX_std',
      resultValue: 3,
      chemicalCodeForAssessing: '71-43-2',
      units: 'mg',
    };
    const result: ResultCriteriaInfo = await reportDataService.getSoilCriteriaInfo(
      chemicalMeasurementStub,
      sampleParametersForSample,
      seedData.soilData,
      depth
    );
    expect(result.exceededCriteria[SoilCriterionTypeName.HSL_0_1]).toHaveLength(1);
    expect(result.exceededCriteria[SoilCriterionTypeName.HSL_0_1][0].limitValue).toBe(0.5);
  });
});

describe('Returning correct water criteria items', () => {
  let seedData: SeedData = undefined;
  let sessionParametersWater: SessionParameters = undefined;

  beforeEach(async () => {
    const seedDataPath = './data/seed/seed.json';

    seedData = await fs.readJson(seedDataPath);
    sessionParametersWater = {
      applyBiodegradation: false,
      highlightAllDetections: false,
      displayOptions: {
        showDepthColumn: true,
        showSummaryStatistics: false,
        showStatisticalInfoForContaminants: false,
      },
      criteria: ['PUHealth', 'PUIrrigationSTV', 'PURecreation', 'PUIrrigationLTV'],
      chemicalGroups: {Soil: [], Waste: [], Water: [], '': []},
      combinedChemicalsDisplay: {},
      edits: {},
      reportOutputFormat: ReportOutputFormat.STANDARD_OUTPUT_FORMAT,
      projectDetails: {
        assessmentType: AssessmentType.Water,
        state: State.NSW,
        type: '',
        name: '',
        number: '',
        location: '',
        date: '',
      },
      waterAssessmentParameters: {
        waterEnvironment: GwWaterEnvironment.Fresh,
        levelOfProtection: {
          bioAccumulative: GwSpeciesProtectionLevel.Level_99,
          pfas: GwSpeciesProtectionLevel.Level_99,
          others: GwSpeciesProtectionLevel.Level_99,
        },
        potentialUse: GwPotentialUse.Health,
        soilType: SoilType.Clay,
        waterDepth: GwHslDepthLevel.Depth_2_to_4,
        vapourIntrusionHsl: GwHslType.GW_HSL_AB,
      },
    };
  });

  test('test getWaterCriteriaInfo', async () => {
    const chemicalReportDataAndValueInput: ChemicalReportDataAndValue = {
      chemicalCode: '7440-38-2',
      chemicalCodeForAssessing: '7440-38-2',
      chemicalGroupCode: 'METALS',
      resultValue: 3,
      units: 'μg/L',
      wcType: null,
    };

    const resultDataStub = {
      exceededCriteria: {
        PU: [] as any[],
        WQ: [
          {
            criterionCode: 'WQFresh',
            limitValue: 0.8,
          },
        ],
        VI: [] as any[],
      },
      criteriaLimits: {
        Water: [
          {
            criterionDetail: {
              chemicalCode: '7440-38-2',
              criterionCode: 'PUHealth',
            },
            value: 10,
            units: 'μg/L',
          },
          {
            criterionDetail: {
              chemicalCode: '7440-38-2',
              criterionCode: 'PURecreation',
            },
            value: 100,
            units: 'μg/L',
          },
          {
            criterionDetail: {
              chemicalCode: '7440-38-2',
              criterionCode: 'PUIrrigationSTV',
            },
            value: 2000,
            units: 'μg/L',
          },
          {
            criterionDetail: {
              chemicalCode: '7440-38-2',
              criterionCode: 'PUIrrigationLTV',
            },
            value: 100,
            units: 'μg/L',
          },
          {
            criterionDetail: {
              chemicalCode: '7440-38-2',
              criterionCode: 'WQFresh',
            },
            speciesProtectionLevel: 'Level_99',
            units: 'μg/L',
            value: 0.8,
            waterEnvironment: 'Fresh',
          },
        ],
      },
    };
    const result: ResultCriteriaInfo = await reportDataService.getWaterCriteriaInfo(
      chemicalReportDataAndValueInput,
      sessionParametersWater,
      seedData.waterData
    );
    console.log(result);
    expect(result).toEqual(resultDataStub);
  });
});
