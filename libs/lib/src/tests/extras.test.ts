import extras from '../calculations/eilSpecific/extras';

describe('roundCalculationValue function', () => {
  test('value < 1 should round to one decimal point', () => {
    expect(extras.roundCalculationValue(0.1)).toBe(0.1);
  });
  test('value >= 1 and value < 10 should return the value itself', () => {
    expect(extras.roundCalculationValue(2)).toBe(2);
  });
  test('value >= 10 and value < 100 should return the value multiple of 5', () => {
    expect(extras.roundCalculationValue(10)).toBe(10);
    expect(extras.roundCalculationValue(11)).toBe(10);
    expect(extras.roundCalculationValue(12)).toBe(10);
    expect(extras.roundCalculationValue(13)).toBe(15);
  });
  test('value >= 100 and value < 1000 should return the value multiple of 10', () => {
    expect(extras.roundCalculationValue(100)).toBe(100);
    expect(extras.roundCalculationValue(101)).toBe(100);
    expect(extras.roundCalculationValue(104)).toBe(100);
    expect(extras.roundCalculationValue(105)).toBe(110);
  });
  test('value >= 1000 and value < 10000 should return the value multiple of 100', () => {
    expect(extras.roundCalculationValue(1000)).toBe(1000);
    expect(extras.roundCalculationValue(1001)).toBe(1000);
    expect(extras.roundCalculationValue(1040)).toBe(1000);
    expect(extras.roundCalculationValue(1050)).toBe(1100);
  });
  test('value >= 10000 should return the value multiple of 1000', () => {
    expect(extras.roundCalculationValue(10000)).toBe(10000);
    expect(extras.roundCalculationValue(10001)).toBe(10000);
    expect(extras.roundCalculationValue(10040)).toBe(10000);
    expect(extras.roundCalculationValue(10500)).toBe(11000);
  });
});

describe('check iron content in samples', () => {
  let sampleParameters: SampleParameters = {
    soilType: SoilType.Clay,
    soilTexture: SoilTexture.Coarse,
    ph: {value: 2, type: ParameterValueType.Assumed},
    cec: {value: 2, type: ParameterValueType.Assumed},
    clayContent: {value: 2, type: ParameterValueType.Assumed},
    mbc: 1,
    contaminationType: ContaminationType.Fresh,
    state: State.NSW,
    trafficVolume: TrafficVolume.High,
    ironContent: {value: 0, type: ParameterValueType.Assumed},
    organicCarbon: {value: 1, type: ParameterValueType.Presumed},
  };
  test('should check that Iron Content is not 0, when Fresh and with mbc', () => {
    expect(extras.checkIronContentIsSpecified(sampleParameters)).toBeFalsy();
  });

  test('should check that Iron Content can be 0', () => {
    sampleParameters.contaminationType = ContaminationType.Aged;
    expect(extras.checkIronContentIsSpecified(sampleParameters)).toBeTruthy();
  });
});
