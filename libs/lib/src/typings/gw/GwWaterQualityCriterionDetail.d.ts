interface GwWaterQualityCriterionDetail extends IHasCriterionDetailAndValue {
  criterionDetail: CriterionDetail;
  waterEnvironment: GwWaterEnvironment;
  speciesProtectionLevel: GwSpeciesProtectionLevel;
  value: number;
  units: string;
}
