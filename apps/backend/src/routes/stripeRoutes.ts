import { Router } from 'express'
import { stripeWebhook } from '../controllers/stripeController'

const router = Router()
// Define the '/webhook' route: full endpoint '/api/stripe/webhook'
router.post('/webhook', stripeWebhook)
export default router
