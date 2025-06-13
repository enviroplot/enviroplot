interface SessionChemicalGroups {
  [AssessmentType.Soil]: string[];
  [AssessmentType.Waste]: string[];
  [AssessmentType.Water]: string[];
  [AssessmentType.Undefined]: string[];
}

interface SessionParameters {
  applyBiodegradation: boolean;
  highlightAllDetections: boolean;
  chemicalGroups: SessionChemicalGroups;
  displayOptions: ReportDisplayOptions;
  combinedChemicalsDisplay: {
    [key: string]: string;
  };
  selectedCriteria?: {
    [key: string]: [];
  };
  edits: {
    [key: string]: EditsItem;
  };
  projectDetails: ProjectDetails;
  criteria: string[];
  waterAssessmentParameters: {
    waterEnvironment: GwWaterEnvironment;
    levelOfProtection: LevelOfProtection;
    potentialUse: GwPotentialUse;
    soilType: SoilType;
    waterDepth: GwHslDepthLevel;
    vapourIntrusionHsl: GwHslType;
  };
  reportOutputFormat: ReportOutputFormat;
  shouldOutputAslp?: boolean;
  shouldOutputTclp?: boolean;
}
