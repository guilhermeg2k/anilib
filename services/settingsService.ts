import axiosClient from 'library/axios';

class SettingsService {
  async getIsToDeleteConvertedData() {
    const settings = await axiosClient.get<boolean>(
      '/settings/is-to-delete-converted-data'
    );
    return settings.data;
  }

  async getIsToDeleteInvalidData() {
    const settings = await axiosClient.get<boolean>(
      '/settings/is-to-delete-invalid-data'
    );
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
