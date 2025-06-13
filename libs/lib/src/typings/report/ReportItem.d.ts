interface ReportExtraCell {
  value: number;
  displayOptions?: ReportCellDisplayOptions;
}

interface ReportItem extends IHasChemicalDetail, IHasUnit, IHasQaQcData {
  isCalculated: boolean; // chems from CalculatedGroups tab of seed file and calculated by ER (when absent in Lab file)
  isCalculable?: boolean; // all chems from CalculatedGroups tab of seed file
  pqlValue: number;
  pqlPrefix: string;
  groupSortOrder: number;
  sortOrder: number;
  isHiddenInReport: bool;
  chemicalCodeForAssessing: string;
  replicates: ReplicateReportItem[];
  extraFields: {
    [key: string]: ReportExtraCell;
  };
  reportCells: {
    [key: string]: ReportCellWithLimits;
  };
}
