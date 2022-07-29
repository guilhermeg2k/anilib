import database from '@backend/database';
import { Episode } from '@backend/database/types';
import { v4 as uuid } from 'uuid';
import SubtitleRepository from './subtitleRepository';

const subtitleRepository = new SubtitleRepository();
class EpisodeRepository {
  list() {
    const episodesList = new Array<Episode>();
    const episodes = <Map<string, Episode>>database.list('episodes');
    episodes.forEach((episode, id) => {
      episodesList.push({
        ...episode,
        id,
      });
    });
    return episodesList;
  }

  listByAnimeId(animeId: string) {
    const animeEpisodes = this.list().filter(
      (episode) => episode.animeId === animeId
    );
    return animeEpisodes;
  }

  listConvertedEpisodes() {
    const convertedEpisodes = this.list().filter(
      (episode) => episode.wasConverted
    );
    return convertedEpisodes;
  }

  getById(id: string) {
    const episode = <Episode>database.get('episodes', id);
    if (episode) {
      episode.id = id;
    }
    return episode;
  }

  getByFilePath(path: string) {
    const episode = this.list().find((episode) => episode.filePath === path);
    return episode;
  }

  getByOriginalFilePath(path: string) {
    const episode = this.list().find(
      (episode) => episode.originalFilePath === path
    );
    return episode;
  }

  create(episode: Episode) {
    const key = uuid();
    const createdEpisode = database.insertOrUpdate('episodes', key, episode);
    return <Episode>createdEpisode;
  }

  deleteById(id: string) {
    database.delete('episodes', id);
    subtitleRepository.deleteByEpisodeId(id);
  }

  deleteByAnimeId(animeId: string) {
    const episodesToDelete = this.list().filter(
      (episode) => episode.animeId === animeId
    );

    episodesToDelete.forEach((episode) => this.deleteById(episode.id!));
  }
}

export default EpisodeRepository;
