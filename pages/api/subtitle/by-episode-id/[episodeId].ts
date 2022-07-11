import SubtitleController from '@backend/controllers/subtitle';
import type { NextApiRequest, NextApiResponse } from 'next';

const subtitleController = new SubtitleController();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      subtitleController.listByEpisodeId(req, res);
      break;
    default:
      res.status(405).send('Method Not Allowed');
      break;
  }
}
