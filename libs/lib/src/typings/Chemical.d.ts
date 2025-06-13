//remove sort order for chemical / group
interface Chemical {
  code: string;
  name: string;
  sortOrder: number;
  chemicalGroup: string;
  calculated: boolean;
  calculationFormulaType: CalculationFormulaType;
  codeForAssessing?: string;
  isBioaccumulative?: boolean;
  altCodes?: string[];
}
