interface ReportData {
  samples: Sample[];
  allReportItems: ReportItem[];
  generalReportItems: ReportItem[];
  rpdReportItems: RpdReportItem[];
  rinsateReportItems: RinsateReportItem[];
  sampleParameters: SampleParameterItem[];
  seedData: SoilAssessmentCalculationData | GwCalculationData | WasteClassificationCalculationData;
}
