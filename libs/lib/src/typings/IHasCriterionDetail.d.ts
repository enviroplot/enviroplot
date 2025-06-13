interface IHasCriterionDetailAndValue {
  criterionDetail: CriterionDetail;
  state?: string;
  value: number;
  units?: string;
  prefixType?: ValuePrefixType;
  criterionDataSource?: string;
}
