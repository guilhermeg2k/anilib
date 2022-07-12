import AnimeService from '@backend/service/animeService';
import { NextApiRequest, NextApiResponse } from 'next';

const animeService = new AnimeService();

class AnimeController {
  list(req: NextApiRequest, res: NextApiResponse) {
    try {
      const animes = animeService.list();
      res.json(animes);
    } catch (error) {
      console.error(error);
      res.status(500).end();
    }
  }

  getById(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query;
      if (id && typeof id === 'string') {
        const animes = animeService.getById(id);
        res.json(animes);
      }
    } catch (error) {
      res.status(500).send('Failed get animes');
    }
  }
}

export default AnimeController;
