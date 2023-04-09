import { Episode, Subtitle } from 'backend/database/types';
import SubtitleRepository from 'backend/repository/subtitle-repository';
import { getFolderVttFilesByFileNamePrefix } from '@common/utils/file-utils';
import { extractSubtitlesFromVideo } from '@common/utils/video-utils';
import fs from 'fs';
import pLimit from 'p-limit';
import path from 'path';

class SubtitleService {
  private static createFromEpisodePromiseLimiter = pLimit(6);
  private static removeCommentsFromEpisodePromiseLimiter = pLimit(6);

  static list() {
    const subtitles = SubtitleRepository.list();
    return subtitles;
  }

  static listByEpisodeId(episodeId: string) {
    const subtitles = SubtitleRepository.listByEpisodeId(episodeId);
    return subtitles;
  }

  static getById(id: string) {
    const episode = SubtitleRepository.getById(id);
    return episode;
  }

  static deleteInvalids() {
    const invalidSubtitles = this.list().filter(
      (subtitle) => !fs.existsSync(subtitle.filePath)
    );

    invalidSubtitles.forEach((invalidSubtitle) =>
      SubtitleRepository.deleteById(invalidSubtitle.id!)
    );
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
    const episodeSubtitles = SubtitleRepository.listByEpisodeId(episode.id!);
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

  private static async create(subtitle: Subtitle) {
    const createdSubtitle = await SubtitleRepository.create(subtitle);
    return createdSubtitle;
  }

  private static async createFromVttFiles(
    vttFiles: Array<string>,
    episodeId: string
  ) {
    const createdSubtitles = Array<Subtitle>();

    for (const subtitleFile of vttFiles) {
      const subtitleFileName = path.basename(subtitleFile);
      const lang = subtitleFileName.match(/.*-(.*)\.vtt/);
      if (lang && lang[1]) {
        const newSubtitle = <Subtitle>{
          label: lang[1],
          language: lang[1],
          filePath: subtitleFile,
          episodeId,
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
    const createdSubtitles = Array<Subtitle>();
    const fileExists = fs.existsSync(videoFilePath);
    if (fileExists) {
      const videoSubtitles = await extractSubtitlesFromVideo(videoFilePath);
      for (const subtitle of videoSubtitles) {
        const newSubtitle = <Subtitle>{
          label: subtitle.title,
          language: subtitle.language,
          filePath: subtitle.filePath,
          wasCommentsRemoved: false,
          episodeId,
        };
        const createdEpisode = await this.create(newSubtitle);
        createdSubtitles.push(createdEpisode);
      }
    }
    return createdSubtitles;
  }

  static update(subtitle: Subtitle) {
    SubtitleRepository.update(subtitle);
  }
}

export default SubtitleService;
