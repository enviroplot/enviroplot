interface HslCriterionDetail extends IHasCriterionDetailAndValue {
  criterionDetail: CriterionDetail;
  soilType: SoilType;
  depthLevel: HslDepthLevel;
  value: number;
  units: string;
  isUnlimited: boolean;
  criterionDataSource: string;
}
