import database from '@backend/database/';
import { Settings } from '@backend/database/types';

class SettingsRepository {
  get() {
    const settings = database.getSettings();
    return settings;
  }

  async set(settings: Settings) {
    await database.setSettings(settings);
  }
}

export default SettingsRepository;
