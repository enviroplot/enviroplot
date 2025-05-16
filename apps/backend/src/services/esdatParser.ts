import express, { Request, Response } from 'express';
import multer from 'multer';
import { parseEsdatBundle } from '../services/esdatParser'; 
import { saveParsedResults } from '../services/dbService';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  '/',
  upload.fields([
    { name: 'sample', maxCount: 1 },
    { name: 'chemistry', maxCount: 1 },
    { name: 'header', maxCount: 1 }
  ]),
  async (req: Request, res: Response) => {
    try {
      const { projectId } = req.body;

      const files = req.files as {
        [fieldname: string]: Express.Multer.File[];
      };

      if (!files || !projectId) {
        return res.status(400).json({ error: 'Missing files or project ID' });
      }

      const result = await parseEsdatBundle({
        sample: files['sample'][0].buffer,
        chemistry: files['chemistry'][0].buffer,
        header: files['header']?.[0]?.buffer
      });

      await saveParsedResults(projectId, result);

      res.status(200).json({ message: 'Parsed and saved' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error during ESdat parsing or saving' });
    }
  }
);

export default router;
