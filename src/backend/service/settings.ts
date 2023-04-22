import { Setting } from '@common/types/database';
import SettingsRepository from 'backend/repository/settings';

class SettingsService {
  static list() {
    return SettingsRepository.list();
  }

  static get(setting: Setting) {
    return SettingsRepository.getByName(setting);
  }

  static set(id: number, value: boolean) {
    return SettingsRepository.set(id, value);
  }
}

export default SettingsService;
