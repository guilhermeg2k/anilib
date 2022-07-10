import Database from '@backend/database';
import { syncAnimes } from '@backend/utils/anime';
import { NextApiRequest, NextApiResponse } from 'next';

class DirectoryController {
  async list(req: NextApiRequest, res: NextApiResponse) {
    try {
      const watchDirectories = Database.getDirectories();
      res.json(watchDirectories);
    } catch (error) {
      res.status(500).send('Failed get directories');
    }
  }

  async create(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { directory } = req.body;
      await Database.insertDirectory(directory);
      res.status(201).send('Watch directory created');
    } catch (error) {
      res.status(500).send('Failed to create directory');
    }
  }

  async sync(req: NextApiRequest, res: NextApiResponse) {
    res.send('Sync started');
    const directories = Database.getDirectories();
    syncAnimes(directories);
  }
}

export default DirectoryController;
