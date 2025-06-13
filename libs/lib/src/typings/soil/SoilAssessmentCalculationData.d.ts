interface SoilAssessmentCalculationData extends IHasGeneralChemicalsData {
  chemicalGroups: ChemicalGroup[];
  chemicals: Chemical[];
  chemicalsByGroup: ChemicalGroup[];
  calculatedChemicals: Chemical[];
  calculations: Calculation[];
  criteriaGroups: CriteriaGroup[];
  criteria: Criterion[];
  hilCriterionDetails: HilDcCriterionDetail[];
  hslCriterionDetails: HslCriterionDetail[];
  dcCriterionDetails: HilDcCriterionDetail[];
  eilCriterionDetails: EilCriterionDetail[];
  eslCriterionDetails: EslCriterionDetail[];
  mlCriterionDetails: MlCriterionDetail[];
  egvCriterionDetails: EgvCriterionDetail[];
}
