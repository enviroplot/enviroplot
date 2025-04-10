const express = require('express')
const router = express.Router()
const { stripeWebhook } = require('../controllers/stripeController')
router.post('/', stripeWebhook)
module.exports = router
