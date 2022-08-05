import database from '@backend/database/';

type Settings = 'isToDeleteConvertedData' | 'isToDeleteInvalidData';

class SettingsRepository {
  static list() {
    const settings = <Map<string, string>>database.list('settings');
    return settings;
  }

  static get(settings: Settings) {
    return <Boolean>database.get('settings', settings);
  }

  static set(settings: string, value: Boolean) {
    database.insertOrUpdate('settings', settings, value);
  }
}

export default SettingsRepository;
