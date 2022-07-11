import Database from '@backend/database';
import { NextApiRequest, NextApiResponse } from 'next';

class SubtitleController {
  listByEpisodeId(req: NextApiRequest, res: NextApiResponse) {
    const { episodeId } = req.body;
    const subtitles = Database.getSubtitles().filter(
      (subtitle) => subtitle.episodeId === episodeId
    );
    res.json(subtitles);
  }
}

export default SubtitleController;
