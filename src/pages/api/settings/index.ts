import SettingsController from 'backend/controllers/settingsController';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'PATCH':
      await SettingsController.set(req, res);
      break;
    default:
      res.status(405).end();
      break;
  }
}
