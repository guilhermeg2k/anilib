import { Anime, Episode } from '@backend/database/types';
import EpisodeRepository from '@backend/repository/episodeRepository';
import { convertMkvToMp4, extractVideoImageCover } from '@backend/utils/ffmpeg';
import fileSystem from 'fs';
import path from 'path';
import SubtitleService from './subtitleService';

const episodeRepository = new EpisodeRepository();
const subtitleService = new SubtitleService();
const fs = fileSystem.promises;

class EpisodeService {
  getById(id: string) {
    const episode = episodeRepository.getById(id);
    return episode;
  }

  getByPath(path: string) {
    const episode = episodeRepository.getByPath(path);
    return episode;
  }

  listByAnimeId(animeId: string) {
    const episodes = episodeRepository.listByAnimeId(animeId);
    return episodes;
  }

  async createFromAnimeAndFilePath(anime: Anime, episodeFilePath: string) {
    const episodeFileExt = path.extname(episodeFilePath);
    const episodeCover = await extractVideoImageCover(episodeFilePath);
    const episode = {
      animeId: anime.id,
      filePath: episodeFilePath,
      coverUrl: episodeCover,
    } as Episode;

    if (episodeFileExt === '.mkv') {
      const episodeFileMp4 = await convertMkvToMp4(episodeFilePath);
      episode.filePath = episodeFileMp4;
    }

    const insertedEpisode = await episodeRepository.create(episode);
    const createdEpisode = await subtitleService.createFromEpisode(
      insertedEpisode
    );
    return createdEpisode;
  }

  async createFromAnimeAndFilePaths(
    anime: Anime,
    episodeFilesPaths: Array<string>
  ) {
    const createdEpisodesPromises = episodeFilesPaths.map(
      async (episodeFilePath) => {
        const episode = this.getByPath(episodeFilePath);
        if (!episode) {
          return this.createFromAnimeAndFilePath(anime, episodeFilePath);
        }
      }
    );
    const createdEpisodes = await Promise.all(createdEpisodesPromises);
    return createdEpisodes;
  }
}

export default EpisodeService;
