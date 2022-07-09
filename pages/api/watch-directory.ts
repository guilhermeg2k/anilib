import WatchDirectoryController from '@backend/controllers/watchDirectory';
import type { NextApiRequest, NextApiResponse } from 'next';

const watchDirectoryController = new WatchDirectoryController();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      watchDirectoryController.list(req, res);
      break;
    case 'POST':
      watchDirectoryController.create(req, res);
      break;
    default:
      res.status(405).send('Method Not Allowed');
      break;
  }
}
