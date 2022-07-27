import SettingsRepository from '@backend/repository/settingsRepository';

const settingsRepository = new SettingsRepository();

class SettingsService {
  getIsToDeleteConvertedData() {
    return settingsRepository.get('isToDeleteConvertedData');
  }

  getIsToDeleteInvalidData() {
    return settingsRepository.get('isToDeleteInvalidData');
  }

  setIsToDeleteConvertedData(isToDeleteConvertedData: boolean) {
    settingsRepository.set('isToDeleteConvertedData', isToDeleteConvertedData);
  }

  async setIsToDeleteInvalidData(isToDeleteInvalidData: boolean) {
    settingsRepository.set('isToDeleteInvalidData', isToDeleteInvalidData);
  }
}

export default SettingsService;
