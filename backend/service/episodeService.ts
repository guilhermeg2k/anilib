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
  list() {
    const episodes = episodeRepository.list();
    return episodes;
  }

  listByAnimeId(animeId: string) {
    const episodes = episodeRepository.listByAnimeId(animeId);
    return episodes;
  }

  getById(id: string) {
    const episode = episodeRepository.getById(id);
    return episode;
  }

  getByPath(path: string) {
    const episode = episodeRepository.getByFilePath(path);
    return episode;
  }

  getByOriginalPath(path: string) {
    const episode = episodeRepository.getByOriginalFilePath(path);
    return episode;
  }

  private async create(episode: Episode) {
    const createdEpisode = await episodeRepository.create(episode);
    return createdEpisode;
  }

  async createFromAnime(anime: Anime) {
    const createdEpisodes = Array<Episode>();
    const episodeFilePaths = await fileUtils.listFilesInFolderByExtensions(
      anime.folderPath,
      EPISODE_FILES_EXTENSIONS
    );

    for (const episodeFilePath of episodeFilePaths) {
      const episodeAlreadyExists =
        this.getByPath(episodeFilePath) ||
        this.getByOriginalPath(episodeFilePath);
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
    const episodeTitle = path
      .basename(episodeFilePath)
      .replace(episodeFileExt, '');

    const newEpisode = {
      title: episodeTitle,
      animeId: anime.id!,
      coverUrl: episodeCover,
      filePath: episodeFilePath,
      originalFilePath: episodeFilePath,
    };

    if (episodeFileExt === '.mkv') {
      const episodeFileMp4 = await videoUtils.convertMkvToMp4(episodeFilePath);
      newEpisode.filePath = episodeFileMp4;
    }

    const createdEpisode = await this.create(newEpisode);
    return createdEpisode;
  }
}

export default EpisodeService;
