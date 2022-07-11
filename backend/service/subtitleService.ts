import { Episode, Subtitle } from '@backend/database/types';
import SubtitleRepository from '@backend/repository/subtitleRepository';
import VideoUtils from '@backend/utils/videoUtils';

const subtitleRepository = new SubtitleRepository();
const videoUtils = new VideoUtils();
class SubtitleService {
  getByEpisodeId(episodeId: string) {
    const subtitles = subtitleRepository.listByEpisodeId(episodeId);
    return subtitles;
  }

  async createFromEpisode(episode: Episode) {
    const createdSubtitles = [];
    const localEpisodeSubtitles = subtitleRepository.listByEpisodeId(
      episode.id!
    );
    if (localEpisodeSubtitles.length === 0) {
      const episodeSubtitles = await videoUtils.extractSubtitles(
        episode.filePath
      );
      for (const subtitle of episodeSubtitles) {
        const newEpisode = <Subtitle>{
          label: subtitle.title,
          language: subtitle.language,
          filePath: subtitle.filePath,
          episodeId: episode.id,
        };
        const createdEpisode = await subtitleRepository.create(newEpisode);
        createdSubtitles.push(createdEpisode);
      }
    }
    return createdSubtitles;
  }
}

export default SubtitleService;
