import SettingsRepository from '@backend/repository/settingsRepository';

class SettingsService {
  static getShouldUseNVENC() {
    return SettingsRepository.get('shouldUseNVENC');
  }
  static getIsToDeleteConvertedData() {
    return SettingsRepository.get('isToDeleteConvertedData');
  }

  static getIsToDeleteInvalidData() {
    return SettingsRepository.get('isToDeleteInvalidData');
  }

  static setIsToDeleteConvertedData(isToDeleteConvertedData: boolean) {
    SettingsRepository.set('isToDeleteConvertedData', isToDeleteConvertedData);
  }

  static async setIsToDeleteInvalidData(isToDeleteInvalidData: boolean) {
    SettingsRepository.set('isToDeleteInvalidData', isToDeleteInvalidData);
  }
}

export default SettingsService;
