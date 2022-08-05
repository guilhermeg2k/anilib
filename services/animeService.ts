import { Anime } from '@backend/database/types';
import axiosClient from 'library/axios';

class AnimeService {
  static async list() {
    const animes = await axiosClient.get<Array<Anime>>('/anime');
    return animes.data;
  }

  static async getById(id: string) {
    const anime = await axiosClient.get<Anime>(`/anime/${id}`);
    return anime.data;
  }
}

export default AnimeService;
