interface SampleParameters {
  soilType: SoilType;
  soilTexture: SoilTexture;
  ph: SampleValueParameter;
  cec: SampleValueParameter;
  clayContent: SampleValueParameter;
  mbc: number;
  contaminationType: ContaminationType;
  state: State;
  trafficVolume: TrafficVolume;
  ironContent: SampleValueParameter;
  organicCarbon: SampleValueParameter;
}

interface SampleValueParameter {
  value: number;
  type: ParameterValueType;
}
