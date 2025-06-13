export const unitsConstants = {
  'mg/kg': { base: 'mg/kg', factor: 1 },
  'ug/kg': { base: 'mg/kg', factor: 1e-3 },
  'µg/kg': { base: 'mg/kg', factor: 1e-3 },
  'ng/kg': { base: 'mg/kg', factor: 1e-6 },
  '%': { base: 'mg/kg', factor: 1e4 },
  'ppm': { base: 'mg/kg', factor: 1 },
  'µg/g': { base: 'mg/kg', factor: 1 },

  'mg/L': { base: 'mg/L', factor: 1 },
  'ug/L': { base: 'mg/L', factor: 1e-3 },
  'µg/L': { base: 'mg/L', factor: 1e-3 },
  'ng/L': { base: 'mg/L', factor: 1e-6 },
  'ppb': { base: 'mg/L', factor: 1e-3 },

  'cmol/kg': { base: 'cmol/kg', factor: 1 },
  'meq/100g': { base: 'cmol/kg', factor: 0.1 },
} as const

export type UnitCode = keyof typeof unitsConstants
