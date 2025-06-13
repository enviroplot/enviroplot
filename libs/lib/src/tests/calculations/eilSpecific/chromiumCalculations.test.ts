var assert = require('assert');

import chromiumCalculator from '../../../calculations/eilSpecific/chromiumCalculator';

describe('Chromium', () => {
  it('Should Calculate Proper Chromium Eil Criterion Detail Value', () => {
    eilCriteriaCheckTestCase(
      15,
      ContaminationType.Aged,
      null,
      0,
      State.VIC,
      TrafficVolume.High,
      EilCriterionType.UR_or_POS,
      460
    );
    eilCriteriaCheckTestCase(
      45,
      ContaminationType.Aged,
      null,
      0,
      State.VIC,
      TrafficVolume.High,
      EilCriterionType.UR_or_POS,
      660
    );
    eilCriteriaCheckTestCase(
      60,
      ContaminationType.Aged,
      null,
      0,
      State.VIC,
      TrafficVolume.Low,
      EilCriterionType.UR_or_POS,
      730
    );
    eilCriteriaCheckTestCase(
      70,
      ContaminationType.Aged,
      null,
      0,
      State.VIC,
      TrafficVolume.Low,
      EilCriterionType.AES,
      250
    );
    eilCriteriaCheckTestCase(
      2,
      ContaminationType.Aged,
      10,
      3.5,
      State.NSW,
      TrafficVolume.Low,
      EilCriterionType.AES,
      85
    );
    eilCriteriaCheckTestCase(
      2,
      ContaminationType.Aged,
      null,
      3.5,
      State.NSW,
      TrafficVolume.Low,
      EilCriterionType.AES,
      85
    );
    eilCriteriaCheckTestCase(
      3,
      ContaminationType.Fresh,
      null,
      6.2,
      State.NSW,
      TrafficVolume.Low,
      EilCriterionType.UR_or_POS,
      180
    );
    eilCriteriaCheckTestCase(
      3,
      ContaminationType.Fresh,
      null,
      6.2,
      State.NSW,
      TrafficVolume.Low,
      EilCriterionType.C_or_Ind,
      250
    );
    eilCriteriaCheckTestCase(
      8,
      ContaminationType.Aged,
      null,
      2,
      State.NSW,
      TrafficVolume.High,
      EilCriterionType.AES,
      130
    );
    eilCriteriaCheckTestCase(
      8,
      ContaminationType.Aged,
      null,
      2,
      State.QLD,
      TrafficVolume.High,
      EilCriterionType.AES,
      130
    );
    eilCriteriaCheckTestCase(
      1.6,
      ContaminationType.Aged,
      null,
      5,
      State.SA,
      TrafficVolume.Low,
      EilCriterionType.UR_or_POS,
      230
    );
    eilCriteriaCheckTestCase(
      25,
      ContaminationType.Aged,
      null,
      0,
      State.SA,
      TrafficVolume.Low,
      EilCriterionType.UR_or_POS,
      550
    );
    eilCriteriaCheckTestCase(
      50,
      ContaminationType.Aged,
      null,
      0,
      State.SA,
      TrafficVolume.Low,
      EilCriterionType.UR_or_POS,
      690
    );
    eilCriteriaCheckTestCase(
      65,
      ContaminationType.Aged,
      null,
      0,
      State.SA,
      TrafficVolume.Low,
      EilCriterionType.UR_or_POS,
      760
    );
    eilCriteriaCheckTestCase(
      65,
      ContaminationType.Aged,
      null,
      0,
      State.SA,
      TrafficVolume.Low,
      EilCriterionType.UR_or_POS,
      760
    );
    eilCriteriaCheckTestCase(
      85,
      ContaminationType.Aged,
      null,
      0,
      State.SA,
      TrafficVolume.Low,
      EilCriterionType.UR_or_POS,
      820
    );
    eilCriteriaCheckTestCase(
      95,
      ContaminationType.Aged,
      null,
      0,
      State.SA,
      TrafficVolume.Low,
      EilCriterionType.UR_or_POS,
      850
    );
  });
});

function eilCriteriaCheckTestCase(
  clayContent: number,
  contaminationType: ContaminationType,
  measuredBackgroundConcentration: number,
  ironContent: number,
  state: State,
  trafficVolume: TrafficVolume,
  criterionCode: EilCriterionType,
  expected: number
) {
  let sampleParameters: SampleParameters = {
    clayContent: {
      type: ParameterValueType.Presumed,
      value: clayContent,
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
    cec: null,
    organicCarbon: null,
  };

  let actual = chromiumCalculator.getCriterionValueByCriterionCode(criterionCode, sampleParameters);

  assert.equal(expected, actual, `Expected value is ${expected} but was ${actual}`);
}
