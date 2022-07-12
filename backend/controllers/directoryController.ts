import DirectoryService from '@backend/service/directoryService';
import { NextApiRequest, NextApiResponse } from 'next';
import { resolve } from 'path';

const directoryService = new DirectoryService();

class DirectoryController {
  async list(req: NextApiRequest, res: NextApiResponse) {
    try {
      const directories = directoryService.list();
      res.json(directories);
    } catch (error) {
      console.error(error);
      res.status(500).end();
    }
  }

  async create(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { directory } = req.body;
      if (directory && typeof directory === 'string') {
        const isDirectoryDuplicated = Boolean(
          await directoryService.get(directory)
        );
        if (!isDirectoryDuplicated) {
          await directoryService.create(directory);
          res.status(201).send('Directory added');
        }
      }
      res.status(400).end();
    } catch (error) {
      console.error(error);
      res.status(500).end();
    }
  }

  async delete(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { directory } = req.query;
      if (directory && typeof directory === 'string') {
        await directoryService.delete(directory);
        res.status(200).end();
      }
    } catch (error) {
      res.status(500).send('Failed to remove directory');
    }
  }
}

export default DirectoryController;
