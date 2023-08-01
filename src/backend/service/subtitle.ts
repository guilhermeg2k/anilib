import {
  Episode,
  Subtitle,
  SubtitleInput,
  SubtitleLanguageInput,
} from '@common/types/database';
import { getFilesInDirectoryByExtensions } from '@common/utils/file';
import {
  convertSubtitleToAss,
  extractSubtitlesFromVideo,
} from '@common/utils/video';
import SubtitleRepository from 'backend/repository/subtitle';
import fs from 'fs';
import pLimit from 'p-limit';
import path from 'path';

const SUBTITLE_EXTENSIONS = ['.ass', '.vtt', '.srt'];
const SUPPORTED_SUBTITLE_EXTENSIONS = ['.ass'];
const fsPromises = fs.promises;

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

  static async deleteConverted() {
    const convertedSubtitles = await SubtitleRepository.listConverted();

    const deleteConvertedEpisodesPromises = convertedSubtitles.map(
      async (episode) => {
        if (episode.originalFilePath) {
          const fileExists = fs.existsSync(episode.originalFilePath);

          if (fileExists) {
            return fsPromises.unlink(episode.originalFilePath);
          }
        }
      }
    );

    //TODO: Change this promise.all to p-promise
    await Promise.all(deleteConvertedEpisodesPromises);
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

  //Todo: Refactor
  static async createFromEpisode(episode: Episode) {
    const createdSubtitles = Array<Subtitle>();

    const episodeSubtitles = await SubtitleRepository.listByEpisodeId(
      episode.id
    );

    const doesEpisodeAlreadyHasSubtitles = episodeSubtitles.length !== 0;
    if (doesEpisodeAlreadyHasSubtitles) return createdSubtitles;

    const parsedEpisodePath = path.parse(
      episode.originalFilePath ?? episode.filePath
    );

    const subtitleFiles = await getFilesInDirectoryByExtensions({
      folder: path.join(parsedEpisodePath.dir, parsedEpisodePath.name),
      extensions: SUBTITLE_EXTENSIONS,
      maxDepth: 2,
    });

    const episodeFolderHasSubtitleFiles = subtitleFiles.length > 0;

    if (episodeFolderHasSubtitleFiles) {
      const createdFromFiles = await this.createFromSubtitleFiles(
        subtitleFiles,
        episode
      );
      createdSubtitles.push(...createdFromFiles);
    } else {
      const createdFromVideo = await this.createFromVideo(
        episode.originalFilePath ?? episode.filePath,
        episode.id
      );
      createdSubtitles.push(...createdFromVideo);
    }

    return createdSubtitles;
  }

  private static async create(
    subtitle: SubtitleInput,
    language: SubtitleLanguageInput
  ) {
    return SubtitleRepository.create(subtitle, language);
  }

  //Todo: Refactor
  private static async createFromSubtitleFiles(
    subtitleFiles: Array<string>,
    episode: Episode
  ) {
    const createdSubtitles: Subtitle[] = [];

    for (const subtitleFile of subtitleFiles) {
      const subtitleFileExtension = path.extname(subtitleFile);
      const subtitleFileName = path.basename(
        subtitleFile,
        subtitleFileExtension
      );
      let wasConverted = false;
      let subtitleFilePath = subtitleFile;

      if (!SUPPORTED_SUBTITLE_EXTENSIONS.includes(subtitleFileExtension)) {
        subtitleFilePath = await convertSubtitleToAss(
          subtitleFile,
          episode.originalFilePath ?? episode.filePath
        );
        wasConverted = true;
      }

      const languageFromFileName = subtitleFileName.split('-');
      const languageStrSplit =
        languageFromFileName[languageFromFileName.length - 1].split(' ');

      const code = languageStrSplit[0].toUpperCase();
      const name = languageStrSplit[1]
        ? languageStrSplit[1].toUpperCase()
        : code;

      if (code) {
        const newSubtitle: SubtitleInput = {
          filePath: subtitleFilePath,
          originalFilePath: wasConverted ? subtitleFile : null,
          episodeId: episode.id,
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
          originalFilePath: null,
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
