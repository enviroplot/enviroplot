interface Sample {
  labSampleId: string;
  labReportNo: string;
  dateSampled: string;
  dpSampleId: string;
  depth: Depth;
  matrixType: string;
  sampleType: string;
  labName: string;
  measurements: ChemicalMeasurement[];
  isTripBlank: boolean;
  isTripSpike: boolean;
  primarySampleId?: string;
  isTripBlank?: boolean;
  isTripSpike?: boolean;
  isRinsate?: boolean;
  soilType?: string;
  hasStandardContaminationChemicals?: boolean;
}
