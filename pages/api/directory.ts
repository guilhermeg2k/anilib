import DirectoryController from '@backend/controllers/directoryController';
import type { NextApiRequest, NextApiResponse } from 'next';

const directoryController = new DirectoryController();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      await directoryController.list(req, res);
      break;
    case 'POST':
      await directoryController.create(req, res);
      break;
    default:
      res.status(405).end();
      break;
  }
}
