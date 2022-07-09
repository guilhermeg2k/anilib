import AnimeController from '@backend/controllers/anime';
import type { NextApiRequest, NextApiResponse } from 'next';

const animeController = new AnimeController();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      animeController.listById(req, res);
      break;
    default:
      res.status(405).send('Method Not Allowed');
      break;
  }
}
