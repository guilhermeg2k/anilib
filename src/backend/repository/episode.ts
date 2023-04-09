import database from 'backend/database';
import { Episode } from '@common/types/database';
import { v4 as uuid } from 'uuid';
import SubtitleRepository from './subtitle';

class EpisodeRepository {
  static list() {
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

  static listByAnimeId(animeId: string) {
    const animeEpisodes = this.list().filter(
      (episode) => episode.animeId === animeId
    );
    return animeEpisodes;
  }

  static listConvertedEpisodes() {
    const convertedEpisodes = this.list().filter(
      (episode) => episode.wasConverted
    );
    return convertedEpisodes;
  }

  static getById(id: string) {
    const episode = <Episode>database.get('episodes', id);
    if (episode) {
      episode.id = id;
    }
    return episode;
  }

  static getByFilePath(path: string) {
    const episode = this.list().find((episode) => episode.filePath === path);
    return episode;
  }

  static getByOriginalFilePath(path: string) {
    const episode = this.list().find(
      (episode) => episode.originalFilePath === path
    );
    return episode;
  }

  static create(episode: Episode) {
    const key = uuid();
    const createdEpisode = database.insertOrUpdate('episodes', key, episode);
    return <Episode>createdEpisode;
  }

  static deleteById(id: string) {
    database.delete('episodes', id);
    SubtitleRepository.deleteByEpisodeId(id);
  }

  static deleteByAnimeId(animeId: string) {
    const episodesToDelete = this.list().filter(
      (episode) => episode.animeId === animeId
    );

    episodesToDelete.forEach((episode) => this.deleteById(episode.id!));
  }
}

export default EpisodeRepository;
