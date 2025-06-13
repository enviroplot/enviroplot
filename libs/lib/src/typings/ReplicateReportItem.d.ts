interface ReplicateReportItem {
  originalLabId: string;
  replicateLabId: string;
  originalValue: string;
  originalDataIsDetected: boolean;
  replicateValue: string;
  replicateDataIsDetected: boolean;
  diffValue;
  rpdValue;
  rpdMoreThanThirty: boolean;
  convertedUnits: string; //different for replicate, as replicates should be converted to mg/kg and µg/L
}
