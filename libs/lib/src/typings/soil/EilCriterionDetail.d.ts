interface EilCriterionDetail extends IHasCriterionDetailAndValue {
  criterionDetail: CriterionDetail;
  ph?: number;
  cec?: number;
  clayContent?: number;
  contaminationType?: ContaminationType;
  value: number;
  units: string;
  criterionDataSource: string;
}
