export const reportDateFormat = 'dd/MM/yy';

export const sampleFieldIdExceptions = ['Trip spike', 'Trip blank', 'Surrogate'];

export const emptyCodes = ['N/A'];

export const asbestosCodesSoil = [
  'TA_Nepm',
  'TA_AS',
  'Tot_Asb',
  'Asb_ID_less',
  'Asb_ID_greater_AS',
  'Asb_ID_greater_Nepm',
  'TotalAsbestos_As',
  'TotalAsbestos_Nepm',
  'TotalAsbestos_WC',
  '132207-33-1',
  'TotalAsbestos',
];

export const asbestosCodesWaste = [
  'Asb_ID_greater_AS',
  'TA_AS',
  'Asb_Comm',
  'Asb_ID_greater_Nepm',
  'Asb_ID_less',
  'TA_Nepm',
  'ACM_7mm',
  'FA_AF_g',
  'FA_AF_ww',
  'Tot_Asb',
  '132207-33-1',
  'TotalAsbestos_WC',
];

export const asbestosCommentDependentChemical = 'Asb_ID_greater_AS';

export const asbestosCommentDependentCalculatedChemical = 'TotalAsbestos_As';

export const emptyValue = ['', '-', '', '--', '–', '–', 'NT'];

export const asbestosNotDetected = ['NAD', '<0.1', '<0.01', '<0.001', '<0.001 % (w/w)'];

export const naphtaleneCode = '91-20-3';

export const unlimitedDecimalCriterion = 99999999;

export const VALUE_DECIMALS_COUNT = 8;

// TODO: 'μ../..' values are duplicated due to invisible differences between visually same values (to be discovered)
// Note: 'μ's from Lab files come first in the arrays, others from BRD (possibly not used) are in the end of arrays
export const UNITS = {
  MG_KG: ['mg/kg', 'MG/KG', 'ΜG/KG'],
  NG_KG: ['ng/kg', 'NG/KG'],
  UG_KG: ['μg/kg', 'μG/KG', 'ug/kg', 'UG/KG', 'µg/kg', 'µG/KG', 'ï¿½g/kg', '�g/kg', 'ï¿½g/KG', '�g/KG', '�G/KG'],
  MG_L: ['mg/L', 'MG/L', 'mg/l', 'ΜG/L'],
  NG_L: ['ng/L', 'NG/L', 'ng/l'],
  UG_L: [
    'μg/L',
    'μG/L',
    'μg/l',
    'ug/l',
    'UG/L',
    'µg/L',
    'µG/L',
    'µg/l',
    'ï¿½g/L',
    '�g/L',
    'ï¿½g/l',
    '�g/l',
    'µg/l',
    'µg/L',
    '�G/L',
  ],
  CMOL_KG: ['cmol/kg', 'CMOL/KG', 'cmolc/kg'],
  MEQ_100G: ['meq/100g', 'MEQ/100G'],
  PERCENT: ['%', 'percent'],
  PPM: ['ppm', 'PPM'],
  PPB: ['ppb', 'PPB'],
  PH_UNITS: ['pH Units', 'ph units'],
};

export const UNITS_ORDER_WATER = [...UNITS.UG_L];

export const UNITS_ORDER_SOIL_WASTE = [...UNITS.MG_L];

export const PFASGroupCode = 'PFAS';

export const DDTDDEDDDChemicalCode = 'DDT+DDE+DDD';

export const GwWqCriteriaCodes = [
  GwCriterionCode.WQFresh,
  GwCriterionCode.WQMarine,
  GwCriterionCode.WQFreshPFAS,
  GwCriterionCode.WQMarinePFAS,
];

export const GwWaterEnvironmentFresh = [GwCriterionCode.WQFreshPFAS, GwCriterionCode.WQFresh];

export const WaterEnvironmentReplacementString = '[waterEnvironment]';
export const LopOthersReplacementString = '[lopOthers]';
export const LopPfasReplacementString = '[lopPfas]';
export const LopBioAccumulativeReplacementString = '[lopBioAccumulative]';
export const SoilTypeReplacementString = '[soilType]';
export const DepthTypeReplacementString = '[depth]';

export const unlimitedAbbreviation = 'NL';

//For generating report
export const fontName = 'Montserrat';
export const fontLegendSquareName = 'Arial';
export const fontSize = {content: 7, doubleRowContent: 7, header: 7, big: 16};
export const rowHeight = {
  header: 24,
  content: 14,
  chemicalsHeader: 70,
  chemicalsGroups: 30,
  soilNumberValueRow: 13.5,
  soilChemicalValueRow: 11,
  titleHeaderRow: 21.5,
  emptyHeaderRow: 9.5,
};
export const columnWidth = {
  sampleId: 20,
  common: 9,
  qaQcSampleId: 30,
  dtColumnWidth: 20,
  criteriaColumnWidth: 12,
  soilSampleColumnWidth: 11,
};
export const pageWidth = 184;

const qaQcNote = 'QA/QC replicate of sample listed directly below the primary sample';

export const waterNotesStart: KeyLabelItem[] = [
  {key: '-', label: 'No criterion / not defined / not tested / not applicable'},
  {key: '*', label: qaQcNote},
  {key: 'NL', label: 'Not limiting'},
  {key: 'PQL', label: 'Practical quantitation limit'},
  {key: '', label: 'Shaded cell is exceedance of guideline value'},
  {
    key: '',
    label:
      'Where one or more guideline value is exceeded, the cell is shaded to the colour of the highest guideline value exceeded',
  },
];

export const waterNotesEnd: KeyLabelItem[] = [
  {key: '', label: 'Underlining of ANZG (2018) criteria indicates a criteria with an ‘unknown’ level of protection. '},
  {
    key: '',
    label:
      'ANZG (2018) DGV adopted for most conservative species of following analytes: DGV for xylene (m) adopted for xylene (m+p); DGV for CrVI adopted for total chromium; DGV for AsV adopted for total arsenic',
  },
  {
    key: '',
    label:
      'ANZG (2018) DGV adopted for aluminium in freshwater is for receiving waters with pH >6.5.  For receiving waters with pH <6.5 suitability of the more conservative, low reliability DGV of unknown LOP should be considered',
  },
  {key: '', label: 'ANZG (2018) Ammonia DGV is pH and temperature dependant.  DGV for a pH of 8 provided in table.'},
];

export const unknownLopWaterNote =
  "ANZG (2018) Australian and New Zealand Guidelines for Fresh and Marine Water Quality, orange text is 'unknown' level of protection";

export const wasteNotes: KeyLabelItem[] = [
  {key: 'a', label: qaQcNote},
  {key: 'b', label: 'Total chromium used as initial screen for chromium(VI).'},
  {
    key: 'c',
    label: 'Total recoverable hydrocarbons (TRH) used as an initial screen for total petroleum hydrocarbons (TPH)',
  },
  {key: 'd', label: 'Criteria for scheduled chemicals used as an initial screen'},
  {key: 'e', label: 'Criteria for Chlorpyrifos used as initial screen'},
  {key: 'f', label: 'NSW EPA, 2014, Waste Classification Guidelines Part 1; Classifying Waste'},
  {key: 'PQL', label: 'Practical quantitation limit'},
  {
    key: 'CT1',
    label:
      'Maximum values of specific contaminant concentration (SCC) for classification without TCLP: General solid waste',
  },
  {
    key: 'SCC1',
    label:
      'Maximum values for leachable concentration (TCLP) and specific contaminant concentration (SCC) when used together: General solid waste',
  },
  {
    key: 'TCLP1',
    label:
      'Maximum values for leachable concentration (TCLP) and specific contaminant concentration (SCC) when used together: General solid waste',
  },
  {
    key: 'CT2',
    label:
      'Maximum values of specific contaminant concentration (SCC) for classification without TCLP: Restricted solid waste',
  },
  {
    key: 'SCC2',
    label:
      'Maximum values for leachable concentration (TCLP) and specific contaminant concentration (SCC) when used together: Restricted solid waste',
  },
  {
    key: 'TCLP2',
    label:
      'Maximum values for leachable concentration (TCLP) and specific contaminant concentration (SCC) when used together: Restricted solid waste',
  },
  {
    key: '95% UCL',
    label:
      "95% upper confidence limit of the mean concentration calculated using ProUCL v5.1 and the 95% Student's-t UCL method",
  },
];

export const soilNotes: KeyLabelItem[] = [
  {key: 'a', label: qaQcNote},
  {
    key: 'b',
    label:
      'Naphthalene reported as highest detection from the BTEXN or PAH suite, or if both results <PQL as lowest PQL',
  },
  {key: 'c', label: 'EIL criteria applies to DDT only'},
  {key: 'd', label: 'HIL for pentachlorophenol used as a screening HIL for total phenols'},
];

export const specialValuesSoil: KeyLabelItem[] = [
  {key: '-', label: 'Not tested or No HIL/HSL/EIL/ESL (as applicable) or Not applicable'},
  {key: 'NL', label: 'Not limiting'},
  {key: 'NAD', label: 'No Asbestos detected'},
];

export const criteriaValuesSoil: KeyLabelItem[] = [
  {key: 'HIL', label: 'Health investigation level'},
  {key: 'HSL', label: 'Health screening level (excluding DC)'},
  {key: 'EIL', label: 'Ecological investigation level'},
  {key: 'ESL', label: 'Ecological screening level'},
  {key: 'EGV', label: 'Environmental Guideline Value '},
  {key: 'ML', label: 'Management Limit'},
  {key: 'DC', label: 'Direct Contact HSL'},
];

export const wcCriteriaTitles: KeyLabelItem[] = [
  {key: 'CT1', label: 'CT1'},
  {key: 'SCC1', label: 'SCC1'},
  {key: 'TCLP1', label: 'TCLP1'},
  {key: 'CT2', label: 'CT2'},
  {key: 'SCC2', label: 'SCC2'},
  {key: 'TCLP2', label: 'TCLP2'},
];

export const wcTCLPCriteriaCodes: string[] = ['TCLP1', 'TCLP2'];

export const chemicalCodeForRounding: string[] = ['TotalOCP', '1336-36-3'];

export const excelTitles = {
  Reference: 'Reference',
  Details: 'Details',
  SampleCode: 'Sample Code',
  SampleDescription: 'Sample Description',
  SampleNo: 'Sample No.',
  Replicate: 'Replicate',
  Depth: 'Depth',
};

export const excelDPHeaderRowsCount = 5;

export const logoPath = './report/logo.emf';

export const dissolvedExclusionsCodes: string[] = ['DO', 'DO_field', 'DO_lab', 'TDS'];
