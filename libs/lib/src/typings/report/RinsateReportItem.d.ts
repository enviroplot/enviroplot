interface RinsateReportItem extends IHasChemicalDetail, IHasUnit, IHasQaQcData {
  isHiddenInReport: boolean;
  units: string;
  reportCells: {
    [key: string]: ReportCell;
  };
}
