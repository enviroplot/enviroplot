import { Router } from 'express'
import { exportExcel } from '../controllers/exportController'

const router = Router()
// Define the '/excel' route: full endpoint '/api/export/excel'
router.post('/excel', exportExcel)
export default router
