import { Request, Response } from 'express'

export const parseEsdat = async (req: Request, res: Response) => {
  res.status(200).json({ sample: 'it works!' })
}
