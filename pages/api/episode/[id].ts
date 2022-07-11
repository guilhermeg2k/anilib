import EpisodeController from '@backend/controllers/episode';
import type { NextApiRequest, NextApiResponse } from 'next';

const episodeController = new EpisodeController();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      episodeController.listById(req, res);
      break;
    default:
      res.status(405).send('Method Not Allowed');
      break;
  }
}
