import database from '@backend/database';
import { Episode } from '@backend/database/types';

class EpisodeRepository {
  list() {
    const episodes = database.getEpisodes();
    return episodes;
  }

  listByAnimeId(animeId: string) {
    const episodes = database
      .getEpisodes()
      .filter((episode) => episode.animeId === animeId);
    return episodes;
  }

  getById(id: string) {
    const episode = database.getEpisodes().find((episode) => episode.id === id);
    return episode;
  }

  getByPath(path: string) {
    const episode = database
      .getEpisodes()
      .find((episode) => episode.filePath === path);
    return episode;
  }

  async create(episode: Episode) {
    const createdEpisode = await database.insertEpisode(episode);
    return createdEpisode;
  }
}

export default EpisodeRepository;