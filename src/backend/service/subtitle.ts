import SubtitleRepository from 'backend/repository/subtitle';
import { getFolderVttFilesByFileNamePrefix } from '@common/utils/file';
import { extractSubtitlesFromVideo } from '@common/utils/video';
import fs from 'fs';
import pLimit from 'p-limit';
import path from 'path';
import { Episode, Subtitle } from '@prisma/client';

class SubtitleService {
  private static createFromEpisodePromiseLimiter = pLimit(6);

  static list() {
    return SubtitleRepository.list();
  }

  static listByEpisodeId(episodeId: string) {
    return SubtitleRepository.listByEpisodeId(episodeId);
  }

  static getById(id: string) {
    return SubtitleRepository.getById(id);
  }

  static async deleteInvalids() {
    const invalidSubtitles = (await this.list()).filter(
      (subtitle) => !fs.existsSync(subtitle.filePath)
    );

    for await (const invalidSubtitle of invalidSubtitles) {
      await SubtitleRepository.deleteById(invalidSubtitle.id);
    }
  }

  static async createFromEpisodes(episodes: Array<Episode>) {
    const createEpisodesPromises = episodes.map((episode) =>
      this.createFromEpisodePromiseLimiter(() =>
        SubtitleService.createFromEpisode(episode)
      )
    );
    const createdSubtitles = await Promise.all(createEpisodesPromises);
    return createdSubtitles.flat(Infinity);
  }

  static async createFromEpisode(episode: Episode) {
    const createdSubtitles = Array<Subtitle>();
    const episodeSubtitles = await SubtitleRepository.listByEpisodeId(
      episode.id
    );
    const episodeDoesNotHaveSubtitles = episodeSubtitles.length === 0;

    if (episodeDoesNotHaveSubtitles) {
      const parsedEpisodePath = path.parse(episode.filePath);
      const episodeFolder = parsedEpisodePath.dir;
      const episodeFileName = parsedEpisodePath.name;

      const subtitleFiles = await getFolderVttFilesByFileNamePrefix(
        episodeFolder,
        episodeFileName
      );

      const episodeHasVttFiles = subtitleFiles.length > 0;

      if (episodeHasVttFiles) {
        const createdFromFiles = await SubtitleService.createFromVttFiles(
          subtitleFiles,
          episode.id!
        );
        createdSubtitles.push(...createdFromFiles);
      } else {
        if (episode.originalFilePath) {
          const createdFromVideo = await SubtitleService.createFromVideo(
            episode.originalFilePath,
            episode.id!
          );
          createdSubtitles.push(...createdFromVideo);
        }
      }
    }

    return createdSubtitles;
  }

  private static async create(
    subtitle: Omit<Subtitle, 'id' | 'createdAt' | 'updatedAt'>
  ) {
    return SubtitleRepository.create(subtitle);
  }

  private static async createFromVttFiles(
    vttFiles: Array<string>,
    episodeId: string
  ) {
    const createdSubtitles: Subtitle[] = [];

    for (const subtitleFile of vttFiles) {
      const subtitleFileName = path.basename(subtitleFile);
      const lang = subtitleFileName.match(/.*-(.*)\.vtt/);
      if (lang && lang[1]) {
        const newSubtitle = {
          label: lang[1],
          language: lang[1],
          filePath: subtitleFile,
          episodeID: episodeId,
        };
        const createdEpisode = await this.create(newSubtitle);
        createdSubtitles.push(createdEpisode);
      }
    }

    return createdSubtitles;
  }

  private static async createFromVideo(
    videoFilePath: string,
    episodeId: string
  ) {
    const createdSubtitles: Subtitle[] = [];
    const fileExists = fs.existsSync(videoFilePath);
    if (fileExists) {
      const videoSubtitles = await extractSubtitlesFromVideo(videoFilePath);
      for (const subtitle of videoSubtitles) {
        const newSubtitle = {
          label: subtitle.title,
          language: subtitle.language,
          filePath: subtitle.filePath,
          episodeID: episodeId,
        };
        const createdEpisode = await this.create(newSubtitle);
        createdSubtitles.push(createdEpisode);
      }
    }
    return createdSubtitles;
  }
}

export default SubtitleService;
