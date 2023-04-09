import { Setting } from '@backend/database/types';
import database from 'backend/database';

class SettingsRepository {
  static list() {
    const settings = <Map<string, string>>database.list('settings');
    return settings;
  }

  static get(settings: Setting) {
    return <boolean>database.get('settings', settings);
  }

  static set(settings: Setting, value: Boolean) {
    database.insertOrUpdate('settings', settings, value);
  }
}

export default SettingsRepository;
