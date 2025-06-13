interface RpdReportItem extends IHasChemicalDetail, IHasUNnit {
  isHiddenInReport: boolean;
  replicates: ReplicateReportItem[];
  units: string;
}
