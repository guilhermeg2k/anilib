import LibraryController from 'backend/controllers/library-controller';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'POST':
      await LibraryController.update(req, res);
      break;
    default:
      res.status(405).end();
      break;
  }
}
