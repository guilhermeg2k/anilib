import { Anime, Episode } from '@backend/database/types';
import EpisodeRepository from '@backend/repository/episodeRepository';
import FileUtils from '@backend/utils/fileUtils';
import VideoUtils from '@backend/utils/videoUtils';
import path from 'path';

const episodeRepository = new EpisodeRepository();
const videoUtils = new VideoUtils();
const fileUtils = new FileUtils();
const EPISODE_FILES_EXTENSIONS = ['.mp4', '.mkv'];
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

  async createFromAnime(anime: Anime) {
    const createdEpisodes = Array<Episode>();
    const episodeFilePaths = await fileUtils.listFilesInFolderByExtensions(
      anime.folderPath,
      EPISODE_FILES_EXTENSIONS
    );

    for (const episodeFilePath of episodeFilePaths) {
      const episodeAlreadyExists = Boolean(this.getByPath(episodeFilePath));
      if (!episodeAlreadyExists) {
        const createdEpisode = await this.createFromAnimeAndFilePath(
          anime,
          episodeFilePath
        );
        createdEpisodes.push(createdEpisode);
      }
    }

    return createdEpisodes;
  }

  private async createFromAnimeAndFilePath(
    anime: Anime,
    episodeFilePath: string
  ) {
    const episodeFileExt = path.extname(episodeFilePath);
    const episodeCover = await videoUtils.extractImageCover(episodeFilePath);

    const newEpisode = {
      animeId: anime.id,
      filePath: episodeFilePath,
      coverUrl: episodeCover,
    } as Episode;

    if (episodeFileExt === '.mkv') {
      const episodeFileMp4 = await videoUtils.convertMkvToMp4(episodeFilePath);
      newEpisode.filePath = episodeFileMp4;
    }

    const insertedEpisode = await episodeRepository.create(newEpisode);
    return insertedEpisode;
  }
}

export default EpisodeService;
