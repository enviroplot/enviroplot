export default {
  convertMeasurementValue,
  convertReportItem: (r: any, _u: string) => r,
  isUnitsConvertible: () => true,
  convertToDefaultUnifiedUnits: (u: string) => u,
}

function convertMeasurementValue(m: any, _toUnits: string, _type: any) {
  return { ...m }
}
