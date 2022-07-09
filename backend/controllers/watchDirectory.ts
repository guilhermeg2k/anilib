import Database from '@backend/database';
import { syncAnimes } from '@backend/utils/anime';
import { NextApiRequest, NextApiResponse } from 'next';

class WatchDirectoryController {
  async list(req: NextApiRequest, res: NextApiResponse) {
    try {
      const watchDirectories = Database.getWatchDirectories();
      res.json(watchDirectories);
    } catch (error) {
      res.status(500).send('Failed get directories');
    }
  }

  async create(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { directory } = req.body;
      await Database.insertWatchDirectory(directory);
      res.status(201).send('Watch directory created');
    } catch (error) {
      res.status(500).send('Failed to create directory');
    }
  }

  async sync(req: NextApiRequest, res: NextApiResponse) {
    res.send('Sync started');
    const watchDirectories = Database.getWatchDirectories();
    syncAnimes(watchDirectories);
  }
}

export default WatchDirectoryController;
