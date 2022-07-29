import database from '@backend/database/';
import { Anime } from '@backend/database/types';
import FileUtils from '@backend/utils/fileUtils';
import { v4 as uuid } from 'uuid';
import EpisodeRepository from './episodeRepository';

const fileUtils = new FileUtils();
const episodeRepository = new EpisodeRepository();
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
    episodeRepository.deleteByAnimeId(id);
  }

  deleteByDirectory(directory: string) {
    const animesToDelete = this.list().filter((anime) =>
      fileUtils.isPathRelativeToDir(directory, anime.folderPath)
    );
    animesToDelete.forEach((anime) => this.deleteById(anime.id!));
  }
}

export default AnimeRepository;
