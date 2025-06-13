interface ChemicalGroup {
  code: string;
  name: string;
  description: string;
  sortOrder: number;
  isStandardContaminantSuite: boolean;
  chemicals: Chemical[];
  dissolved?: boolean;
}
