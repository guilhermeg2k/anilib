import AnimeController from 'backend/controllers/animeController';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'PATCH':
      await AnimeController.syncDataWithAnilistById(req, res);
      break;
    default:
      res.status(405).end();
      break;
  }
}
