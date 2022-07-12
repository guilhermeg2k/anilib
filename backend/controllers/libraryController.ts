import LibraryService from '@backend/service/libraryService';
import { NextApiRequest, NextApiResponse } from 'next';

const libraryService = new LibraryService();

class LibraryController {
  async update(req: NextApiRequest, res: NextApiResponse) {
    try {
      await libraryService.update();
      res.end();
    } catch (error) {
      res.status(500).end();
    }
  }
}

export default LibraryController;
