import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { Anime, DatabaseInterface, Episode, Subtitle } from './types';
const fsPromises = fs.promises;

class Database {
  private dataFilePath: string = '';
  private database: DatabaseInterface = {
    animes: [],
    episodes: [],
    subtitles: [],
  };

  constructor(fileName: string) {
    const filePath = fileName;
    this.dataFilePath = fileName;
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath);
      this.database = JSON.parse(fileData.toString());
    } else {
      fs.writeFileSync(filePath, this.toString());
    }
  }

  toString(): string {
    return JSON.stringify(this.database);
  }

  async syncFile() {
    await fsPromises.writeFile(this.dataFilePath, this.toString());
  }

  getAnimes() {
    return this.database.animes;
  }

  getAnime(id: string) {
    const anime = this.database.animes.find((anime) => anime.id === id);
    return anime;
  }

  getAnimeEpisodes(animeId: string) {
    const animeEpisodes = this.database.episodes.filter(
      (episode) => episode.animeId === animeId
    );
    return animeEpisodes;
  }

  getEpisode(id: string) {
    const episode = this.database.episodes.find(
      (episode) => episode.animeId === id
    );
    return episode;
  }

  getEpisodeSubtitles(episodeId: string) {
    const episodeSubtitles = this.database.subtitles.filter(
      (subtitle) => subtitle.episodeId === episodeId
    );
    return episodeSubtitles;
  }

  async insertAnime(anime: Anime) {
    const animeData = anime;
    const id = uuid();
    animeData.id = id;
    this.database.animes.push(animeData);
    await this.syncFile();
  }

  async insertEpisode(episode: Episode) {
    const episodeData = episode;
    const id = uuid();
    episodeData.id = id;
    this.database.episodes.push(episodeData);
    await this.syncFile();
  }

  async insertSubtitle(subtitle: Subtitle) {
    const episodeData = subtitle;
    const id = uuid();
    episodeData.id = id;
    this.database.subtitles.push(episodeData);
    await this.syncFile();
  }
}

export default Database;
