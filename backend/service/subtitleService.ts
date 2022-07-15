import { Episode, Subtitle } from '@backend/database/types';
import SubtitleRepository from '@backend/repository/subtitleRepository';
import FileUtils from '@backend/utils/fileUtils';
import VideoUtils from '@backend/utils/videoUtils';
import path from 'path';
import fs from 'fs';

const subtitleRepository = new SubtitleRepository();
const videoUtils = new VideoUtils();
const fileUtils = new FileUtils();

class SubtitleService {
  listByEpisodeId(episodeId: string) {
    const subtitles = subtitleRepository.listByEpisodeId(episodeId);
    return subtitles;
  }

  getById(id: string) {
    const episode = subtitleRepository.getById(id);
    return episode;
  }

  private async create(subtitle: Subtitle) {
    const createdSubtitle = await subtitleRepository.create(subtitle);
    return createdSubtitle;
  }

  async createFromEpisode(episode: Episode) {
    const createdSubtitles = Array<Subtitle>();
    const episodeSubtitles = subtitleRepository.listByEpisodeId(episode.id!);

    if (episodeSubtitles.length === 0) {
      const parsedEpisodeFolder = path.parse(episode.filePath);
      const episodeFolder = parsedEpisodeFolder.dir;
      const episodeFileName = parsedEpisodeFolder.name;

      const subtitleFiles = await fileUtils.getVttFilesBySearch(
        episodeFolder,
        episodeFileName
      );

      if (subtitleFiles.length > 0) {
        const createdFromFiles = await this.createFromFiles(
          subtitleFiles,
          episode.id!
        );
        createdSubtitles.push(...createdFromFiles);
      } else {
        if (episode.originalFilePath) {
          const createdFromVideo = await this.createFromVideo(
            episode.originalFilePath,
            episode.id!
          );
          createdSubtitles.push(...createdFromVideo);
        }
      }
    }

    return createdSubtitles;
  }

  private async createFromFiles(files: Array<string>, episodeId: string) {
    const createdSubtitles = Array<Subtitle>();
    for (const subtitleFile of files) {
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

  private async createFromVideo(videoFile: string, episodeId: string) {
    const createdSubtitles = Array<Subtitle>();
    const fileExists = fs.existsSync(videoFile);
    if (fileExists) {
      const videoSubtitles = await videoUtils.extractSubtitles(videoFile);
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

  async deleteInvalidSubtitles() {
    await subtitleRepository.deleteInvalidSubtitles();
  }
}

export default SubtitleService;
