import parser from './importEsdatService.js'
import { getFileStream } from './supabaseFile.js'

export interface BundleInput {
  sampleKey: string
  chemistryKey: string
  headerKey?: string
}

export async function parseEsdatBundle(i: BundleInput): Promise<any> {
  const sampleStream = await getFileStream('uploads', i.sampleKey)
  const chemistryStream = await getFileStream('uploads', i.chemistryKey)
  const result = await parser.readCSVFileNormalValues(
    sampleStream,
    chemistryStream,
    false,
    'soil' as any,
    {} as any,
  )
  return result
}
