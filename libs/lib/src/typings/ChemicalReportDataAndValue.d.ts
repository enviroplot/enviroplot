interface ChemicalReportDataAndValue {
  chemicalCode: string;
  chemicalGroupCode: string;
  resultValue: number;
  chemicalCodeForAssessing: string;
  units: string;
  wcType?: AslpTclpType;
}
