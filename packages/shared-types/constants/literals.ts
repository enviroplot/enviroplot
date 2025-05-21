export const check = {
  wrongFormatChemical: (v: string, c: string) =>
    `Unrecognizable value format (${v}) for Contaminant "${c}". Skip?`,
  wrongFormatChemicalsEsdat: (c: string) =>
    `Unrecognizable value format for Contaminant(s) "${c}". Skip?`,
  incorrectDepthFormat: 'Depth format incorrect',
  sampleMismatch: 'Mismatch: samples in Chemistry vs Sample file',
  duplicateSample: (s: string) => `Duplicate Sample ID ${s}`,
  noLocationInHeader: (s: string) =>
    `Sample ID ${s} not present in Header file`,
}
