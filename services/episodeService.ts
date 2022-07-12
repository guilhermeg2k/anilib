import { Episode } from '@backend/database/types';
import axiosClient from 'library/axios';

class EpisodeService {
  async listByAnimeId(episodeId: string) {
    const animes = await axiosClient.get<Array<Episode>>(
      `/episode/by-anime-id/${episodeId}`
    );
    return animes.data;
  }

  async getById(id: string) {
    const anime = await axiosClient.get<Episode>(`/episode/${id}`);
    return anime.data;
  }
}

export default EpisodeService;
