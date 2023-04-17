import { SQUARE_BRACKET_CONTENT_REGEX } from '@common/constants/regex';
import { AnilistAnimeTitle } from '@common/types/anilist';
import { getAnimeWithMostSimilarTitleToText } from '@common/utils/anime';
import { createDateByDayMonthAndYear } from '@common/utils/date';
import { downloadFile } from '@common/utils/file';
import { Anime } from '@prisma/client';
import AnimeRepository from 'backend/repository/anime';
import fs from 'fs';
import pLimit from 'p-limit';
import path from 'path';
import AnilistService from './anilist';

const fsPromises = fs.promises;
class AnimeService {
  private static createFromDirectoryPromiseLimiter = pLimit(6);

  static async list() {
    return AnimeRepository.list();
  }

  static async getById(id: string) {
    return AnimeRepository.getById(id);
  }

  static getByPath(path: string) {
    return AnimeRepository.listByPath(path);
  }

  static async deleteInvalids() {
    const invalidAnimes = (await this.list()).filter(
      (anime) => !fs.existsSync(anime.folderPath)
    );

    return await AnimeRepository.deleteByIDS(
      invalidAnimes.map((anime) => anime.id)
    );
  }

  static async syncDataWithAnilistById(animeId: string) {
    const anime = await this.getById(animeId);
    if (!anime) return;
    const anilistAnime = await AnilistService.getAnimeById(anime.anilistID);

    const releaseDate = createDateByDayMonthAndYear(
      anilistAnime.startDate.day,
      anilistAnime.startDate.month,
      anilistAnime.startDate.year
    );

    const updateAnime: Anime = {
      ...anime,
      coverUrl: anilistAnime.coverImage.extraLarge,
      description: anilistAnime.description,
      episodes: anilistAnime.episodes,
      status: anilistAnime.status,
      genres: anilistAnime.genres,
      format: anilistAnime.format,
      releaseDate,
    };

    AnimeRepository.update(updateAnime);
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
        console.log(
          '🚀 ~ file: anime.ts:79 ~ AnimeService ~ createFromDirectory ~ folder:',
          folder
        );
        const createdAnime = await this.createFromFolderOnDirectory(
          folder,
          directoryPath
        );
        console.log(
          '🚀 ~ file: anime.ts:87 ~ AnimeService ~ createFromDirectory ~ createdAnime:',
          createdAnime
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
        await AnimeRepository.listByPath(folderPath)
      );

      if (animeAlreadyExists) {
        return null;
      }

      const searchTitle = folder.replaceAll(SQUARE_BRACKET_CONTENT_REGEX, '');
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

    const anilistAnime = getAnimeWithMostSimilarTitleToText(
      searchResults,
      searchText
    );

    if (anilistAnime) {
      const releaseDate = createDateByDayMonthAndYear(
        anilistAnime.startDate.day,
        anilistAnime.startDate.month,
        anilistAnime.startDate.year
      );

      const coverImagePath = path.join(folderPath, 'anime_cover.jpg');
      const bannerImagePath = path.join(folderPath, 'anime_banner.jpg');

      await downloadFile(anilistAnime.coverImage.extraLarge, coverImagePath);
      await downloadFile(anilistAnime.bannerImage, bannerImagePath);

      const anime = {
        anilistID: anilistAnime.id,
        description: anilistAnime.description,
        numberOfEpisodes: anilistAnime.episodes,
        averageScore: anilistAnime.averageScore,
        meanScore: anilistAnime.meanScore,
        releaseDate,
        folderPath,
        bannerImagePath,
        coverImagePath,
        anilistURL: anilistAnime.siteUrl,
      };

      const season = {
        name: anilistAnime.season,
        year: anilistAnime.seasonYear,
      };

      const genres = anilistAnime.genres.map((genre) => ({
        name: genre,
      }));

      const studios = anilistAnime.studios.nodes.map((studio) => ({
        anilistID: studio.id,
        anilistURL: studio.siteUrl,
        name: studio.name,
      }));

      const titles = this.getTitlesFromAnilistTitle(anilistAnime.title);

      const format = {
        name: anilistAnime.format,
      };

      const status = {
        name: anilistAnime.status,
      };

      const createdAnime = await AnimeRepository.create({
        anime,
        studios,
        format,
        status,
        genres,
        season,
        titles,
      });

      return createdAnime;
    }
    return null;
  }

  static getTitlesFromAnilistTitle(title: AnilistAnimeTitle) {
    const titles = [];

    for (const type in title) {
      const typeParsed = type as keyof AnilistAnimeTitle;
      if (title[typeParsed]) {
        titles.push({
          name: title[typeParsed] || '',
          type,
        });
      }
    }

    return titles;
  }
}

export default AnimeService;
