import fs from 'fs';
import { v4 as uuid } from 'uuid';
import { Anime, DatabaseData, Episode, Subtitle } from './types';
const fsPromises = fs.promises;

class Database {
  private dataFilePath: string = '';
  private database: DatabaseData = {
    animes: new Map<string, Anime>(),
    episodes: new Map<string, Episode>(),
    subtitles: new Map<string, Subtitle>(),
    directories: new Map<string, string>(),
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
    };
    return JSON.stringify(database);
  }

  private async syncFile() {
    await fsPromises.writeFile(this.dataFilePath, this.toString());
  }

  getAnimes() {
    return Array.from(this.database.animes.values());
  }

  getEpisodes() {
    return Array.from(this.database.episodes.values());
  }

  getSubtitles() {
    return Array.from(this.database.subtitles.values());
  }

  getDirectories() {
    return Array.from(this.database.directories.values());
  }

  getAnimeById(id: string) {
    return this.database.animes.get(id);
  }

  getEpisodeById(id: string) {
    return this.database.episodes.get(id);
  }

  getSubtitleById(id: string) {
    return this.database.subtitles.get(id);
  }

  getDirectory(directory: string) {
    return this.database.directories.get(directory);
  }

  async insertAnime(anime: Anime) {
    const id = uuid();
    const newAnime = { ...anime, id };
    this.database.animes.set(id, newAnime);
    await this.syncFile();
    return this.database.animes.get(id)!;
  }

  async insertEpisode(episode: Episode) {
    const id = uuid();
    const newEpisode = { ...episode, id };
    this.database.episodes.set(id, newEpisode);
    await this.syncFile();
    return this.database.episodes.get(id)!;
  }

  async insertSubtitle(subtitle: Subtitle) {
    const id = uuid();
    const newSubtitle = {
      ...subtitle,
      id,
    };
    this.database.subtitles.set(id, newSubtitle);
    await this.syncFile();
    return this.database.subtitles.get(id)!;
  }

  async insertDirectory(directory: string) {
    this.database.directories.set(directory, directory);
    await this.syncFile();
    return this.database.directories.get(directory)!;
  }

  async deleteDirectory(directory: string) {
    this.database.directories.delete(directory);
    await this.syncFile();
  }

  async deleteInvalidAnimes() {
    const animes = this.getAnimes();
    const invalidAnimes = animes.filter(
      (anime) => !fs.existsSync(anime.folderPath)
    );
    invalidAnimes.forEach((invalidAnime) =>
      this.database.animes.delete(invalidAnime.id!)
    );
    await this.syncFile();
  }

  async deleteInvalidEpisodes() {
    const episodes = this.getEpisodes();
    const invalidEpisodes = episodes.filter(
      (episode) => !fs.existsSync(episode.filePath)
    );
    invalidEpisodes.forEach((invalidEpisode) =>
      this.database.episodes.delete(invalidEpisode.id!)
    );
    await this.syncFile();
  }

  async deleteInvalidSubtitles() {
    const subtitles = this.getSubtitles();
    const invalidSubtitles = subtitles.filter(
      (subtitle) => !fs.existsSync(subtitle.filePath)
    );
    invalidSubtitles.forEach((invalidSubtitle) =>
      this.database.subtitles.delete(invalidSubtitle.id!)
    );
    await this.syncFile();
  }

  async deleteInvalidDirectories() {
    const directories = this.getDirectories();
    const invalidDirectories = directories.filter(
      (directory) => !fs.existsSync(directory)
    );
    invalidDirectories.forEach((invalidDirectory) =>
      this.database.directories.delete(invalidDirectory)
    );
    await this.syncFile();
  }
}

export default Database;
