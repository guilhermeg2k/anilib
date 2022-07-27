import SettingsController from '@backend/controllers/settingsController';
import type { NextApiRequest, NextApiResponse } from 'next';

const settingsController = new SettingsController();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      await settingsController.getIsToDeleteInvalidData(req, res);
      break;
    case 'PATCH':
      await settingsController.setIsToDeleteInvalidData(req, res);
      break;
    default:
      res.status(405).end();
      break;
  }
}
