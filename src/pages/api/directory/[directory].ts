import DirectoryController from 'backend/controllers/directory-controller';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'DELETE':
      await DirectoryController.delete(req, res);
      break;
    default:
      res.status(405).end();
      break;
  }
}
