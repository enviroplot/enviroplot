import * as _ from 'lodash';
import soilCriteriaCalculator from './../../calculations/soilCriteriaCalculator';
import utils from '../../utils';

const fs = utils.loadModule('fs-extra');

describe('soil criteria calculations', () => {
  let seedData: SeedData = undefined;

  beforeEach(async () => {
    const seedDataPath = './data/seed/seed.json';

    seedData = await fs.readJson(seedDataPath);
    soilCriteriaCalculator.addCriteriaData(seedData.soilData);
  });
  test('should return hsl criteria for depth 0-1m', () => {
    const chemicalMeasurementStub: ChemicalReportDataAndValue = {
      chemicalCode: '71-43-2',
      chemicalGroupCode: 'BTEX_std',
      resultValue: 3,
      chemicalCodeForAssessing: '71-43-2',
      units: 'mg',
    };
    let criteria: Criterion[] = _.filter(seedData.soilData.criteria, {group: SoilCriterionTypeName.HSL});

    const cec: SampleValueParameter & {isSelected: boolean} = {
      value: 5.0,
      type: ParameterValueType.Assumed,
      isSelected: true,
    };

    const clayContent: SampleValueParameter & {isSelected: boolean} = {
      value: 5.0,
      type: ParameterValueType.Assumed,
      isSelected: true,
    };

    const ironContent: SampleValueParameter & {isSelected: boolean} = {
      value: 5.0,
      type: ParameterValueType.Assumed,
      isSelected: true,
    };

    const organicCarbon: SampleValueParameter & {isSelected: boolean} = {
      value: 5.0,
      type: ParameterValueType.Assumed,
      isSelected: true,
    };

    const ph: SampleValueParameter & {isSelected: boolean} = {
      value: 5.0,
      type: ParameterValueType.Assumed,
      isSelected: true,
    };

    const sampleParametersStub: SampleParameters = {
      cec: cec,
      clayContent: clayContent,
      contaminationType: ContaminationType.Aged,
      ironContent: ironContent,
      mbc: null,
      organicCarbon: organicCarbon,
      ph: ph,
      soilTexture: SoilTexture.Coarse,
      soilType: SoilType.Sand,
      state: State.NSW,
      trafficVolume: TrafficVolume.Low,
    };
    let result = soilCriteriaCalculator.validateHsl_0_1Exceedance(
      chemicalMeasurementStub,
      criteria,
      sampleParametersStub
    );

    expect(result.exceededCriteria).toHaveLength(1);
    expect(result.exceededCriteria[0].limitValue).toBe(0.5);
    expect(result.hslCriteriaLimits).toHaveLength(4);
  });

  test('validateSimpleCriteriaExceedance function', () => {
    let criteriaType: string = 'hil';
    let chemicalMeasurementLowValue: ChemicalReportDataAndValue = {
      chemicalCode: '7440-38-2',
      chemicalCodeForAssessing: '7440-38-2',
      chemicalGroupCode: 'Metals_std',
      resultValue: 8,
      units: 'mg/kg',
      wcType: null,
    };
    let chemicalMeasurementHighValue: ChemicalReportDataAndValue = {
      chemicalCode: '7440-38-2',
      chemicalCodeForAssessing: '7440-38-2',
      chemicalGroupCode: 'Metals_std',
      resultValue: 800,
      units: 'mg/kg',
      wcType: null,
    };
    let criteria: Criterion[] = [
      {
        category: CriterionCategory.Health,
        code: 'HIL A',
        group: 'HEALTH INVESTIGATION LEVELS',
        name: 'Residential / Low - High Density',
        sortOrder: 1,
        dataSource: '',
      },
    ];

    let resultLowValue = soilCriteriaCalculator.validateSimpleCriteriaExceedance(
      criteriaType,
      chemicalMeasurementLowValue,
      criteria
    );

    expect(resultLowValue.exceededCriteria).toStrictEqual([]);
    expect(resultLowValue.hilCriteriaLimits).toEqual([
      {
        criterionDataSource: 'NEPC (2013)',
        criterionDetail: {chemicalCode: '7440-38-2', criterionCode: 'HIL A'},
        units: 'mg/kg',
        value: 100,
      },
    ]);

    let resultHighValue = soilCriteriaCalculator.validateSimpleCriteriaExceedance(
      criteriaType,
      chemicalMeasurementHighValue,
      criteria
    );

    expect(resultHighValue.exceededCriteria).toStrictEqual([{criterionCode: 'HIL A', limitValue: 100}]);
    expect(resultHighValue.hilCriteriaLimits).toEqual([
      {
        criterionDataSource: 'NEPC (2013)',
        criterionDetail: {chemicalCode: '7440-38-2', criterionCode: 'HIL A'},
        units: 'mg/kg',
        value: 100,
      },
    ]);
  });

  test('validateEslMlCriteriaExceedance function', () => {
    let criteriaType: string = 'esl';
    let chemicalMeasurement: ChemicalReportDataAndValue = {
      chemicalCode: 'C10-C16',
      chemicalCodeForAssessing: 'C10-C16',
      chemicalGroupCode: 'TRH_std',
      resultValue: 200,
      units: 'mg/kg',
      wcType: null,
    };
    let criteria: Criterion[] = [
      {
        category: CriterionCategory.Ecological,
        code: 'ESL AES',
        group: 'ECOLOGICAL SCREENING LEVELS',
        name: 'Areas of Ecological Significance',
        sortOrder: 20,
        dataSource: '',
      },
    ];
    let sampleParameters: SampleParameters = {
      cec: {value: 5.0, type: ParameterValueType.Assumed},
      clayContent: {value: 10, type: ParameterValueType.Assumed},
      contaminationType: ContaminationType.Aged,
      ironContent: {value: 0, type: ParameterValueType.Assumed},
      mbc: null,
      organicCarbon: {value: 1, type: ParameterValueType.Assumed},
      ph: {value: 4, type: ParameterValueType.Assumed},
      soilTexture: SoilTexture.Coarse,
      soilType: SoilType.Sand,
      state: State.NSW,
      trafficVolume: TrafficVolume.Low,
    };

    let result = soilCriteriaCalculator.validateEslMlCriteriaExceedance(
      criteriaType,
      chemicalMeasurement,
      criteria,
      sampleParameters
    );
    expect(result.exceededCriteria).toEqual([
      {
        criterionCode: 'ESL AES',
        limitValue: 25,
      },
    ]);
    expect(result.eslCriteriaLimits).toEqual([
      {
        criterionDataSource: 'NEPC (2013)',
        criterionDetail: {chemicalCode: 'C10-C16', criterionCode: 'ESL AES'},
        soilTexture: 'Coarse',
        units: 'mg/kg',
        value: 25,
      },
    ]);
  });

  test('validateEilCriteriaExceedance function', () => {
    let chemicalMeasurementHighValue: ChemicalReportDataAndValue = {
      chemicalCode: '7440-38-2',
      chemicalCodeForAssessing: '7440-38-2',
      chemicalGroupCode: 'Metals_std',
      resultValue: 80,
      units: 'mg/kg',
      wcType: null,
    };
    let chemicalMeasurementLowValue: ChemicalReportDataAndValue = {
      chemicalCode: '7440-38-2',
      chemicalCodeForAssessing: '7440-38-2',
      chemicalGroupCode: 'Metals_std',
      resultValue: 8,
      units: 'mg/kg',
      wcType: null,
    };
    let criteria: Criterion[] = [
      {
        category: CriterionCategory.Ecological,
        code: 'EIL AES',
        group: 'ECOLOGICAL INVESTIGATION LEVELS',
        name: 'Areas of Ecological Significance',
        sortOrder: 14,
        dataSource: '',
      },
    ];
    let sampleParameters: SampleParameters = {
      cec: {value: 5.0, type: ParameterValueType.Assumed},
      clayContent: {value: 10, type: ParameterValueType.Assumed},
      contaminationType: ContaminationType.Aged,
      ironContent: {value: 0, type: ParameterValueType.Assumed},
      mbc: null,
      organicCarbon: {value: 1, type: ParameterValueType.Assumed},
      ph: {value: 4, type: ParameterValueType.Assumed},
      soilTexture: SoilTexture.Coarse,
      soilType: SoilType.Sand,
      state: State.NSW,
      trafficVolume: TrafficVolume.Low,
    };

    let resultLowValue = soilCriteriaCalculator.validateEilCriteriaExceedance(
      chemicalMeasurementLowValue,
      criteria,
      sampleParameters
    );

    expect(resultLowValue.exceededCriteria).toStrictEqual([]);
    expect(resultLowValue.eilCriteriaLimits).toEqual([
      {
        contaminationType: 'Aged',
        criterionDataSource: 'NEPC (2013)',
        criterionDetail: {chemicalCode: '7440-38-2', criterionCode: 'EIL AES'},
        units: 'mg/kg',
        value: 40,
      },
    ]);

    let resultHighValue = soilCriteriaCalculator.validateEilCriteriaExceedance(
      chemicalMeasurementHighValue,
      criteria,
      sampleParameters
    );

    expect(resultHighValue.exceededCriteria).toEqual([
      {
        criterionCode: 'EIL AES',
        limitValue: 40,
      },
    ]);
    expect(resultHighValue.eilCriteriaLimits).toEqual([
      {
        contaminationType: 'Aged',
        criterionDataSource: 'NEPC (2013)',
        criterionDetail: {chemicalCode: '7440-38-2', criterionCode: 'EIL AES'},
        units: 'mg/kg',
        value: 40,
      },
    ]);
  });

  test('validateHslCriteriaExceedanceForDepth function', () => {
    let chemicalMeasurementLowValue: ChemicalReportDataAndValue = {
      chemicalCode: 'F1-BTEX',
      chemicalCodeForAssessing: 'F1-BTEX',
      chemicalGroupCode: 'TRH_std',
      resultValue: 25,
      units: 'mg/kg',
      wcType: null,
    };
    let chemicalMeasurementHighValue: ChemicalReportDataAndValue = {
      chemicalCode: 'F1-BTEX',
      chemicalCodeForAssessing: 'F1-BTEX',
      chemicalGroupCode: 'TRH_std',
      resultValue: 250,
      units: 'mg/kg',
      wcType: null,
    };
    let criteria: Criterion[] = [
      {
        category: CriterionCategory.Health,
        code: 'HSL A/B',
        group: 'HEALTH SCREENING LEVELS',
        name: 'Residential / Low - High Density',
        sortOrder: 5,
        dataSource: '',
      },
    ];
    let depth: HslDepthLevel = HslDepthLevel.Depth_0_to_1;
    let soilType: SoilType = SoilType.Sand;

    let resultLowValue = soilCriteriaCalculator.validateHslCriteriaExceedanceForDepth(
      chemicalMeasurementLowValue,
      criteria,
      depth,
      soilType
    );

    expect(resultLowValue.exceededCriteria).toEqual([]);
    expect(resultLowValue.hslCriteriaLimits).toEqual([
      {
        criterionDataSource: 'NEPC (2013)',
        criterionDetail: {chemicalCode: 'F1-BTEX', criterionCode: 'HSL A/B'},
        depthLevel: 'Depth_0_to_1',
        isUnlimited: false,
        soilType: 'Sand',
        units: 'mg/kg',
        value: 45,
      },
    ]);

    let resultHighValue = soilCriteriaCalculator.validateHslCriteriaExceedanceForDepth(
      chemicalMeasurementHighValue,
      criteria,
      depth,
      soilType
    );
    expect(resultHighValue.exceededCriteria).toEqual([
      {
        criterionCode: 'HSL A/B',
        limitValue: 45,
      },
    ]);
    expect(resultHighValue.hslCriteriaLimits).toEqual([
      {
        criterionDataSource: 'NEPC (2013)',
        criterionDetail: {chemicalCode: 'F1-BTEX', criterionCode: 'HSL A/B'},
        depthLevel: 'Depth_0_to_1',
        isUnlimited: false,
        soilType: 'Sand',
        units: 'mg/kg',
        value: 45,
      },
    ]);
  });
});
