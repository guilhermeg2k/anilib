import SettingsRepository from 'backend/repository/settingsRepository';

class SettingsService {
  static getIsToDeleteConvertedData() {
    return SettingsRepository.get('isToDeleteConvertedData');
  }

  static getIsToDeleteInvalidData() {
    return SettingsRepository.get('isToDeleteInvalidData');
  }

  static getShouldUseNVENC() {
    return SettingsRepository.get('shouldUseNVENC');
  }

  static setIsToDeleteConvertedData(isToDeleteConvertedData: boolean) {
    SettingsRepository.set('isToDeleteConvertedData', isToDeleteConvertedData);
  }

  static async setIsToDeleteInvalidData(isToDeleteInvalidData: boolean) {
    SettingsRepository.set('isToDeleteInvalidData', isToDeleteInvalidData);
  }

  static setShouldUseNVENC = (shouldUseNVENC: boolean) => {
    SettingsRepository.set('shouldUseNVENC', shouldUseNVENC);
  };
}

export default SettingsService;
