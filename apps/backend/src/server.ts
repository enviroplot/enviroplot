import app from './app'
import { env } from './config/env'

app.listen(env.PORT, () => {
  console.log('✅ Loaded ENV:', env)
  console.log(`Server running on port ${env.PORT}`)
})
