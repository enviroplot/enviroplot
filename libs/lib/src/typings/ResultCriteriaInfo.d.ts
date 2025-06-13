interface ResultCriteriaInfo {
  exceededCriteria: {
    [key: string]: ExceededCriterion[];
  };
  criteriaLimits: {
    [categoryKey: string]: IHasCriterionDetailAndValue[];
  };
}
