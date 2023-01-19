import axiosClient from 'library/axios';

class EpisodePreviewService {
  static async listByEpisodeId(episodeId: string) {
    const previews = await axiosClient.get<Array<string>>(
      `/episode-preview/by-episode-id/${episodeId}`
    );
    return previews.data;
  }
}

export default EpisodePreviewService;
