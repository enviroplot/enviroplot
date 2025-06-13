interface EslCriterionDetail extends IHasCriterionDetailAndValue {
  criterionDetail: CriterionDetail;
  soilTexture: SoilTexture;
  value: number;
  units: string;
  criterionDataSource: string;
}
