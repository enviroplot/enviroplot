var assert = require('assert');
import zincCalculator from '../../../calculations/eilSpecific/zincCalculator';

describe('Zink', () => {
  it('Should Calculate Proper Zinc Eil Criterion Detail Value', () => {
    let state = State.NSW;
    let trafficVolume = TrafficVolume.Low;
    let age = ContaminationType.Aged;
    let cec = 5;

    eilCriteriaCheckTestCase(cec, 2, age, null, 0, state, trafficVolume, EilCriterionType.AES, 80);
    eilCriteriaCheckTestCase(cec, 4, age, null, 0, state, trafficVolume, EilCriterionType.AES, 95);
    eilCriteriaCheckTestCase(cec, 6, age, null, 0, state, trafficVolume, EilCriterionType.AES, 130);
    eilCriteriaCheckTestCase(cec, 8, age, null, 0, state, trafficVolume, EilCriterionType.AES, 130);
    eilCriteriaCheckTestCase(cec, 10, age, null, 0, state, trafficVolume, EilCriterionType.AES, 130);
    eilCriteriaCheckTestCase(cec, 12, age, null, 0, state, trafficVolume, EilCriterionType.AES, 130);

    cec = 10;

    eilCriteriaCheckTestCase(cec, 2, age, null, 0, state, trafficVolume, EilCriterionType.AES, 80);
    eilCriteriaCheckTestCase(cec, 4, age, null, 0, state, trafficVolume, EilCriterionType.AES, 95);
    eilCriteriaCheckTestCase(cec, 6, age, null, 0, state, trafficVolume, EilCriterionType.AES, 170);
    eilCriteriaCheckTestCase(cec, 8, age, null, 0, state, trafficVolume, EilCriterionType.AES, 170);
    eilCriteriaCheckTestCase(cec, 10, age, null, 0, state, trafficVolume, EilCriterionType.AES, 170);
    eilCriteriaCheckTestCase(cec, 12, age, null, 0, state, trafficVolume, EilCriterionType.AES, 170);

    cec = 20;

    eilCriteriaCheckTestCase(cec, 2, age, null, 0, state, trafficVolume, EilCriterionType.AES, 80);
    eilCriteriaCheckTestCase(cec, 4, age, null, 0, state, trafficVolume, EilCriterionType.AES, 95);
    eilCriteriaCheckTestCase(cec, 6, age, null, 0, state, trafficVolume, EilCriterionType.AES, 170);
    eilCriteriaCheckTestCase(cec, 8, age, null, 0, state, trafficVolume, EilCriterionType.AES, 230);
    eilCriteriaCheckTestCase(cec, 10, age, null, 0, state, trafficVolume, EilCriterionType.AES, 230);
    eilCriteriaCheckTestCase(cec, 12, age, null, 0, state, trafficVolume, EilCriterionType.AES, 230);

    cec = 40;

    eilCriteriaCheckTestCase(cec, 2, age, null, 0, state, trafficVolume, EilCriterionType.AES, 80);
    eilCriteriaCheckTestCase(cec, 4, age, null, 0, state, trafficVolume, EilCriterionType.AES, 95);
    eilCriteriaCheckTestCase(cec, 6, age, null, 0, state, trafficVolume, EilCriterionType.AES, 170);
    eilCriteriaCheckTestCase(cec, 8, age, null, 0, state, trafficVolume, EilCriterionType.AES, 340);
    eilCriteriaCheckTestCase(cec, 10, age, null, 0, state, trafficVolume, EilCriterionType.AES, 340);
    eilCriteriaCheckTestCase(cec, 12, age, null, 0, state, trafficVolume, EilCriterionType.AES, 340);

    cec = 85;

    eilCriteriaCheckTestCase(cec, 2, age, null, 0, state, trafficVolume, EilCriterionType.AES, 80);
    eilCriteriaCheckTestCase(cec, 4, age, null, 0, state, trafficVolume, EilCriterionType.AES, 95);
    eilCriteriaCheckTestCase(cec, 6, age, null, 0, state, trafficVolume, EilCriterionType.AES, 170);
    eilCriteriaCheckTestCase(cec, 8, age, null, 0, state, trafficVolume, EilCriterionType.AES, 500);
    eilCriteriaCheckTestCase(cec, 10, age, null, 0, state, trafficVolume, EilCriterionType.AES, 550);
    eilCriteriaCheckTestCase(cec, 12, age, null, 0, state, trafficVolume, EilCriterionType.AES, 550);

    //C_IND
    cec = 5;

    eilCriteriaCheckTestCase(cec, 2, age, null, 0, state, trafficVolume, EilCriterionType.C_or_Ind, 100);
    eilCriteriaCheckTestCase(cec, 4, age, null, 0, state, trafficVolume, EilCriterionType.C_or_Ind, 190);
    eilCriteriaCheckTestCase(cec, 6, age, null, 0, state, trafficVolume, EilCriterionType.C_or_Ind, 440);
    eilCriteriaCheckTestCase(cec, 8, age, null, 0, state, trafficVolume, EilCriterionType.C_or_Ind, 440);
    eilCriteriaCheckTestCase(cec, 10, age, null, 0, state, trafficVolume, EilCriterionType.C_or_Ind, 440);
    eilCriteriaCheckTestCase(cec, 12, age, null, 0, state, trafficVolume, EilCriterionType.C_or_Ind, 440);

    cec = 10;

    eilCriteriaCheckTestCase(cec, 2, age, null, 0, state, trafficVolume, EilCriterionType.C_or_Ind, 100);
    eilCriteriaCheckTestCase(cec, 4, age, null, 0, state, trafficVolume, EilCriterionType.C_or_Ind, 210);
    eilCriteriaCheckTestCase(cec, 6, age, null, 0, state, trafficVolume, EilCriterionType.C_or_Ind, 700);
    eilCriteriaCheckTestCase(cec, 8, age, null, 0, state, trafficVolume, EilCriterionType.C_or_Ind, 700);
    eilCriteriaCheckTestCase(cec, 10, age, null, 0, state, trafficVolume, EilCriterionType.C_or_Ind, 700);
    eilCriteriaCheckTestCase(cec, 12, age, null, 0, state, trafficVolume, EilCriterionType.C_or_Ind, 700);

    cec = 20;

    eilCriteriaCheckTestCase(cec, 2, age, null, 0, state, trafficVolume, EilCriterionType.C_or_Ind, 100);
    eilCriteriaCheckTestCase(cec, 4, age, null, 0, state, trafficVolume, EilCriterionType.C_or_Ind, 210);
    eilCriteriaCheckTestCase(cec, 6, age, null, 0, state, trafficVolume, EilCriterionType.C_or_Ind, 700);
    eilCriteriaCheckTestCase(cec, 8, age, null, 0, state, trafficVolume, EilCriterionType.C_or_Ind, 1200);
    eilCriteriaCheckTestCase(cec, 10, age, null, 0, state, trafficVolume, EilCriterionType.C_or_Ind, 1200);
    eilCriteriaCheckTestCase(cec, 12, age, null, 0, state, trafficVolume, EilCriterionType.C_or_Ind, 1200);

    cec = 40;

    eilCriteriaCheckTestCase(cec, 2, age, null, 0, state, trafficVolume, EilCriterionType.C_or_Ind, 100);
    eilCriteriaCheckTestCase(cec, 4, age, null, 0, state, trafficVolume, EilCriterionType.C_or_Ind, 210);
    eilCriteriaCheckTestCase(cec, 6, age, null, 0, state, trafficVolume, EilCriterionType.C_or_Ind, 700);
    eilCriteriaCheckTestCase(cec, 8, age, null, 0, state, trafficVolume, EilCriterionType.C_or_Ind, 1900);
    eilCriteriaCheckTestCase(cec, 10, age, null, 0, state, trafficVolume, EilCriterionType.C_or_Ind, 1900);
    eilCriteriaCheckTestCase(cec, 12, age, null, 0, state, trafficVolume, EilCriterionType.C_or_Ind, 1900);

    cec = 85;

    eilCriteriaCheckTestCase(cec, 2, age, null, 0, state, trafficVolume, EilCriterionType.C_or_Ind, 100);
    eilCriteriaCheckTestCase(cec, 4, age, null, 0, state, trafficVolume, EilCriterionType.C_or_Ind, 210);
    eilCriteriaCheckTestCase(cec, 6, age, null, 0, state, trafficVolume, EilCriterionType.C_or_Ind, 700);
    eilCriteriaCheckTestCase(cec, 8, age, null, 0, state, trafficVolume, EilCriterionType.C_or_Ind, 3100);
    eilCriteriaCheckTestCase(cec, 10, age, null, 0, state, trafficVolume, EilCriterionType.C_or_Ind, 3500);
    eilCriteriaCheckTestCase(cec, 12, age, null, 0, state, trafficVolume, EilCriterionType.C_or_Ind, 3500);

    state = State.SA;
    trafficVolume = TrafficVolume.High;
    let criterionType = EilCriterionType.UR_or_POS;
    age = ContaminationType.Aged;
    let ironContent = 0;
    let mbc = null;
    let pH = 4;

    eilCriteriaCheckTestCase(10, pH, age, mbc, ironContent, state, trafficVolume, criterionType, 170);
    eilCriteriaCheckTestCase(20, pH, age, mbc, ironContent, state, trafficVolume, criterionType, 170);
    eilCriteriaCheckTestCase(40, pH, age, mbc, ironContent, state, trafficVolume, criterionType, 170);
    eilCriteriaCheckTestCase(85, pH, age, mbc, ironContent, state, trafficVolume, criterionType, 170);
  });
});

function eilCriteriaCheckTestCase(
  cec: number,
  ph: number,
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
    state: state,
    trafficVolume: trafficVolume,
    soilTexture: null,
    soilType: null,
    clayContent: null,
    organicCarbon: null,
  };

  let actual = zincCalculator.getCriterionValueByCriterionCode(eilCriterionType, sampleParameters);

  assert.equal(expected, actual, `Expected value is ${expected} but was ${actual}`);
}
