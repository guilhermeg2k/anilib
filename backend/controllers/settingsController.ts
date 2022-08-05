import SettingsService from '@backend/service/settingsService';
import { NextApiRequest, NextApiResponse } from 'next';

class SettingsController {
  static getIsToDeleteConvertedData(req: NextApiRequest, res: NextApiResponse) {
    try {
      const isToDeleteConvertedData =
        SettingsService.getIsToDeleteConvertedData();
      return res.json(isToDeleteConvertedData);
    } catch (error) {
      res.status(500).end();
      console.error(error);
    }
  }

  static getIsToDeleteInvalidData(req: NextApiRequest, res: NextApiResponse) {
    try {
      const isToDeleteInvalidData = SettingsService.getIsToDeleteInvalidData();
      return res.json(isToDeleteInvalidData);
    } catch (error) {
      res.status(500).end();
      console.error(error);
    }
  }

  static async setIsToDeleteConvertedData(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    try {
      const { isToDeleteConvertedData } = req.body;
      if (
        isToDeleteConvertedData !== null &&
        isToDeleteConvertedData !== undefined
      ) {
        SettingsService.setIsToDeleteConvertedData(isToDeleteConvertedData);
        return res.status(200).end();
      }
      res.status(400).end();
    } catch (error) {
      res.status(500).end();
      console.error(error);
    }
  }

  static async setIsToDeleteInvalidData(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    try {
      const { isToDeleteInvalidData } = req.body;
      if (
        isToDeleteInvalidData !== null &&
        isToDeleteInvalidData !== undefined
      ) {
        SettingsService.setIsToDeleteInvalidData(isToDeleteInvalidData);
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
