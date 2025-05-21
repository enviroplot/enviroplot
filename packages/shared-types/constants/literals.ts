export const check = {
  wrongFormatChemical: (value: string, chemical: string) =>
    `Unrecognizable value format (${value}) for Contaminant "${chemical}". Do you wish to proceed and skip unrecognized values?`,
  wrongFormatChemicalsEsdat: (chemical: string) =>
    `Unrecognizable value format for Contaminant(s) "${chemical}". Do you wish to proceed and skip unrecognized values?`,
  incorrectDepthsError: (nrOfSamples: number) =>
    `Incorrect depth ranges in ${nrOfSamples} samples, modify depths in file and try to import again. \n
    Common issues to check:
      -‘Depth From’ must be less than ‘Depth To’
      - Depth field should contain numbers, dashes or be blank.`,
  incorrectDataFile: () => `Incorrect data file. Please choose another file`,
};

export const sampleId = 'Sample ID';
export const sampleDate = 'Sample Date';
export const sampleDepth = 'Sample Depth';
export const sampleType = 'Sample Type';
export const sampleMedia = 'Media Being Sampled';
export const labReportNo = 'Lab Report No';
export const soilType = 'Soil Type';
export const soilTexture = 'Soil Texture';
export const clayContent = 'Clay Content';
export const pH = 'pH';
export const cec = 'CEC';
export const pql = 'PQL';
export const units = 'Units';
export const depth = 'Depth';
export const na = 'NA';
export const dash = '-';
export const noLimit = 'NL';
export const labResult = 'Lab result';
export const hilHslValueTitle = 'HIL/HSL value';
export const eilEslValueTitle = 'EIL/ESL/EGV value';

export const water = 'Water';
export const soil = 'Soil';

export const noValue = '-';
export const notTested = 'NT';

export const derivationTable = 'Derivation table';
export const derivationTableTitle = 'Table A1: Derivation Table';

export const tbTitleSoil = 'Table QA2: Trip Blank Results - Soil Sampling';
export const tbTitleWater = 'Table QA2: Trip Blank Results - Water Sampling';

export const tsTitleSoil = 'Table QA3: Trip Spike Results – Soil Sampling (% Recovery)';
export const tsTitleWater = 'Table QA3: Trip Spike Results – Water Sampling (% Recovery)';

export const rinsateTitleSoil = `Table QA4: Rinsate Results – Soil Sampling`;
export const rinsateTitleWater = `Table QA4: Rinsate Results – Water Sampling`;

export const relativePercentageTableTitleSoilWaste =
  'Table QA1: Relative Percentage Difference Results – Soil Sampling';
export const relativePercentageTableTitleWater = 'Table QA1: Relative Percentage Difference Results – Water Sampling';

export const tb = 'TB';
export const ts = 'TS';
export const rinsate = 'Rinsate';

export const summaryStatistics = 'Summary Statistics';
export const min = 'min';
export const max = 'max';
export const mean = 'mean';
export const standardDeviation = 'Standard Deviation';
export const ucl95 = '95% UCL';
export const wasteClassificationCriteria = 'Waste Classification Criteria';

export const percentage = '%';

export const difference = 'Difference';
export const rpd = 'RPD';

export const legendNoValueAndAsbestosWaste =
  '- = Not tested, no criteria or not applicable     NAD = no asbestos detected';

export const leachableAslp = 'Leachable data without TCLP or ASLP identified in lab file assigned to ASLP';
export const leachableTclp = 'Leachable data without TCLP or ASLP identified in lab file assigned to TCLP';
export const chemicalInTclpAslp = `{0} in {1}`;
