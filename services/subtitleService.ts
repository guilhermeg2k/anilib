import { Subtitle } from '@backend/database/types';
import axiosClient from 'library/axios';

class SubtitleService {
  static async listByEpisodeId(episodeId: string) {
    const subtitles = await axiosClient.get<Array<Subtitle>>(
      `/subtitle/by-episode-id/${episodeId}`
    );
    return subtitles.data;
  }
}

export default SubtitleService;
