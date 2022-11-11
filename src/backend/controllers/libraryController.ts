import LibraryService from 'backend/service/libraryService';
import { NextApiRequest, NextApiResponse } from 'next';

const libraryService = new LibraryService();

class LibraryController {
  static async getStatus(_: NextApiRequest, res: NextApiResponse) {
    try {
      const status = libraryService.getStatus();
      res.json(status);
    } catch (error) {
      console.log(error);
      res.status(500).end();
    }
  }

  static async update(_: NextApiRequest, res: NextApiResponse) {
    try {
      libraryService.update();
      res.status(200).end();
    } catch (error) {
      console.log(error);
      res.status(500).end();
    }
  }
}

export default LibraryController;
