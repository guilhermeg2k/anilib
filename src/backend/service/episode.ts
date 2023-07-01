import {
  BRACES_CONTENT_REGEX,
  PARENTHESES_CONTENT_REGEX,
  SQUARE_BRACKET_CONTENT_REGEX,
} from '@common/constants/regex';
import { Anime, EpisodeInput } from '@common/types/database';
import { getFilesInDirectoryByExtensions } from '@common/utils/file';
import {
  convertVideoToMp4,
  extractJpgImageFromVideo,
  isAudioCodecSupported,
  isVideoCodecSupported,
  isVideoContainerSupported,
} from '@common/utils/video';
import EpisodeRepository from 'backend/repository/episode';
import fs from 'fs';
import pLimit from 'p-limit';
import path from 'path';
import SettingsService from './settings';

const fsPromises = fs.promises;

const EPISODE_FILES_EXTENSIONS = ['.mp4', '.mkv'];
const REENCODED_FILE_MARK = '[reencoded]';
const EPISODE_IMAGE_COVER_SECOND = 5;

class EpisodeService {
  private static createFromAnimeAndFilePathPromiseLimiter = pLimit(2);

  static list() {
    return EpisodeRepository.list();
  }

  static async listByAnimeId(animeId: string) {
    return EpisodeRepository.listByAnimeId(animeId);
  }

  static async getById(id: string) {
    return EpisodeRepository.getById(id);
  }

  static async getByIdWithSubtitles(id: string) {
    return EpisodeRepository.getByIdWithSubtitles(id);
  }

  static getByPath(path: string) {
    return EpisodeRepository.getByFilePath(path);
  }

  static getByOriginalPath(path: string) {
    return EpisodeRepository.getByOriginalFilePath(path);
  }

  static async deleteConverted() {
    const convertedEpisodes = await EpisodeRepository.listConverted();

    const deleteConvertedEpisodesPromises = convertedEpisodes.map(
      async (episode) => {
        if (episode.originalFilePath) {
          const fileExists = fs.existsSync(episode.originalFilePath);

          if (fileExists) {
            return fsPromises.unlink(episode.originalFilePath);
          }
        }
      }
    );

    await Promise.all(deleteConvertedEpisodesPromises);
  }

  static async deleteInvalids() {
    const invalidEpisodes = (await this.list()).filter(
      (episode) => !fs.existsSync(episode.filePath)
    );

    for await (const invalidEpisode of invalidEpisodes) {
      await EpisodeRepository.deleteById(invalidEpisode.id);
    }
  }

  static async createFromAnimes(animes: Array<Anime>) {
    const createEpisodesPromises = animes.map(async (anime) => {
      await this.createFromAnime(anime);
    });

    const createdEpisodes = await Promise.all(createEpisodesPromises);
    return createdEpisodes.flat(Infinity);
  }

  private static async createFromAnime(anime: Anime) {
    const episodeFilePaths = await getFilesInDirectoryByExtensions({
      folder: anime.folderPath,
      extensions: EPISODE_FILES_EXTENSIONS,
    });

    //TODO: Refactor
    const episodePromises = episodeFilePaths.map(async (episodeFilePath) => {
      const fileExt = path.extname(episodeFilePath);

      if (fileExt === '.mp4') {
        const episodeFileIsConverted =
          episodeFilePath.includes(REENCODED_FILE_MARK) &&
          (fs.existsSync(
            episodeFilePath.replace(`${REENCODED_FILE_MARK}.mp4`, '.mkv')
          ) ||
            fs.existsSync(
              episodeFilePath.replace(`${REENCODED_FILE_MARK}.mp4`, '.mp4')
            ));

        if (episodeFileIsConverted) {
          return;
        }
      }

      const episodeDoesNotExists =
        !(await this.getByPath(episodeFilePath)) &&
        !(await this.getByOriginalPath(episodeFilePath));

      if (!episodeDoesNotExists) {
        return;
      }

      return this.createFromAnimeAndFilePathPromiseLimiter(() =>
        this.createFromAnimeAndFilePath(anime, episodeFilePath)
      );
    });

    const createdEpisodes = await Promise.all(episodePromises);
    return createdEpisodes.flat(Infinity);
  }

  private static async createFromAnimeAndFilePath(
    anime: Anime,
    episodeFilePath: string
  ) {
    const episodeFileName = path.basename(
      episodeFilePath,
      path.extname(episodeFilePath)
    );
    const episodeTitle = this.buildEpisodeTitle(episodeFileName);
    const episodeCoverImagePath = await extractJpgImageFromVideo({
      videoFilePath: episodeFilePath,
      secondToExtract: EPISODE_IMAGE_COVER_SECOND,
      outputFileName: 'episode_cover',
      scaleWidth: 1920,
    });

    const newEpisode: EpisodeInput = {
      title: episodeTitle,
      animeId: anime.id,
      coverImagePath: episodeCoverImagePath,
      filePath: episodeFilePath,
      originalFilePath: null,
    };

    if (await this.episodeNeedsToBeConverted(episodeFilePath)) {
      const shouldUseNVENC = await SettingsService.getByNameOrThrow(
        'USE_NVENC'
      );

      const outputFileName = `${path.basename(
        episodeFilePath,
        path.extname(episodeFilePath)
      )}${REENCODED_FILE_MARK}`;

      const episodeFileMp4 = await convertVideoToMp4({
        videoFilePath: episodeFilePath,
        outputDir: anime.folderPath,
        outputFileName,
        shouldUseNVENC: shouldUseNVENC.value,
      });

      newEpisode.originalFilePath = episodeFilePath;
      newEpisode.filePath = episodeFileMp4;
    }

    return this.create(newEpisode);
  }

  private static create(episode: EpisodeInput) {
    return EpisodeRepository.create(episode);
  }

  private static buildEpisodeTitle = (episodeFileName: string) => {
    const NOT_ALLOWED_CHARACTERS_REGEX = /[^A-Za-zÀ-ÿ0-9%&]/gi; //Non Alphanumeric character except for % and &

    const episodeTitle = episodeFileName
      .replaceAll(SQUARE_BRACKET_CONTENT_REGEX, '')
      .replaceAll(PARENTHESES_CONTENT_REGEX, '')
      .replaceAll(BRACES_CONTENT_REGEX, '')
      .replaceAll(NOT_ALLOWED_CHARACTERS_REGEX, ' ')
      .trim();

    return episodeTitle;
  };

  private static async episodeNeedsToBeConverted(episodeFilePath: string) {
    const isVideoCodecNotSupported = !(await isVideoCodecSupported(
      episodeFilePath
    ));

    const isAudioCodecNotSupported = !(await isAudioCodecSupported(
      episodeFilePath
    ));

    const isVideoContainerNotSupported =
      !isVideoContainerSupported(episodeFilePath);

    return (
      isVideoCodecNotSupported ||
      isVideoContainerNotSupported ||
      isAudioCodecNotSupported
    );
  }
}

export default EpisodeService;
