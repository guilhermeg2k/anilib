import { getNumbersSumFromString } from 'common/utils/string-utils';
import {
  BRACES_CONTENT_REGEX,
  NOT_ALPHANUMERIC_REGEX,
  PARENTHESES_CONTENT_REGEX,
  SQUARE_BRACKET_CONTENT_REGEX,
} from '@common/constants/regex-constants';
import { Anime, Episode } from 'backend/database/types';
import EpisodeRepository from 'backend/repository/episode-repository';
import {
  getFileInBase64,
  getFilesInDirectoryByExtensions,
} from '@common/utils/file-utils';
import {
  convertVideoToMp4,
  extractJpgImageFromVideo,
  isAudioCodecSupported,
  isVideoCodecSupported,
  isVideoContainerSupported,
} from '@common/utils/video-utils';
import fs from 'fs';
import pLimit from 'p-limit';
import path from 'path';
import SettingsService from './settings-service';

const fsPromises = fs.promises;

const EPISODE_FILES_EXTENSIONS = ['.mp4', '.mkv'];
const EPISODE_IMAGE_COVER_SECOND = 5;

class EpisodeService {
  private static createFromAnimeAndFilePathPromiseLimiter = pLimit(3);

  static list() {
    const episodes = EpisodeRepository.list();
    return episodes;
  }

  static listByAnimeId(animeId: string) {
    const episodes = EpisodeRepository.listByAnimeId(animeId);
    episodes.sort(this.sortByStringNumbersSum);
    return episodes;
  }

  static getById(id: string) {
    const episode = EpisodeRepository.getById(id);
    return episode;
  }

  static getByPath(path: string) {
    const episode = EpisodeRepository.getByFilePath(path);
    return episode;
  }

  static getByOriginalPath(path: string) {
    const episode = EpisodeRepository.getByOriginalFilePath(path);
    return episode;
  }

  static async getImageCoverBase64ById(episodeId: string) {
    const episode = EpisodeRepository.getById(episodeId);
    if (episode?.coverImagePath) {
      const imageBase64 = await getFileInBase64(episode?.coverImagePath);
      return imageBase64;
    }
    return null;
  }

  static async deleteConverted() {
    const convertedEpisodes = EpisodeRepository.listConvertedEpisodes();
    const deleteConvertedEpisodesPromises = convertedEpisodes.map(
      async (episode) => {
        const fileExists = fs.existsSync(episode.originalFilePath);
        if (fileExists) {
          return fsPromises.unlink(episode.originalFilePath);
        }
      }
    );
    await Promise.all(deleteConvertedEpisodesPromises);
  }

  static deleteInvalids() {
    const invalidEpisodes = this.list().filter(
      (episode) => !fs.existsSync(episode.filePath)
    );

    invalidEpisodes.forEach((invalidEpisode) =>
      EpisodeRepository.deleteById(invalidEpisode.id!)
    );
  }

  static async createFromAnimes(animes: Array<Anime>) {
    const createEpisodesPromises = animes.map(async (anime) => {
      await this.createFromAnime(anime);
    });

    const createdEpisodes = await Promise.all(createEpisodesPromises);
    return createdEpisodes.flat(Infinity);
  }

  static async createFromAnime(anime: Anime) {
    const episodeFilePaths = await getFilesInDirectoryByExtensions(
      anime.folderPath,
      EPISODE_FILES_EXTENSIONS
    );
    const episodePromises = episodeFilePaths.map((episodeFilePath) => {
      const episodeDoesNotExists =
        !this.getByPath(episodeFilePath) &&
        !this.getByOriginalPath(episodeFilePath);
      if (episodeDoesNotExists) {
        return this.createFromAnimeAndFilePathPromiseLimiter(() =>
          this.createFromAnimeAndFilePath(anime, episodeFilePath)
        );
      }
    });

    const createdEpisodes = await Promise.all(episodePromises);
    return createdEpisodes.flat(Infinity);
  }

  private static async createFromAnimeAndFilePath(
    anime: Anime,
    episodeFilePath: string
  ) {
    const episodeFileExt = path.extname(episodeFilePath);
    const episodeFileName = path.basename(episodeFilePath, episodeFileExt);
    const episodeTitle = this.buildEpisodeTitle(episodeFileName);

    const episodeCoverImagePath = await extractJpgImageFromVideo({
      videoFilePath: episodeFilePath,
      secondToExtract: EPISODE_IMAGE_COVER_SECOND,
      outputFileName: episodeFileName,
      scaleWidth: 1920,
    });

    const newEpisode = {
      title: episodeTitle,
      animeId: anime.id!,
      coverImagePath: episodeCoverImagePath,
      filePath: episodeFilePath,
      originalFilePath: episodeFilePath,
      wasConverted: false,
    };

    const isVideoCodecNotSupported = !(await isVideoCodecSupported(
      episodeFilePath
    ));

    const isAudioCodecNotSupported = !(await isAudioCodecSupported(
      episodeFilePath
    ));

    const isVideoContainerNotSupported =
      !isVideoContainerSupported(episodeFilePath);

    const needsToConvertEpisodeVideo =
      isVideoCodecNotSupported ||
      isVideoContainerNotSupported ||
      isAudioCodecNotSupported;

    if (needsToConvertEpisodeVideo) {
      const shouldUseNVENC = SettingsService.get('shouldUseNVENC');
      const episodeFileMp4 = await convertVideoToMp4(
        episodeFilePath,
        shouldUseNVENC
      );
      newEpisode.wasConverted = true;
      newEpisode.filePath = episodeFileMp4;
    }

    const createdEpisode = this.create(newEpisode);
    return createdEpisode;
  }

  private static create(episode: Episode) {
    const createdEpisode = EpisodeRepository.create(episode);
    return createdEpisode;
  }

  private static buildEpisodeTitle = (episodeFileName: string) => {
    const episodeTitle = episodeFileName
      .replaceAll(SQUARE_BRACKET_CONTENT_REGEX, '')
      .replaceAll(PARENTHESES_CONTENT_REGEX, '')
      .replaceAll(BRACES_CONTENT_REGEX, '')
      .replaceAll(NOT_ALPHANUMERIC_REGEX, ' ')
      .trim();
    return episodeTitle;
  };

  private static sortByStringNumbersSum = (
    episodeA: Episode,
    episodeB: Episode
  ) => {
    const episodeANumbersSum = getNumbersSumFromString(episodeA.title);
    const episodeBNumbersSum = getNumbersSumFromString(episodeB.title);
    return episodeANumbersSum > episodeBNumbersSum ? 1 : -1;
  };
}

export default EpisodeService;