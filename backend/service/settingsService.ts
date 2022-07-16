import SettingsRepository from '@backend/repository/settingsRepository';

const settingsRepository = new SettingsRepository();

class SettingsService {
  get() {
    const settings = settingsRepository.get();
    return settings;
  }

  async setIsToDeleteConvertedData(isToDeleteConvertedData: boolean) {
    const settings = settingsRepository.get();
    const newSettings = {
      ...settings,
      isToDeleteConvertedData,
    };
    await settingsRepository.set(newSettings);
  }

  async setIsToDeleteInvalidData(isToDeleteInvalidData: boolean) {
    const settings = settingsRepository.get();
    const newSettings = {
      ...settings,
      isToDeleteInvalidData,
    };
    await settingsRepository.set(newSettings);
  }
}

export default SettingsService;
