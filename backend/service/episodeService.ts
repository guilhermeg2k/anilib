import { SQUARE_BRACKET_CONTENT_EXPRESSION } from '@backend/constants/regexConstants';
import { Anime, Episode } from '@backend/database/types';
import EpisodeRepository from '@backend/repository/episodeRepository';
import {
  getFileInBase64,
  getFilesInDirectoryByExtensions,
} from '@backend/utils/fileUtils';
import {
  convertMkvToMp4,
  extractImageCoverFromVideo,
} from '@backend/utils/videoUtils';
import fs from 'fs';
import path from 'path';

const fsPromises = fs.promises;

const EPISODE_FILES_EXTENSIONS = ['.mp4', '.mkv'];

class EpisodeService {
  static list() {
    const episodes = EpisodeRepository.list();
    return episodes;
  }

  static listByAnimeId(animeId: string) {
    const episodes = EpisodeRepository.listByAnimeId(animeId);
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

  static async createFromAnime(anime: Anime) {
    const createdEpisodes = Array<Episode>();
    const episodeFilePaths = await getFilesInDirectoryByExtensions(
      anime.folderPath,
      EPISODE_FILES_EXTENSIONS
    );

    for (const episodeFilePath of episodeFilePaths) {
      const episodeAlreadyExists =
        this.getByPath(episodeFilePath) ||
        this.getByOriginalPath(episodeFilePath);

      if (!episodeAlreadyExists) {
        const createdEpisode = await EpisodeService.createFromAnimeAndFilePath(
          anime,
          episodeFilePath
        );
        createdEpisodes.push(createdEpisode);
      }
    }

    return createdEpisodes;
  }

  private static async createFromAnimeAndFilePath(
    anime: Anime,
    episodeFilePath: string
  ) {
    const episodeFileExt = path.extname(episodeFilePath);
    const episodeCover = await extractImageCoverFromVideo(episodeFilePath);
    const episodeTitle = path
      .basename(episodeFilePath)
      .replace(episodeFileExt, '')
      .replaceAll(SQUARE_BRACKET_CONTENT_EXPRESSION, '');

    const newEpisode = {
      title: episodeTitle,
      animeId: anime.id!,
      coverImagePath: episodeCover,
      filePath: episodeFilePath,
      originalFilePath: episodeFilePath,
      wasConverted: false,
    };

    if (episodeFileExt === '.mkv') {
      const episodeFileMp4 = await convertMkvToMp4(episodeFilePath);
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
}

export default EpisodeService;
