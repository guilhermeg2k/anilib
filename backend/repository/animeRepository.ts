import database from '@backend/database/';
import { Anime } from '@backend/database/types';
import { v4 as uuid } from 'uuid';
class AnimeRepository {
  list() {
    const animesList = new Array<Anime>();
    const animes = <Map<string, Anime>>database.list('animes');
    animes.forEach((anime, id) => {
      animesList.push({
        ...anime,
        id,
      });
    });
    return animesList;
  }

  getById(id: string) {
    const anime = <Anime>database.get('animes', id);
    if (anime) {
      anime.id = id;
    }
    return anime;
  }

  listByPath(path: string) {
    const anime = this.list().find((anime) => anime.folderPath === path);
    return anime;
  }

  create(anime: Anime) {
    const key = uuid();
    const createdAnime = database.insertOrUpdate('animes', key, anime);
    return <Anime>createdAnime;
  }

  deleteById(id: string) {
    database.delete('animes', id);
  }
}

export default AnimeRepository;
