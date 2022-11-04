import DirectoryController from 'backend/controllers/directoryController';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      await DirectoryController.list(req, res);
      break;
    case 'POST':
      await DirectoryController.create(req, res);
      break;
    default:
      res.status(405).end();
      break;
  }
}
