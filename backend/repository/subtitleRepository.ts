import { default as database, default as dataBase } from '@backend/database';
import { Subtitle } from '@backend/database/types';
import { v4 as uuid } from 'uuid';

class SubtitleRepository {
  list() {
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

  getById(id: string) {
    const subtitle = <Subtitle>dataBase.get('subtitles', id);
    return subtitle;
  }

  listByEpisodeId(episodeId: string) {
    const subtitles = this.list().filter(
      (subtitle) => subtitle.episodeId === episodeId
    );
    return subtitles;
  }

  create(subtitle: Subtitle) {
    const key = uuid();
    const createdSubtitle = database.insertOrUpdate('subtitles', key, subtitle);
    return <Subtitle>createdSubtitle;
  }

  deleteById(id: string) {
    database.delete('subtitles', id);
  }
}

export default SubtitleRepository;
