import LibraryController from '@backend/controllers/libraryController';
import type { NextApiRequest, NextApiResponse } from 'next';

const libraryController = new LibraryController();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'POST':
      await libraryController.update(req, res);
      break;
    default:
      res.status(405).end();
      break;
  }
}
