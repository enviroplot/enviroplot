const express = require('express')
const router = express.Router()
const { parseEsdat } = require('../controllers/parseController')
router.post('/', parseEsdat)
module.exports = router
