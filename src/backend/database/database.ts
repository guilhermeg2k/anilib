import fs from 'fs';
import { Anime, DatabaseData, Episode, Subtitle } from './types';

type DatabaseProperty =
  | 'animes'
  | 'episodes'
  | 'subtitles'
  | 'directories'
  | 'settings';

class Database {
  private dataFilePath: string = '';
  private database: DatabaseData = {
    animes: new Map<string, Anime>(),
    episodes: new Map<string, Episode>(),
    subtitles: new Map<string, Subtitle>(),
    directories: new Map<string, string>(),
    settings: new Map<string, Boolean>([
      ['isToDeleteConvertedData', false],
      ['isToDeleteInvalidData', true],
      ['shouldUseNVENC', false],
    ]),
  };

  constructor(filePath: string) {
    this.dataFilePath = filePath;
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath);
      const databaseObject = <DatabaseData>JSON.parse(fileData.toString());
      const database = <DatabaseData>{
        animes: new Map(Object.entries(databaseObject.animes)),
        episodes: new Map(Object.entries(databaseObject.episodes)),
        subtitles: new Map(Object.entries(databaseObject.subtitles)),
        directories: new Map(Object.entries(databaseObject.directories)),
        settings: new Map(Object.entries(databaseObject.settings)),
      };
      this.database = database;
    } else {
      fs.writeFileSync(filePath, this.toString());
    }
  }

  private toString(): string {
    const database = {
      animes: Object.fromEntries(this.database.animes),
      episodes: Object.fromEntries(this.database.episodes),
      subtitles: Object.fromEntries(this.database.subtitles),
      directories: Object.fromEntries(this.database.directories),
      settings: Object.fromEntries(this.database.settings),
    };
    return JSON.stringify(database);
  }

  private syncFile() {
    fs.writeFileSync(this.dataFilePath, this.toString());
  }

  list(property: DatabaseProperty) {
    return this.database[property];
  }

  get(property: DatabaseProperty, key: string) {
    return this.database[property].get(key);
  }

  insertOrUpdate(property: DatabaseProperty, key: string, value: any) {
    this.database[property].set(key, value);
    this.syncFile();
    return this.database[property].get(key)!;
  }

  delete(property: DatabaseProperty, key: string) {
    this.database[property].delete(key);
    this.syncFile();
  }
}

export default Database;
