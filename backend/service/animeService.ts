import { Anime } from '@backend/database/types';
import AnimeRepository from '@backend/repository/animeRepository';
import AnilistService from '@backend/service/anilistService';
import fileSystem from 'fs';
import path from 'path';
import EpisodeService from './episodeService';

const animeRepository = new AnimeRepository();
const anilistService = new AnilistService();
const episodeService = new EpisodeService();
const fs = fileSystem.promises;

class AnimeService {
  list() {
    const animes = animeRepository.list();
    return animes;
  }

  getById(id: string) {
    const anime = animeRepository.listById(id);
    return anime;
  }

  getByPath(path: string) {
    const anime = animeRepository.listByPath(path);
    return anime;
  }

  async createFromDirectories(directories: Array<string>) {
    const createdAnimesPromises = directories.map(async (directory) =>
      this.createFromDirectory(directory)
    );
    const createdAnimes = await Promise.all(createdAnimesPromises);
    return createdAnimes.flat(Infinity);
  }

  async createFromDirectory(directory: string) {
    const createdAnimes = [];
    const directoryFolders = await fs.readdir(directory);
    for (const folder of directoryFolders) {
      const folderPath = path.join(directory, folder);
      const episodeFilesPaths = await this.getEpisodeFilesPaths(folderPath);
      if (episodeFilesPaths.length > 0) {
        const localAnime = animeRepository.listByPath(folderPath);
        if (localAnime) {
          episodeService.createFromAnimeAndFilePaths(
            localAnime,
            episodeFilesPaths
          );
        } else {
          const anime = await anilistService.getAnimeBySearch(folder);
          const newAnime = { ...anime, folderPath };
          const createdAnime = await animeRepository.create(newAnime);
          createdAnimes.push(createdAnime);
          await episodeService.createFromAnimeAndFilePaths(
            createdAnime,
            episodeFilesPaths
          );
        }
      }
    }
    return createdAnimes;
  }

  private async getEpisodeFilesPaths(folder: string) {
    const episodeFileExtensions = ['.mkv', '.mp4'];
    const folderDir = await fs.readdir(folder);

    const episodeFilesPromises = folderDir.map(async (file: string) => {
      const filePath = path.join(folder, file);
      const fileStats = await fs.stat(filePath);
      const isFile = fileStats.isFile();
      const isDir = fileStats.isDirectory();
      if (isFile) {
        const fileExt = path.extname(filePath);
        if (episodeFileExtensions.includes(fileExt)) {
          return filePath;
        }
      } else if (isDir) {
        return this.getEpisodeFilesPaths(filePath);
      }
      return null;
    });

    const episodeFiles = (await Promise.all(episodeFilesPromises)) as Array<
      string | Array<string>
    >;
    const flattedEpisodeFiles = episodeFiles.flat(Infinity) as Array<string>;
    const notNullEpisodeFiles = flattedEpisodeFiles.filter((episodeFile) =>
      Boolean(episodeFile)
    );
    return notNullEpisodeFiles;
  }
}

export default AnimeService;
