import { Episode, Subtitle } from '@backend/database/types';
import SubtitleRepository from '@backend/repository/subtitleRepository';
import VideoUtils from '@backend/utils/videoUtils';

const subtitleRepository = new SubtitleRepository();
const videoUtils = new VideoUtils();
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
    const createdSubtitles = [];
    const localEpisodeSubtitles = subtitleRepository.listByEpisodeId(
      episode.id!
    );
    if (localEpisodeSubtitles.length === 0 && episode.originalFilePath) {
      const episodeSubtitles = await videoUtils.extractSubtitles(
        episode.originalFilePath
      );
      for (const subtitle of episodeSubtitles) {
        const newEpisode = <Subtitle>{
          label: subtitle.title,
          language: subtitle.language,
          filePath: subtitle.filePath,
          episodeId: episode.id,
        };
        const createdEpisode = await this.create(newEpisode);
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
