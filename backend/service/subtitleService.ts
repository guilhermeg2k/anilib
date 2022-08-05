import { Episode, Subtitle } from '@backend/database/types';
import SubtitleRepository from '@backend/repository/subtitleRepository';
import { getFolderVttFilesByFileNamePrefix } from '@backend/utils/fileUtils';
import { extractSubtitlesFromVideo } from '@backend/utils/videoUtils';
import fs from 'fs';
import path from 'path';

class SubtitleService {
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

  private static async createFromVideo(videoFile: string, episodeId: string) {
    const createdSubtitles = Array<Subtitle>();
    const fileExists = fs.existsSync(videoFile);
    if (fileExists) {
      const videoSubtitles = await extractSubtitlesFromVideo(videoFile);
      for (const subtitle of videoSubtitles) {
        const newSubtitle = <Subtitle>{
          label: subtitle.title,
          language: subtitle.language,
          filePath: subtitle.filePath,
          episodeId,
        };
        const createdEpisode = await this.create(newSubtitle);
        createdSubtitles.push(createdEpisode);
      }
    }
    return createdSubtitles;
  }
}

export default SubtitleService;
