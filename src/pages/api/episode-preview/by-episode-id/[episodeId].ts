import EpisodePreviewController from 'backend/controllers/episodePreviewController';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      await EpisodePreviewController.listBase64ByEpisodeId(req, res);
      break;
    default:
      res.status(405).end();
      break;
  }
}
