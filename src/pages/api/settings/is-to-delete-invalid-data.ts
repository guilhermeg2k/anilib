import SettingsController from 'backend/controllers/settingsController';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      await SettingsController.getIsToDeleteInvalidData(req, res);
      break;
    case 'PATCH':
      await SettingsController.setIsToDeleteInvalidData(req, res);
      break;
    default:
      res.status(405).end();
      break;
  }
}
