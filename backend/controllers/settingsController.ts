import SettingsService from '@backend/service/settingsService';
import { NextApiRequest, NextApiResponse } from 'next';

const settingsService = new SettingsService();

class SettingsController {
  get(req: NextApiRequest, res: NextApiResponse) {
    try {
      const settings = settingsService.get();
      return res.json(settings);
    } catch (error) {
      res.status(500).end();
      console.error(error);
    }
  }

  async setIsToDeleteConvertedData(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { isToDeleteConvertedData } = req.body;
      if (
        isToDeleteConvertedData !== null &&
        isToDeleteConvertedData !== undefined
      ) {
        settingsService.setIsToDeleteConvertedData(isToDeleteConvertedData);
        return res.status(200).end();
      }
      res.status(400).end();
    } catch (error) {
      res.status(500).end();
      console.error(error);
    }
  }

  async setIsToDeleteInvalidData(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { isToDeleteInvalidData } = req.body;
      if (
        isToDeleteInvalidData !== null &&
        isToDeleteInvalidData !== undefined
      ) {
        settingsService.setIsToDeleteInvalidData(isToDeleteInvalidData);
        return res.status(200).end();
      }
      res.status(400).end();
    } catch (error) {
      res.status(500).end();
      console.error(error);
    }
  }
}

export default SettingsController;
