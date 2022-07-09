import Database from '@backend/database';
import { NextApiRequest, NextApiResponse } from 'next';

class AnimeController {
  async list(req: NextApiRequest, res: NextApiResponse) {
    try {
      const animes = Database.getAnimes();
      res.json(animes);
    } catch (error) {
      res.status(500).send('Failed get animes');
    }
  }

  async listById(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query;
      const animes = Database.getAnime(id!.toString());
      res.json(animes);
    } catch (error) {
      res.status(500).send('Failed get animes');
    }
  }
}

export default AnimeController;
