import express from 'express'
import multer from 'multer'
import { v4 as uuid } from 'uuid'
import { parseEsdatBundle } from '../modules/esdat/parseEsdatBundle.js'
import { saveParsedResults } from '../services/dbService'
import { supabase } from '../services/supabaseClient'

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

async function uploadToStorage(f: Express.Multer.File): Promise<string> {
  const key = `${uuid()}-${f.originalname}`
  const { error } = await supabase.storage
    .from('uploads')
    .upload(key, f.buffer, { contentType: f.mimetype, upsert: true })
  if (error) throw error
  return key
}

router.post(
  '/',
  upload.fields([
    { name: 'sample', maxCount: 1 },
    { name: 'chemistry', maxCount: 1 },
    { name: 'header', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { projectId } = req.body
      const files = req.files as { [k: string]: Express.Multer.File[] }
      if (!files || !projectId)
        return res.status(400).json({ error: 'Missing files or project ID' })
      const result = await parseEsdatBundle({
        sampleKey: await uploadToStorage(files.sample[0]),
        chemistryKey: await uploadToStorage(files.chemistry[0]),
        headerKey: files.header?.[0]
          ? await uploadToStorage(files.header[0])
          : undefined,
      })
      await saveParsedResults(projectId, result)
      res.status(200).json({ message: 'Parsed and saved' })
    } catch (e: any) {
      res.status(500).json({ error: e.message })
    }
  },
)

export default router;
