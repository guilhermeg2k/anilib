import { SQUARE_BRACKET_CONTENT_REGEX } from '@common/constants/regex';
import { AnilistAnime, AnilistAnimeTitle } from '@common/types/anilist';
import {
  Anime,
  AnimeFormatInput,
  AnimeStatusInput,
  AnimeTitleInput,
  GenreInput,
  SeasonInput,
  StudioInput,
} from '@common/types/prisma';
import { getAnimeWithMostSimilarTitleToText } from '@common/utils/anime';
import { createDateByDayMonthAndYear } from '@common/utils/date';
import { downloadFile } from '@common/utils/file';
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

  static async listWithAllRelations() {
    const animes = await AnimeRepository.listWithAllRelations();

    const animesWithImagesInBase64 = await Promise.all(
      animes.map(async (anime) => await this.getAnimeWithImagesInBase64(anime))
    );

    return animesWithImagesInBase64;
  }

  static async getWithAllRelationsById(id: string) {
    const anime = await AnimeRepository.getWithAllRelationsById(id);

    const animeWithImagesInBase64 = await this.getAnimeWithImagesInBase64(
      anime
    );

    return animeWithImagesInBase64;
  }

  static getByPath(path: string) {
    return AnimeRepository.listByPath(path);
  }

  static async getAnimeWithImagesInBase64<
    T extends { coverImagePath: string; bannerImagePath: string }
  >(anime: T) {
    const coverImage = await fsPromises.readFile(anime.coverImagePath, {
      encoding: 'base64',
    });

    const bannerImage = await fsPromises.readFile(anime.bannerImagePath, {
      encoding: 'base64',
    });

    return {
      ...anime,
      coverImage,
      bannerImage,
    };
  }

  static async deleteInvalids() {
    const invalidAnimes = (await this.listWithAllRelations()).filter(
      (anime) => !fs.existsSync(anime.folderPath)
    );

    return await AnimeRepository.deleteByIds(
      invalidAnimes.map((anime) => anime.id)
    );
  }

  static async syncDataWithAnilistById(animeId: string) {
    const anime = await this.getWithAllRelationsById(animeId);
    if (!anime) return;

    const anilistAnime = await AnilistService.getAnimeById(anime.anilistID);

    const {
      anime: updateAnime,
      studios,
      format,
      status,
      genres,
      season,
    } = this.createInputFromAnilistAnime(anilistAnime, anime.folderPath);

    return AnimeRepository.updateWithAllRelations({
      anime: updateAnime,
      studios,
      format,
      status,
      genres,
      season,
    });
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
      const { anime, studios, format, status, genres, season, titles } =
        this.createInputFromAnilistAnime(anilistAnime, folderPath);

      await downloadFile(
        anilistAnime.coverImage.extraLarge,
        anime.coverImagePath
      );

      await downloadFile(anilistAnime.bannerImage, anime.bannerImagePath);

      const createdAnime = await AnimeRepository.createWithAllRelations({
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

  static createInputFromAnilistAnime(
    anilistAnime: AnilistAnime,
    folderPath: string
  ) {
    const releaseDate = createDateByDayMonthAndYear(
      anilistAnime.startDate.day,
      anilistAnime.startDate.month,
      anilistAnime.startDate.year
    );

    const coverImagePath = path.join(folderPath, 'anime_cover.jpg');
    const bannerImagePath = path.join(folderPath, 'anime_banner.jpg');

    const anime = {
      anilistID: anilistAnime.id,
      description: anilistAnime.description,
      numberOfEpisodes: anilistAnime.episodes,
      averageScore: anilistAnime.averageScore,
      meanScore: anilistAnime.meanScore,
      popularity: anilistAnime.popularity,
      releaseDate,
      folderPath,
      bannerImagePath,
      coverImagePath,
      anilistURL: anilistAnime.siteUrl,
    };

    const season: SeasonInput = {
      name: anilistAnime.season,
      year: anilistAnime.seasonYear,
    };

    const genres: GenreInput[] = anilistAnime.genres.map((genre) => ({
      name: genre,
    }));

    const studios: StudioInput[] = anilistAnime.studios.nodes.map((studio) => ({
      anilistID: studio.id,
      anilistURL: studio.siteUrl,
      name: studio.name,
    }));

    const titles: AnimeTitleInput[] = this.getTitlesFromAnilistTitle(
      anilistAnime.title
    );

    const format: AnimeFormatInput = {
      name: anilistAnime.format,
    };

    const status: AnimeStatusInput = {
      name: anilistAnime.status,
    };

    return {
      anime,
      studios,
      format,
      status,
      genres,
      season,
      titles,
    };
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
