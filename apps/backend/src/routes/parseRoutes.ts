import { Router } from 'express';
import { parseEsdat } from '../controllers/parseController';

const router = Router();

// Using '/esdat' here means the full endpoint is "/api/parse/esdat"
router.post('/esdat', parseEsdat);

export default router;
