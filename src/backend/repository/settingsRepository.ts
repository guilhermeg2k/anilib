import database from 'backend/database';

type Settings =
  | 'isToDeleteConvertedData'
  | 'isToDeleteInvalidData'
  | 'shouldUseNVENC';

class SettingsRepository {
  static list() {
    const settings = <Map<string, string>>database.list('settings');
    return settings;
  }

  static get(settings: Settings) {
    return <boolean>database.get('settings', settings);
  }

  static set(settings: Settings, value: Boolean) {
    database.insertOrUpdate('settings', settings, value);
  }
}

export default SettingsRepository;
