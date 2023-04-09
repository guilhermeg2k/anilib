import LibraryService from 'backend/service/library-service';
import { NextApiRequest, NextApiResponse } from 'next';

class LibraryController {
  static async getStatus(_: NextApiRequest, res: NextApiResponse) {
    try {
      const status = LibraryService.getStatus();
      res.json(status);
    } catch (error) {
      console.log(error);
      res.status(500).end();
    }
  }

  static async update(_: NextApiRequest, res: NextApiResponse) {
    try {
      LibraryService.update();
      res.status(200).end();
    } catch (error) {
      console.log(error);
      res.status(500).end();
    }
  }
}

export default LibraryController;
