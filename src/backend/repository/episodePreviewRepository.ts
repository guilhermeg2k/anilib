import database from 'backend/database';
import { EpisodePreview } from 'backend/database/types';
import { v4 as uuid } from 'uuid';

const EPISODE_PREVIEW_DB_PROPERTY = 'episodePreviews';

class EpisodePreviewRepository {
  static list() {
    const previewList = new Array<EpisodePreview>();
    const previews = database.list(EPISODE_PREVIEW_DB_PROPERTY) as Map<
      string,
      EpisodePreview
    >;

    previews.forEach((preview, id) => {
      previewList.push({
        ...preview,
        id,
      });
    });
    return previewList;
  }

  static listByEpisodeId(episodeId: string) {
    const previews = this.list().filter(
      (preview) => preview.episodeId === episodeId
    );
    return previews;
  }

  static create(episodePreview: EpisodePreview) {
    const key = uuid();
    const createdPreview = database.insertOrUpdate(
      EPISODE_PREVIEW_DB_PROPERTY,
      key,
      episodePreview
    );
    return <EpisodePreview>createdPreview;
  }

  static deleteById(id: string) {
    database.delete(EPISODE_PREVIEW_DB_PROPERTY, id);
  }

  static deleteByEpisodeId(episodeId: string) {
    const previewsToDelete = this.list().filter(
      (preview) => preview.episodeId === episodeId
    );

    previewsToDelete.forEach((preview) => this.deleteById(preview.id!));
  }
}

export default EpisodePreviewRepository;
