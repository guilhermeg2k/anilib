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

  listConvertedEpisodes() {
    const episodes = database.getEpisodes();
    const convertedEpisodes = episodes.filter(
      (episode) => episode.wasConverted
    );
    return convertedEpisodes;
  }

  getById(id: string) {
    const episode = database.getEpisodeById(id);
    return episode;
  }

  getByFilePath(path: string) {
    const episode = database
      .getEpisodes()
      .find((episode) => episode.filePath === path);
    return episode;
  }

  getByOriginalFilePath(path: string) {
    const episode = database
      .getEpisodes()
      .find((episode) => episode.originalFilePath === path);
    return episode;
  }

  async create(episode: Episode) {
    const createdEpisode = await database.insertEpisode(episode);
    return createdEpisode;
  }

  async deleteInvalidEpisodes() {
    await database.deleteInvalidEpisodes();
  }
}

export default EpisodeRepository;
