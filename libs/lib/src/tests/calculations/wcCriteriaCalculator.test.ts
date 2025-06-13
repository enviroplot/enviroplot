import * as _ from 'lodash';
import wcCriteriaCalculator from '../../calculations/wcCriteriaCalculator';
import utils from '../../utils';

const fs = utils.loadModule('fs-extra');

describe('wc criteria calculations', () => {
  let seedData: WasteClassificationCalculationData = undefined;

  beforeEach(async () => {
    const seedDataPath = './data/seed/seed.json';

    let allSeedData: SeedData = await fs.readJson(seedDataPath);
    seedData = allSeedData.wasteData;
  });
  test('test getWcResultCriteriaInfo method ', () => {
    const chemicalMeasurementStub: ChemicalReportDataAndValue = {
      chemicalCode: '50-32-8',
      chemicalCodeForAssessing: '50-32-8',
      chemicalGroupCode: 'PAH',
      resultValue: 24,
      units: 'mg/kg',
      wcType: null,
    };

    const sampleParametersStub: SampleParameters = {
      cec: null,
      clayContent: null,
      contaminationType: null,
      ironContent: null,
      mbc: null,
      organicCarbon: null,
      ph: null,
      soilTexture: null,
      soilType: null,
      state: State.NSW,
      trafficVolume: null,
    };
    let result: ResultCriteriaInfo = {
      exceededCriteria: {
        // eslint-disable-next-line
        [AssessmentType.Waste]: [],
      },
      criteriaLimits: {},
    };
    result = wcCriteriaCalculator.getWcResultCriteriaInfo(chemicalMeasurementStub, sampleParametersStub, seedData);

    expect(result.criteriaLimits.Waste).toHaveLength(6);
    expect(result.exceededCriteria.Waste[0].limitValue).toBe(3.2);
    expect(result.exceededCriteria.Waste).toHaveLength(2);
  });
});
