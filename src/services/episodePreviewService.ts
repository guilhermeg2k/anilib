import { EpisodePreview } from 'backend/database/types';
import axiosClient from 'library/axios';

class EpisodePreviewService {
  static async listByEpisodeId(episodeId: string) {
    const animes = await axiosClient.get<Array<EpisodePreview>>(
      `/episode-preview/by-episode-id/${episodeId}`
    );
    return animes.data;
  }
}

export default EpisodePreviewService;
