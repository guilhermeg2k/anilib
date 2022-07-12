import SubtitleService from '@backend/service/subtitleService';
import { NextApiRequest, NextApiResponse } from 'next';

const subtitleService = new SubtitleService();

class SubtitleController {
  listByEpisodeId(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { episodeId } = req.body;
      if (episodeId) {
        const subtitles = subtitleService.getByEpisodeId(episodeId);
        res.json(subtitles);
        return;
      }
      res.status(400).end();
    } catch (error) {
      res.status(500).end();
      console.error(error);
    }
  }
}

export default SubtitleController;
