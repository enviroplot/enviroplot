interface GwCalculationData extends IHasGeneralChemicalsData {
  chemicalGroups: ChemicalGroup[];
  chemicals: Chemical[];
  chemicalsByGroup: ChemicalGroup[];
  calculatedChemicals: Chemical[];
  calculations: Calculation[];
  criteriaGroups: CriteriaGroup[];
  criteria: Criterion[];
  vapourIntrusionCriterionDetails: GwVapourIntrusionCriterionDetail[];
  waterQualityCriterionDetails: GwWaterQualityCriterionDetail[];
  potentialUseCriterionDetails: GwPotentialUseCriterionDetail[];
}
