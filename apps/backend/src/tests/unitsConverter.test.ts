import { convert } from '../../../../packages/shared-types/units/index.js'

describe('convert', () => {
  test('mg/kg to mg/L', () => {
    expect(convert(12.5, 'mg/kg', 'mg/L')).toBeCloseTo(12.5)
  })

  test('mg/L to mg/kg', () => {
    expect(convert(5, 'mg/L', 'mg/kg')).toBeCloseTo(5)
  })

  test('mg/kg to µg/g', () => {
    expect(convert(1, 'mg/kg', 'µg/g')).toBeCloseTo(1)
  })

  test('µg/g to mg/kg', () => {
    expect(convert(2, 'µg/g', 'mg/kg')).toBeCloseTo(2)
  })
})
