import Database from '@backend/database';
import { processAnimes } from '@backend/utils/animeProcess';
import { NextApiRequest, NextApiResponse } from 'next';

class AnimeController {
  list(req: NextApiRequest, res: NextApiResponse) {
    try {
      const animes = Database.getAnimes();
      res.json(animes);
    } catch (error) {
      res.status(500).send('Failed get animes');
    }
  }

  listById(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query;
      const animes = Database.getAnime(id!.toString());
      res.json(animes);
    } catch (error) {
      res.status(500).send('Failed get animes');
    }
  }

  async update(req: NextApiRequest, res: NextApiResponse) {
    res.send('Update anime task has been started, this can take a while');
    try {
      const directories = Database.getDirectories();
      await processAnimes(directories);
    } catch (error) {
      console.log(error);
    }
  }
}

export default AnimeController;
