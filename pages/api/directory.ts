import DirectoryController from '@backend/controllers/directory';
import type { NextApiRequest, NextApiResponse } from 'next';

const directoryController = new DirectoryController();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      directoryController.list(req, res);
      break;
    case 'POST':
      directoryController.create(req, res);
      break;
    default:
      res.status(405).send('Method Not Allowed');
      break;
  }
}
