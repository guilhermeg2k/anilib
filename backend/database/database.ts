import fs from 'fs';
import { v4 as uuid } from 'uuid';
import { Anime, DatabaseData, Episode, Subtitle } from './types';
const fsPromises = fs.promises;

class Database {
  private dataFilePath: string = '';
  private database: DatabaseData = {
    animes: [],
    episodes: [],
    subtitles: [],
    directories: [],
  };

  constructor(filePath: string) {
    this.dataFilePath = filePath;
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath);
      this.database = JSON.parse(fileData.toString());
    } else {
      fs.writeFileSync(filePath, this.toString());
    }
  }

  private toString(): string {
    return JSON.stringify(this.database);
  }

  private async syncFile() {
    await fsPromises.writeFile(this.dataFilePath, this.toString());
  }

  getAnimes() {
    return this.database.animes;
  }

  getEpisodes() {
    return this.database.episodes;
  }

  getSubtitles() {
    return this.database.subtitles;
  }

  getDirectories() {
    return this.database.directories;
  }

  async insertAnime(anime: Anime) {
    const newAnime = { ...anime, id: uuid() };
    this.database.animes.push(newAnime);
    await this.syncFile();
    return newAnime;
  }

  async insertEpisode(episode: Episode) {
    const newEpisode = { ...episode, id: uuid() };
    this.database.episodes.push(newEpisode);
    await this.syncFile();
    return newEpisode;
  }

  async insertSubtitle(subtitle: Subtitle) {
    const newSubtitle = { ...subtitle, id: uuid() };
    this.database.subtitles.push(newSubtitle);
    await this.syncFile();
    return newSubtitle;
  }

  async insertDirectory(directory: string) {
    this.database.directories.push(directory);
    await this.syncFile();
  }

  async deleteDirectory(directory: string) {
    const directories = this.database.directories.filter(
      (dbDirectory) => dbDirectory != directory
    );
    this.database.directories = directories;
    await this.syncFile();
  }
}

export default Database;
