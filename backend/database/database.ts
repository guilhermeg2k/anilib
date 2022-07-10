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

  getAnimeByPath(path: string) {
    const anime = this.database.animes.find(
      (anime) => anime.folderPath === path
    );
    return anime;
  }

  getEpisodes() {
    return this.database.episodes;
  }

  getEpisodesByAnimeId(animeId: string) {
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

  getEpisodeByPath(path: string) {
    const episode = this.database.episodes.find(
      (episode) => episode.filePath === path
    );
    return episode;
  }

  getSubtitles() {
    return this.database.episodes;
  }

  getSubtitlesByEpisodeId(episodeId: string) {
    const episodeSubtitles = this.database.subtitles.filter(
      (subtitle) => subtitle.episodeId === episodeId
    );
    return episodeSubtitles;
  }

  getDirectories() {
    return this.database.directories;
  }

  async insertAnime(anime: Anime) {
    const animeData = anime;
    const id = uuid();
    animeData.id = id;
    this.database.animes.push(animeData);
    await this.syncFile();
    return animeData;
  }

  async insertEpisode(episode: Episode) {
    const episodeData = episode;
    const id = uuid();
    episodeData.id = id;
    this.database.episodes.push(episodeData);
    await this.syncFile();
    return episodeData;
  }

  async insertSubtitle(subtitle: Subtitle) {
    const subtitleData = subtitle;
    const id = uuid();
    subtitleData.id = id;
    this.database.subtitles.push(subtitleData);
    await this.syncFile();
    return subtitleData;
  }

  async insertDirectory(directory: string) {
    this.database.directories.push(directory);
    await this.syncFile();
  }
}

export default Database;
