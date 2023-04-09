import { Setting } from '@backend/database/types';
import axiosClient from 'library/axios';

class SettingsService {
  static async get(setting: Setting) {
    const settings = await axiosClient.get<boolean>(`/settings/${setting}`);
    return settings.data;
  }

  static async update(setting: Setting, value: boolean) {
    await axiosClient.patch(`/settings/`, {
      setting,
      value,
    });
  }
}

export default SettingsService;
