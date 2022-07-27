import SettingsService from '@backend/service/settingsService';
import { NextApiRequest, NextApiResponse } from 'next';

const settingsService = new SettingsService();

class SettingsController {
  getIsToDeleteConvertedData(req: NextApiRequest, res: NextApiResponse) {
    try {
      const isToDeleteConvertedData =
        settingsService.getIsToDeleteConvertedData();
      return res.json(isToDeleteConvertedData);
    } catch (error) {
      res.status(500).end();
      console.error(error);
    }
  }

  getIsToDeleteInvalidData(req: NextApiRequest, res: NextApiResponse) {
    try {
      const isToDeleteInvalidData = settingsService.getIsToDeleteInvalidData();
      return res.json(isToDeleteInvalidData);
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
