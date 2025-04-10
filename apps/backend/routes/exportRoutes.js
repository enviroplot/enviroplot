const express = require('express')
const router = express.Router()
const { exportExcel } = require('../controllers/exportController')
router.post('/', exportExcel)
module.exports = router
