import { createClient } from '@supabase/supabase-js'
import { Readable } from 'node:stream'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!,
)

export async function getFileStream(bucket: string, path: string): Promise<Readable> {
  const { data, error } = await supabase.storage.from(bucket).download(path)
  if (error || !data) throw error ?? new Error('File not found')
  if (typeof (data as any).arrayBuffer === 'function') {
    return Readable.fromWeb(data as any)
  }
  return data as any as Readable
}
