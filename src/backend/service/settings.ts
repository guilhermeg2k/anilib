import { SettingName } from '@common/types/prisma';
import SettingsRepository from 'backend/repository/settings';

class SettingsService {
  static list() {
    return SettingsRepository.list();
  }

  static getByName(setting: SettingName) {
    return SettingsRepository.getByNameOrThrow(setting);
  }

  static set(id: number, value: boolean) {
    return SettingsRepository.set(id, value);
  }
}

export default SettingsService;
