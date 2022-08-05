import SettingsRepository from '@backend/repository/settingsRepository';

class SettingsService {
  getIsToDeleteConvertedData() {
    return SettingsRepository.get('isToDeleteConvertedData');
  }

  getIsToDeleteInvalidData() {
    return SettingsRepository.get('isToDeleteInvalidData');
  }

  setIsToDeleteConvertedData(isToDeleteConvertedData: boolean) {
    SettingsRepository.set('isToDeleteConvertedData', isToDeleteConvertedData);
  }

  async setIsToDeleteInvalidData(isToDeleteInvalidData: boolean) {
    SettingsRepository.set('isToDeleteInvalidData', isToDeleteInvalidData);
  }
}

export default SettingsService;
