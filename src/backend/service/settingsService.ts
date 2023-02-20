import { Setting } from '@backend/database/types';
import SettingsRepository from 'backend/repository/settingsRepository';

class SettingsService {
  static get(setting: Setting) {
    return SettingsRepository.get(setting);
  }

  static set(setting: Setting, value: boolean) {
    SettingsRepository.set(setting, value);
  }
}

export default SettingsService;
