import database from '@backend/database/';
import { Anime } from '@backend/database/types';
import { isPathRelativeToDir } from '@backend/utils/fileUtils';
import { v4 as uuid } from 'uuid';
import EpisodeRepository from './episodeRepository';

class AnimeRepository {
  static list() {
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

  static getById(id: string) {
    const anime = <Anime>database.get('animes', id);
    if (anime) {
      anime.id = id;
    }
    return anime;
  }

  static listByPath(path: string) {
    const anime = this.list().find((anime) => anime.folderPath === path);
    return anime;
  }

  static create(anime: Anime) {
    const key = uuid();
    const createdAnime = database.insertOrUpdate('animes', key, anime);
    return <Anime>createdAnime;
  }

  static update(anime: Anime) {
    database.insertOrUpdate('animes', anime.id!, anime);
  }

  static deleteById(id: string) {
    database.delete('animes', id);
    EpisodeRepository.deleteByAnimeId(id);
  }

  static deleteByDirectory(directory: string) {
    const animesToDelete = this.list().filter((anime) =>
      isPathRelativeToDir(directory, anime.folderPath)
    );
    animesToDelete.forEach((anime) => this.deleteById(anime.id!));
  }
}

export default AnimeRepository;
