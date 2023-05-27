import {
  Episode,
  Subtitle,
  SubtitleInput,
  SubtitleLanguageInput,
} from '@common/types/database';
import { getFilesInDirectoryByExtensions } from '@common/utils/file';
import { extractSubtitlesFromVideo } from '@common/utils/video';
import SubtitleRepository from 'backend/repository/subtitle';
import fs from 'fs';
import pLimit from 'p-limit';
import path from 'path';

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
        this.createFromEpisode(episode)
      )
    );
    const createdSubtitles = await Promise.all(createEpisodesPromises);
    return createdSubtitles.flat(Infinity);
  }
  //TOdo: For sure needs a refactor
  static async createFromEpisode(episode: Episode) {
    const createdSubtitles = Array<Subtitle>();

    const episodeSubtitles = await SubtitleRepository.listByEpisodeId(
      episode.id
    );
    const episodeDoesNotHaveSubtitles = episodeSubtitles.length === 0;

    if (episodeDoesNotHaveSubtitles) {
      const parsedEpisodePath = path.parse(
        episode.originalFilePath ?? episode.filePath
      );

      const subtitleFiles = await getFilesInDirectoryByExtensions({
        folder: path.join(parsedEpisodePath.dir, parsedEpisodePath.name),
        extensions: ['.vtt'],
        maxDepth: 2,
      });

      const episodeFolderHasVttFiles = subtitleFiles.length > 0;

      if (episodeFolderHasVttFiles) {
        const createdFromFiles = await this.createFromVttFiles(
          subtitleFiles,
          episode.id
        );
        createdSubtitles.push(...createdFromFiles);
      } else {
        const createdFromVideo = await this.createFromVideo(
          episode.originalFilePath ?? episode.filePath,
          episode.id
        );
        createdSubtitles.push(...createdFromVideo);
      }
    }

    return createdSubtitles;
  }

  private static async create(
    subtitle: SubtitleInput,
    language: SubtitleLanguageInput
  ) {
    return SubtitleRepository.create(subtitle, language);
  }

  private static async createFromVttFiles(
    vttFiles: Array<string>,
    episodeId: string
  ) {
    const createdSubtitles: Subtitle[] = [];

    for (const subtitleFile of vttFiles) {
      const subtitleFileName = path.basename(subtitleFile, '.vtt');
      const languageFromFileName = subtitleFileName.split('-');
      const languageStrSplit =
        languageFromFileName[languageFromFileName.length - 1].split(' ');

      const code = languageStrSplit[0].toUpperCase();
      const name = languageStrSplit[1]
        ? languageStrSplit[1].toUpperCase()
        : code;

      if (code) {
        const newSubtitle: SubtitleInput = {
          filePath: subtitleFile,
          episodeId,
        };

        const language: SubtitleLanguageInput = {
          code,
          name,
        };

        const createdEpisode = await this.create(newSubtitle, language);
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
        const newSubtitle: SubtitleInput = {
          filePath: subtitle.filePath,
          episodeId,
        };

        const language: SubtitleLanguageInput = {
          code: subtitle.code,
          name: subtitle.name,
        };

        const createdEpisode = await this.create(newSubtitle, language);
        createdSubtitles.push(createdEpisode);
      }
    }
    return createdSubtitles;
  }
}

export default SubtitleService;
