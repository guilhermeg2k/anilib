import database from '@backend/database/';
import { Anime } from '@backend/database/types';

class AnimeRepository {
  list() {
    const animes = database.getAnimes();
    return animes;
  }

  listById(id: string) {
    const anime = database.getAnimeById(id);
    return anime;
  }

  listByPath(path: string) {
    const anime = database
      .getAnimes()
      .find((anime) => anime.folderPath === path);
    return anime;
  }

  async create(anime: Anime) {
    const createdAnime = await database.insertAnime(anime);
    return createdAnime;
  }

  async deleteInvalidAnimes() {
    await database.deleteInvalidAnimes();
  }
}

export default AnimeRepository;
