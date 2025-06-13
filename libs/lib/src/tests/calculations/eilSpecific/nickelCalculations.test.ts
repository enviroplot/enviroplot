var assert = require('assert');
import nickelCalculator from '../../../calculations/eilSpecific/nickelCalculator';

describe('Nickel', () => {
  it('Should Calculate Proper Nickel Eil Criterion Detail Value', () => {
    eilCriteriaCheckTestCase(
      10,
      ContaminationType.Fresh,
      null,
      3,
      State.NSW,
      TrafficVolume.Low,
      EilCriterionType.AES,
      20
    );
    eilCriteriaCheckTestCase(
      20,
      ContaminationType.Fresh,
      null,
      4,
      State.NSW,
      TrafficVolume.Low,
      EilCriterionType.AES,
      30
    );
    eilCriteriaCheckTestCase(
      60,
      ContaminationType.Fresh,
      10,
      5,
      State.NSW,
      TrafficVolume.Low,
      EilCriterionType.UR_or_POS,
      180
    );
    eilCriteriaCheckTestCase(
      60,
      ContaminationType.Fresh,
      null,
      5,
      State.NSW,
      TrafficVolume.Low,
      EilCriterionType.UR_or_POS,
      190
    );
    eilCriteriaCheckTestCase(
      5,
      ContaminationType.Fresh,
      null,
      1,
      State.NSW,
      TrafficVolume.Low,
      EilCriterionType.C_or_Ind,
      25
    );
    eilCriteriaCheckTestCase(
      18,
      ContaminationType.Aged,
      null,
      1,
      State.QLD,
      TrafficVolume.High,
      EilCriterionType.AES,
      45
    );
    eilCriteriaCheckTestCase(
      38,
      ContaminationType.Aged,
      null,
      1,
      State.SA,
      TrafficVolume.High,
      EilCriterionType.UR_or_POS,
      420
    );
    eilCriteriaCheckTestCase(
      41,
      ContaminationType.Aged,
      null,
      1,
      State.VIC,
      TrafficVolume.Low,
      EilCriterionType.C_or_Ind,
      740
    );
  });
});

function eilCriteriaCheckTestCase(
  cec: number,
  contaminationType: ContaminationType,
  measuredBackgroundConcentration: number,
  ironContent: number,
  state: State,
  trafficVolume: TrafficVolume,
  eilCriterionType: EilCriterionType,
  expected: number
) {
  let sampleParameters: SampleParameters = {
    cec: {
      type: ParameterValueType.Presumed,
      value: cec,
    },
    contaminationType: contaminationType,
    mbc: measuredBackgroundConcentration,
    ironContent: {
      type: ParameterValueType.Presumed,
      value: ironContent,
    },
    state: state,
    trafficVolume: trafficVolume,
    ph: null,
    soilTexture: null,
    soilType: null,
    clayContent: null,
    organicCarbon: null,
  };
  let actual = nickelCalculator.getCriterionValueByCriterionCode(eilCriterionType, sampleParameters);

  assert.equal(expected, actual, `Expected value is ${expected} but was ${actual}`);
}
