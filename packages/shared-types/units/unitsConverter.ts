import { unitsConstants, UnitCode } from './unitsConstants.js'

export function convert(value: number, from: UnitCode, to: UnitCode): number {
  const fromInfo = unitsConstants[from]
  const toInfo = unitsConstants[to]

  if (!fromInfo || !toInfo) throw new Error('Unsupported unit')

  if (from === to) return value

  let intermediate = value * fromInfo.factor
  const baseFrom = fromInfo.base
  const baseTo = toInfo.base

  if (baseFrom !== baseTo) {
    // allow mass per mass <-> mass per volume with density 1
    const crossAllowed =
      (baseFrom === 'mg/kg' && baseTo === 'mg/L') ||
      (baseFrom === 'mg/L' && baseTo === 'mg/kg')

    if (!crossAllowed) throw new Error('Unsupported unit')
    // no factor change as density assumed 1
  }

  return intermediate / toInfo.factor
}
