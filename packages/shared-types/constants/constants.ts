export const reportDateFormat = 'dd/MM/yy'

export const sampleFieldIdExceptions = ['Trip spike', 'Trip blank', 'Surrogate']

export const emptyCodes = ['N/A']

export const asbestosCodesSoil = ['ASB', 'ASB (t)', 'ASB t', 'ASB-total', 'ASB total']

export const asbestosCodesAir = ['ASB-f', 'ASB f', 'ASB fibres', 'ASB-fibres']

export const asbestosSoilUnits = ['g/kg', 'mg/kg', 'mg/kg dry']

export const asbestosAirUnits = ['f/mL', 'f/L']

export const asbestosDensity = 2.55

export const asbestosSoilDefaultUnits = 'mg/kg'

export const UNITS = {
  MGKG: 'mg/kg',
  UGKG: 'µg/kg',
  MGL: 'mg/L',
  UGL: 'µg/L',
  PERCENT: '%',
  F_PER_ML: 'f/mL',
  F_PER_L: 'f/L',
  NONE: '',
} as const

export type Units = (typeof UNITS)[keyof typeof UNITS]

export enum AssessmentType {
  Soil = 'soil',
  Groundwater = 'groundwater',
  Sediment = 'sediment',
}
