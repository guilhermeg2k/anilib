import AnimeService from '@backend/service/animeService';
import { NextApiRequest, NextApiResponse } from 'next';

class AnimeController {
  static list(req: NextApiRequest, res: NextApiResponse) {
    try {
      const animes = AnimeService.list();
      res.json(animes);
    } catch (error) {
      console.error(error);
      res.status(500).end();
    }
  }

  static getById(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query;
      if (id && typeof id === 'string') {
        const animes = AnimeService.getById(id);
        res.json(animes);
      }
    } catch (error) {
      res.status(500).send('Failed get animes');
    }
  }
}

export default AnimeController;
