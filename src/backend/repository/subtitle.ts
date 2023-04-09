import database from 'backend/database';
import { Subtitle } from '@common/types/database';
import { v4 as uuid } from 'uuid';

class SubtitleRepository {
  static list() {
    const subtitleList = new Array<Subtitle>();
    const subtitles = <Map<string, Subtitle>>database.list('subtitles');
    subtitles.forEach((subtitle, id) => {
      subtitleList.push({
        ...subtitle,
        id,
      });
    });
    return subtitleList;
  }

  static getById(id: string) {
    const subtitle = <Subtitle>database.get('subtitles', id);
    return subtitle;
  }

  static listByEpisodeId(episodeId: string) {
    const subtitles = this.list().filter(
      (subtitle) => subtitle.episodeId === episodeId
    );
    return subtitles;
  }

  static create(subtitle: Subtitle) {
    const key = uuid();
    const createdSubtitle = database.insertOrUpdate('subtitles', key, subtitle);
    return <Subtitle>createdSubtitle;
  }

  static update(subtitle: Subtitle) {
    database.insertOrUpdate('subtitles', subtitle.id!, subtitle);
  }

  static deleteById(id: string) {
    database.delete('subtitles', id);
  }

  static deleteByEpisodeId(episodeId: string) {
    const subtitlesToDelete = this.list().filter(
      (subtitle) => subtitle.episodeId === episodeId
    );

    subtitlesToDelete.forEach((subtitle) => this.deleteById(subtitle.id!));
  }
}

export default SubtitleRepository;
