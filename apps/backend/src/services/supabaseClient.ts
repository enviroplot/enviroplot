import path from 'path'
import dotenv from 'dotenv'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_KEY must be set in .env')
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey)
