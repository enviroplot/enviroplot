interface ReportCellWithLimits extends ReportCell {
  exceededCriteria?: {
    [key: string]: ExceededCriterion[];
  };
  criteriaLimits?: {
    [categoryKey: string]: IHasCriterionDetailAndValue[];
  };
}
