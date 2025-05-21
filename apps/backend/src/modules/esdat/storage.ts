import { promises as fs } from 'fs'
import path from 'path'
import { v4 as uuid } from 'uuid'
import { supabase } from '../../services/supabaseClient'

export async function downloadToTemp(key: string): Promise<string> {
  const { data, error } = await supabase.storage.from('uploads').download(key)
  if (error || !data) throw error ?? new Error('download failed')
  const buf = Buffer.from(await data.arrayBuffer())
  const tmp = path.join('/tmp', `${uuid()}${path.extname(key)}`)
  await fs.writeFile(tmp, buf)
  return tmp
}
