import path from 'path'
import dotenv from 'dotenv'

const envPath = path.resolve(__dirname, '../../../../.env')
console.log('🔍 Loading .env from:', envPath)

// Load .env from the resolved path
const result = dotenv.config({ path: envPath })

if (result.error) {
  console.error('❌ Failed to load .env:', result.error)
} else {
  console.log('✅ .env loaded successfully')
}

const required = ['SUPABASE_URL', 'SUPABASE_KEY', 'STRIPE_SECRET_KEY', 'PORT'] as const

for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌ Missing env var: ${key}`)
    throw new Error(`Missing required env var: ${key}`)
  }
}

export const env = {
  SUPABASE_URL: process.env.SUPABASE_URL!,
  SUPABASE_KEY: process.env.SUPABASE_KEY!,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
  PORT: process.env.PORT || '3001',
}
