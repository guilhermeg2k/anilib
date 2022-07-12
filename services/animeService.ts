import { Anime } from '@backend/database/types';
import axiosClient from 'library/axios';

class AnimeService {
  async list() {
    const animes = await axiosClient.get<Array<Anime>>('/anime');
    return animes.data;
  }

  async getById(id: string) {
    const anime = await axiosClient.get<Anime>(`/anime/${id}`);
    return anime.data;
  }
}

export default AnimeService;
