import database from '@backend/database';
import dataBase from '@backend/database';
import { Subtitle } from '@backend/database/types';

class SubtitleRepository {
  getById(id: string) {
    const subtitle = dataBase.getSubtitleById(id);
    return subtitle;
  }

  listByEpisodeId(episodeId: string) {
    const subtitles = dataBase
      .getSubtitles()
      .filter((subtitle) => subtitle.episodeId === episodeId);
    return subtitles;
  }

  async create(subtitle: Subtitle) {
    const createdSubtitle = await database.insertSubtitle(subtitle);
    return createdSubtitle;
  }

  async deleteInvalidSubtitles() {
    await database.deleteInvalidSubtitles();
  }
}

export default SubtitleRepository;
