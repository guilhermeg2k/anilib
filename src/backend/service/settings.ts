import { Setting } from '@common/types/database';
import SettingsRepository from 'backend/repository/settings';

class SettingsService {
  static get(setting: Setting) {
    return SettingsRepository.get(setting);
  }

  static set(setting: Setting, value: boolean) {
    SettingsRepository.set(setting, value);
  }
}

export default SettingsService;
