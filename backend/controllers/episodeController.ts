import EpisodeService from '@backend/service/episodeService';
import { NextApiRequest, NextApiResponse } from 'next';

const episodeService = new EpisodeService();

class EpisodeController {
  getById(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query;
      if (id) {
        const episode = episodeService.getById(String(id));
        res.json(episode);
        return;
      }
      res.status(400).end();
    } catch (error) {
      console.error(error);
      res.status(500).end();
    }
  }

  listByAnimeId(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { animeId } = req.query;
      if (animeId && typeof animeId === 'string') {
        const episodes = episodeService.listByAnimeId(animeId);
        res.json(episodes);
        return;
      }
      res.status(400).end();
    } catch (error) {
      console.error(error);
      res.status(400).end();
    }
  }
}

export default EpisodeController;
