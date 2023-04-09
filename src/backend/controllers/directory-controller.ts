import DirectoryService from 'backend/service/directory-service';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';

class DirectoryController {
  static async list(req: NextApiRequest, res: NextApiResponse) {
    try {
      const directories = DirectoryService.list();
      res.json(directories);
    } catch (error) {
      console.error(error);
      res.status(500).end();
    }
  }

  static async create(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { directory } = req.body;
      if (directory && typeof directory === 'string') {
        const isDirectoryDuplicated = Boolean(
          await DirectoryService.get(directory)
        );
        const directoryExists = fs.existsSync(directory);

        if (!isDirectoryDuplicated && directoryExists) {
          await DirectoryService.create(directory);
          res.status(201).send('Directory added');
        }
      }
      res.status(400).end();
    } catch (error) {
      console.error(error);
      res.status(500).end();
    }
  }

  static async delete(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { directory } = req.query;
      if (directory && typeof directory === 'string') {
        await DirectoryService.delete(directory);
        res.status(200).end();
      }
    } catch (error) {
      res.status(500).end();
    }
  }
}

export default DirectoryController;
