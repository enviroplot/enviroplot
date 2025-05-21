import parser from './importEsdatService'
import { downloadToTemp } from './storage'

export interface BundleInput {
  sampleKey: string
  chemistryKey: string
  headerKey?: string
}

export async function parseEsdatBundle(i: BundleInput): Promise<any> {
  const samplePath = await downloadToTemp(i.sampleKey)
  const chemistryPath = await downloadToTemp(i.chemistryKey)
  const result = await parser.readCSVFileNormalValues(
    samplePath,
    chemistryPath,
    false,
    'soil' as any,
    {} as any,
  )
  return result
}
