import EpisodeController from 'backend/controllers/episodeController';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      await EpisodeController.getImageCoverBase64ById(req, res);
      break;
    default:
      res.status(405).end();
      break;
  }
}
