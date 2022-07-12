import AnimeController from '@backend/controllers/animeController';
import type { NextApiRequest, NextApiResponse } from 'next';

const animeController = new AnimeController();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      await animeController.getById(req, res);
      break;
    default:
      res.status(405).end();
      break;
  }
}
