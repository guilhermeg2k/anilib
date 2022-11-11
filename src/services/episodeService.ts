import { Episode } from 'backend/database/types';
import axiosClient from 'library/axios';

class EpisodeService {
  static async listByAnimeId(episodeId: string) {
    const animes = await axiosClient.get<Array<Episode>>(
      `/episode/by-anime-id/${episodeId}`
    );
    return animes.data;
  }

  static async getById(id: string) {
    const anime = await axiosClient.get<Episode>(`/episode/${id}`);
    return anime.data;
  }

  static async getCoverImageBase64ById(episodeId: string) {
    const imageCover = await axiosClient.get<string>(
      `/episode/image-cover/${episodeId}`
    );
    return imageCover.data;
  }
}

export default EpisodeService;
