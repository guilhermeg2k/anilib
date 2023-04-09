import SubtitleController from 'backend/controllers/subtitle-controller';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      await SubtitleController.getVttFileById(req, res);
      break;
    default:
      res.status(405).end();
      break;
  }
}
