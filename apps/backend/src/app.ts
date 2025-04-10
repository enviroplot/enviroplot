import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import bodyParser from 'body-parser'

import healthRoutes from './routes/healthRoutes'
import parseRoutes from './routes/parseRoutes'
import exportRoutes from './routes/exportRoutes'
import stripeRoutes from './routes/stripeRoutes'

const app = express()

app.use(cors())
app.use(morgan('dev'))
app.use(bodyParser.json())

app.use('/', healthRoutes)
app.use('/api/parse', parseRoutes)
app.use('/api/export', exportRoutes)
app.use('/api/stripe', stripeRoutes)

export default app
