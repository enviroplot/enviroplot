import { Request, Response } from 'express';

export const healthCheck = (req: Request, res: Response): void => {
  // Return JSON object with "status"
  res.status(200).json({ status: "ok" });
};