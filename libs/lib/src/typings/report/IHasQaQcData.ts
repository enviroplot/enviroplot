interface IHasQaQcData {
  isHiddenInReport: boolean;
  group: string;
  reportCells: {
    [key: string]: ReportCellWithLimits;
  };
}
