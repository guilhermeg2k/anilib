import Database from '@backend/database';
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
      res.status(201).send('Directory added');
    } catch (error) {
      res.status(500).send('Failed to add directory');
    }
  }

  async delete(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { directory } = req.query;
      await Database.deleteDirectory(String(directory));
      res.send('Directory removed');
    } catch (error) {
      res.status(500).send('Failed to remove directory');
    }
  }
}

export default DirectoryController;
