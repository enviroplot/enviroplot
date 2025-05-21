export const notes = 'Notes:';
export const SacNotesTitle = 'Site Assessment Criteria (SAC):';
export const SacNotesDescription =
  'Refer to the SAC section of report for information of SAC sources and rationale.  Summary information as follows:';

export const sacNotesTitle = {
  HilA_HslAB_notes: 'SAC based on generic land use thresholds for Residential A with garden/accessible soil',
  HilA_HslD_notes:
    'SAC based on generic land use thresholds for Residential A with garden/accessible soil with commercial and/or communal parking below residential use (including as basement)',
  HilB_HslAB_notes:
    'SAC based on generic land use thresholds for Residential B with minimal opportunities for soil access',
  HilB_HslD_notes:
    'SAC based on generic land use thresholds for Residential B with minimal opportunities for soil access with commercial and/or communal parking below residential use (including as basement)',
  HilC_HslC_notes: 'SAC based on generic land use thresholds for Recreational C including public open space',
  HilC_HslD_notes:
    'SAC based on generic land use thresholds for Recreational C including public open space with amenities buildings',
  HilD_HslD_notes: 'SAC based on generic land use thresholds for Commercial/ industrial D',
  any_combination_without_HilHsl: 'SAC based on generic land use thresholds for: ',
  any_combination_general:
    'SAC based on generic land use thresholds for cell to be highlighted yellow to flag input required from user',
  user_input_required: '[user input required]',
};

// according to 'SAC Notes.xlsx'
export const sacNotesDescriptions = {
  HIL: {
    getText: (criterion: Criterion, isPfasGroupSelected: boolean = false) => {
      return `${criterion.code.replace(' ', ValueAbbreviations.Dash)} ${
        isPfasGroupSelected ? '(NEPC, 2013 or HEPA, 2020 (PFAS only))' : '(NEPC, 2013)'
      }`;
    },
  },
  HSL: {
    getText: (criterion: Criterion) => {
      return `${criterion.code.replace(' ', ValueAbbreviations.Dash)} ${'(NEPC, 2013)'}`;
    },
  },
  DC: {
    getText: (criterion: Criterion) => {
      return `${criterion.name} ${'(CRC CARE, 2011)'}`;
    },
  },
  ML: {
    getText: (criterion: Criterion) => {
      switch (criterion.code) {
        case CriterionCode.ML_R_P_POS:
          return 'Residential, Parkland and Public Open Space (NEPC, 2013)';
        case CriterionCode.ML_C_IND:
          return 'Commercial and Industrial (NEPC, 2013)';
        default:
          return '';
      }
    },
  },
  EIL: {
    getText: (criterion: Criterion, isPfasGroupSelected: boolean = false) => {
      if (isPfasGroupSelected) return 'EGV, all land uses, direct exposure (HEPA, 2020)';

      switch (criterion.code) {
        case CriterionCode.EIL_AES:
          return 'Areas of Ecological Significance (NEPC, 2013)';
        case CriterionCode.EIL_UR_POS:
          return 'Urban Residential and Public Open Space (NEPC, 2013)';
        case CriterionCode.EIL_C_IND:
          return 'Commercial and Industrial (NEPC, 2013)';
        default:
          return '';
      }
    },
  },
  ESL: {
    getText: (criterion: Criterion) => {
      switch (criterion.code) {
        case CriterionCode.ESL_AES:
          return 'Areas of Ecological Significance (NEPC, 2013)';
        case CriterionCode.ESL_UR_POS:
          return 'Urban Residential and Public Open Space (NEPC, 2013)';
        case CriterionCode.ESL_C_IND:
          return 'Commercial and Industrial (NEPC, 2013)';
        default:
          return '';
      }
    },
  },
  EGV_INDIR: {
    getText: (criterion: Criterion) => {
      switch (criterion.code) {
        case CriterionCode.EGV_INDIR_ALL:
          return 'EGV, all land uses, Indirect exposure (HEPA, 2020)';
        case CriterionCode.EGV_INDIR_IDS_MAX:
          return 'EGV, all land uses, Indirect exposure, Intensively developed sites (HEPA, 2020)';
        default:
          return '';
      }
    },
  },
};
