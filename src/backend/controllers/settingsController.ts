import { Setting } from '@backend/database/types';
import SettingsService from 'backend/service/settingsService';
import { NextApiRequest, NextApiResponse } from 'next';

class SettingsController {
  static get(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { setting } = req.query;
      const settings = SettingsService.get(setting as Setting);
      return res.json(settings);
    } catch (error) {
      res.status(500).end();
      console.error(error);
    }
  }

  static set(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { setting, value } = req.body;
      SettingsService.set(setting as Setting, value);
      return res.status(200).end();
    } catch (error) {
      res.status(500).end();
      console.error(error);
    }
  }
}

export default SettingsController;
