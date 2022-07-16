import { Settings } from '@backend/database/types';
import axiosClient from 'library/axios';

class SettingsService {
  async get() {
    const settings = await axiosClient.get<Settings>('/settings');
    return settings.data;
  }

  async setIsToDeleteConvertedData(isToDeleteConvertedData: boolean) {
    await axiosClient.patch('/settings/is-to-delete-converted-data', {
      isToDeleteConvertedData,
    });
  }

  async setIsToDeleteInvalidData(isToDeleteInvalidData: boolean) {
    await axiosClient.patch('/settings/is-to-delete-invalid-data', {
      isToDeleteInvalidData,
    });
  }
}

export default SettingsService;
