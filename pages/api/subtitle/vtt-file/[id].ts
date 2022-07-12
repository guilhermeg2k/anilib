import SubtitleController from '@backend/controllers/subtitleController';
import type { NextApiRequest, NextApiResponse } from 'next';

const subtitleController = new SubtitleController();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      subtitleController.getVttFileById(req, res);
      break;
    default:
      res.status(405).end();
      break;
  }
}
