import Database from '@backend/database';
import { NextApiRequest, NextApiResponse } from 'next';

class EpisodeController {
  listById(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    const episode = Database.getEpisodes().find((episode) => episode.id === id);
    res.json(episode);
  }

  listByAnimeId(req: NextApiRequest, res: NextApiResponse) {
    const { animeId } = req.query;
    const episodes = Database.getEpisodes().filter(
      (episode) => episode.animeId === animeId
    );
    res.json(episodes);
  }
}

export default EpisodeController;
