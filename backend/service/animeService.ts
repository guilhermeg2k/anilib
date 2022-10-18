import { SQUARE_BRACKET_CONTENT_EXPRESSION } from '@backend/constants/regexConstants';
import { Anime } from '@backend/database/types';
import AnimeRepository from '@backend/repository/animeRepository';
import { getAnimeWithMostSimilarTitleToText } from '@utils/animeUtils';
import fs from 'fs';
import pLimit from 'p-limit';
import path from 'path';
import AnilistService from './anilistService';
import { AnilistAnime } from './types';

const fsPromises = fs.promises;
class AnimeService {
  private static createFromDirectoryPromiseLimiter = pLimit(5);

  static list() {
    const animes = AnimeRepository.list();
    return animes;
  }

  static getById(id: string) {
    const anime = AnimeRepository.getById(id);
    return anime;
  }

  static getByPath(path: string) {
    const anime = AnimeRepository.listByPath(path);
    return anime;
  }

  static deleteInvalids() {
    const invalidAnimes = this.list().filter(
      (anime) => !fs.existsSync(anime.folderPath)
    );

    invalidAnimes.forEach((invalidAnime) =>
      AnimeRepository.deleteById(invalidAnime.id!)
    );
  }

  static async createFromDirectories(directories: Array<string>) {
    const createdAnimesPromises = directories.map(async (directory) =>
      this.createFromDirectoryPromiseLimiter(() =>
        this.createFromDirectory(directory)
      )
    );
    const createdAnimes = await Promise.all(createdAnimesPromises);
    return createdAnimes.flat(Infinity);
  }

  private static async createFromDirectory(directoryPath: string) {
    const createdAnimes = Array<Anime>();
    const directoryExists = fs.existsSync(directoryPath);

    if (directoryExists) {
      const directoryFolders = await fsPromises.readdir(directoryPath);
      for (const folder of directoryFolders) {
        const createdAnime = await this.createFromFolderOnDirectory(
          folder,
          directoryPath
        );
        if (createdAnime) {
          createdAnimes.push(createdAnime);
        }
      }
    }

    return createdAnimes;
  }

  private static async createFromFolderOnDirectory(
    folder: string,
    folderDirectoryPath: string
  ) {
    const folderPath = path.join(folderDirectoryPath, folder);
    const folderInfo = await fsPromises.stat(folderPath);

    if (folderInfo.isDirectory()) {
      const animeAlreadyExists = Boolean(
        AnimeRepository.listByPath(folderPath)
      );
      if (animeAlreadyExists) {
        return null;
      }
      const searchTitle = folder.replaceAll(
        SQUARE_BRACKET_CONTENT_EXPRESSION,
        ''
      );
      const createdAnime = await this.createFromFolderPathBySearchingOnAnilist(
        folderPath,
        searchTitle
      );
      return createdAnime;
    }
    return null;
  }

  private static async createFromFolderPathBySearchingOnAnilist(
    folderPath: string,
    searchText: string
  ) {
    const searchResults = await AnilistService.getAnimesBySearch(searchText);

    const anime = getAnimeWithMostSimilarTitleToText(
      searchResults,
      searchText
    ) as AnilistAnime;

    if (anime) {
      const releaseDate = new Date();
      releaseDate.setFullYear(anime.startDate.year);
      releaseDate.setMonth(anime.startDate.month);
      releaseDate.setDate(anime.startDate.day);

      const animeParsed = {
        anilistId: anime.id,
        title: anime.title,
        bannerUrl: anime.bannerImage,
        coverUrl: anime.coverImage.extraLarge,
        description: anime.description,
        episodes: anime.episodes,
        releaseDate: releaseDate,
        status: anime.status,
        genres: anime.genres,
        format: anime.format,
        folderPath,
      };

      const createdAnime = AnimeRepository.create(animeParsed);

      return createdAnime;
    }
    return null;
  }
}

export default AnimeService;
