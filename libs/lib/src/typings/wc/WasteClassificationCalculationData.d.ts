interface WasteClassificationCalculationData extends IHasGeneralChemicalsDta {
  chemicalGroups: ChemicalGroup[];
  chemicals: Chemical[];
  chemicalsByGroup: ChemicalGroup[];
  calculatedChemicals: Chemical[];
  calculations: Calculation[];
  wasteClassificationCriterionDetails: WasteClassificationCriterionDetail[];
}
