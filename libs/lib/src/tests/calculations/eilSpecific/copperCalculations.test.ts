var assert = require('assert');
import copperCalculator from '../../../calculations/eilSpecific/copperCalculator';

describe('Copper', () => {
  it('Should Calculate Proper Copper Eil Criterion Detail Value', () => {
    let state = State.NSW;
    let trafficVolume = TrafficVolume.Low;
    let age = ContaminationType.Aged;
    let organicCarbon = 1;
    let mbc = null;

    var cec = 5;
    organicCarbon = 0.1;
    age = ContaminationType.Aged;
    mbc = null;
    trafficVolume = TrafficVolume.Low;
    let pH = 7.5;

    eilCriteriaCheckTestCase(cec, pH, organicCarbon, age, mbc, 0, state, trafficVolume, EilCriterionType.AES, 35);
    eilCriteriaCheckTestCase(cec, pH, organicCarbon, age, mbc, 0, state, trafficVolume, EilCriterionType.UR_or_POS, 70);
    eilCriteriaCheckTestCase(cec, pH, organicCarbon, age, mbc, 0, state, trafficVolume, EilCriterionType.C_or_Ind, 90);

    state = State.SA;
    organicCarbon = 1;
    age = ContaminationType.Aged;
    mbc = null;
    state = State.SA;
    trafficVolume = TrafficVolume.High;
    pH = 2;

    eilCriteriaCheckTestCase(10, pH, organicCarbon, age, mbc, 0, state, trafficVolume, EilCriterionType.C_or_Ind, 35);
    eilCriteriaCheckTestCase(20, pH, organicCarbon, age, mbc, 0, state, trafficVolume, EilCriterionType.C_or_Ind, 35);
    eilCriteriaCheckTestCase(30, pH, organicCarbon, age, mbc, 0, state, trafficVolume, EilCriterionType.C_or_Ind, 35);
    eilCriteriaCheckTestCase(40, pH, organicCarbon, age, mbc, 0, state, trafficVolume, EilCriterionType.C_or_Ind, 35);
    eilCriteriaCheckTestCase(50, pH, organicCarbon, age, mbc, 0, state, trafficVolume, EilCriterionType.C_or_Ind, 35);
    eilCriteriaCheckTestCase(60, pH, organicCarbon, age, mbc, 0, state, trafficVolume, EilCriterionType.C_or_Ind, 35);
  });
});

function eilCriteriaCheckTestCase(
  cec: number,
  ph: number,
  organicCarbon: number,
  contaminationType: ContaminationType,
  measuredBackgroundConcentration: number,
  ironContent: number,
  state: State,
  trafficVolume: TrafficVolume,
  criterionCode: EilCriterionType,
  expected: number
) {
  let sampleParameters: SampleParameters = {
    cec: {
      type: ParameterValueType.Presumed,
      value: cec,
    },
    ph: {
      type: ParameterValueType.Presumed,
      value: ph,
    },
    contaminationType: contaminationType,
    mbc: measuredBackgroundConcentration,
    ironContent: {
      type: ParameterValueType.Presumed,
      value: ironContent,
    },
    organicCarbon: {
      type: ParameterValueType.Presumed,
      value: organicCarbon,
    },
    trafficVolume: trafficVolume,
    state: state,
    soilTexture: null,
    soilType: null,
    clayContent: null,
  };

  let actual = copperCalculator.getCriterionValueByCriterionCode(criterionCode, sampleParameters);

  assert.equal(expected, actual, `Expected value is ${expected} but was ${actual}`);
}
