import { SQUARE_BRACKET_CONTENT_REGEX } from '@common/constants/regex';
import { AnilistAnime, AnilistAnimeTitle } from '@common/types/anilist';
import {
  Anime,
  AnimeFormatInput,
  AnimeStatusInput,
  AnimeTitleInput,
  Directory,
  GenreInput,
  SeasonInput,
  StudioInput,
} from '@common/types/database';
import { createDateByDayMonthAndYear } from '@common/utils/date';
import { downloadFile } from '@common/utils/file';
import AnimeRepository from 'backend/repository/anime';
import fs from 'fs';
import pLimit from 'p-limit';
import path from 'path';
import AnilistService from './anilist';
import { getAnimeWithMostSimilarTitleToText } from '@common/utils/anilist';

const fsPromises = fs.promises;

class AnimeService {
  private static createFromDirectoryPromiseLimiter = pLimit(6);

  static async list() {
    return AnimeRepository.list();
  }

  static async listWithAllRelations() {
    return AnimeRepository.listWithAllRelations();
  }

  static async getById(id: string) {
    return AnimeRepository.getById(id);
  }

  static async getWithAllRelationsById(id: string) {
    return AnimeRepository.getWithAllRelationsById(id);
  }

  static getByPath(path: string) {
    return AnimeRepository.listByPath(path);
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

    const anilistAnime = await AnilistService.getAnimeById(anime.anilistId);

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

  static async createFromDirectories(directories: Array<Directory>) {
    const createdAnimesPromises = directories.map(async (directory) =>
      this.createFromDirectoryPromiseLimiter(() =>
        this.createFromDirectory(directory)
      )
    );
    const createdAnimes = await Promise.all(createdAnimesPromises);
    return createdAnimes.flat(Infinity);
  }

  private static async createFromDirectory(directory: Directory) {
    const createdAnimes = Array<Anime>();
    const directoryExists = fs.existsSync(directory.path);

    if (directoryExists) {
      const directoryFolders = await fsPromises.readdir(directory.path);

      for (const folder of directoryFolders) {
        const createdAnime = await this.createFromFolderOnDirectory(
          folder,
          directory
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
    directory: Directory
  ) {
    const folderPath = path.join(directory.path, folder);
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
        directory,
        folderPath,
        searchTitle
      );
      return createdAnime;
    }
    return null;
  }

  private static async createFromFolderPathBySearchingOnAnilist(
    directory: Directory,
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

      await this.downloadImages(anilistAnime, anime.folderPath);

      const createdAnime = await AnimeRepository.createWithAllRelations({
        anime,
        directory,
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

  private static async downloadImages(
    anilistAnime: AnilistAnime,
    folderPath: string
  ) {
    const coverImagePath = path.join(folderPath, 'anime_cover.jpg');
    const bannerImagePath = path.join(folderPath, 'anime_banner.jpg');

    if (anilistAnime.coverImage.extraLarge) {
      await downloadFile(anilistAnime.coverImage.extraLarge, coverImagePath);
    }
    if (anilistAnime.bannerImage) {
      await downloadFile(anilistAnime.bannerImage, bannerImagePath);
    }
  }

  private static createInputFromAnilistAnime(
    anilistAnime: AnilistAnime,
    folderPath: string
  ) {
    let coverImagePath = null;
    let bannerImagePath = null;
    const releaseDate = createDateByDayMonthAndYear(
      anilistAnime.startDate.day,
      anilistAnime.startDate.month,
      anilistAnime.startDate.year
    );

    if (anilistAnime.bannerImage) {
      bannerImagePath = path.join(folderPath, 'anime_banner.jpg');
    }

    if (anilistAnime.coverImage.extraLarge) {
      coverImagePath = path.join(folderPath, 'anime_cover.jpg');
    }

    const anime = {
      anilistId: anilistAnime.id,
      description: anilistAnime.description,
      numberOfEpisodes: anilistAnime.episodes,
      averageScore: anilistAnime.averageScore,
      meanScore: anilistAnime.meanScore,
      popularity: anilistAnime.popularity,
      releaseDate,
      folderPath,
      bannerImagePath,
      coverImagePath,
      anilistUrl: anilistAnime.siteUrl,
    };

    const season: SeasonInput = {
      name: anilistAnime.season,
      year: anilistAnime.seasonYear,
    };

    const genres: GenreInput[] = anilistAnime.genres.map((genre) => ({
      name: genre,
    }));

    const studios: StudioInput[] = anilistAnime.studios.nodes.map((studio) => ({
      anilistId: studio.id,
      anilistUrl: studio.siteUrl,
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

  private static getTitlesFromAnilistTitle(title: AnilistAnimeTitle) {
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
