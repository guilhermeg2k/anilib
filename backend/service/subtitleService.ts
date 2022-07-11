import { Episode, Subtitle } from '@backend/database/types';
import SubtitleRepository from '@backend/repository/subtitleRepository';
import { extractVideoSubtitles } from '@backend/utils/ffmpeg';

const subtitleRepository = new SubtitleRepository();

class SubtitleService {
  getByEpisodeId(episodeId: string) {
    const subtitles = subtitleRepository.listByEpisodeId(episodeId);
    return subtitles;
  }

  async createFromEpisode(episode: Episode) {
    const createdEpisodes = [];
    const localEpisodeSubtitles = subtitleRepository.listByEpisodeId(
      episode.id!
    );
    if (localEpisodeSubtitles.length === 0) {
      const episodeSubtitles = await extractVideoSubtitles(episode.filePath);
      for (const subtitle of episodeSubtitles) {
        const newEpisode = <Subtitle>{
          label: subtitle.title,
          language: subtitle.language,
          filePath: subtitle.filePath,
          episodeId: episode.id,
        };
        const createdEpisode = await subtitleRepository.create(newEpisode);
        createdEpisodes.push(createdEpisode);
      }
    }
    return createdEpisodes;
  }
}

export default SubtitleService;
