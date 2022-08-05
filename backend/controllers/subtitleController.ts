import SubtitleService from '@backend/service/subtitleService';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';

class SubtitleController {
  static listByEpisodeId(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { episodeId } = req.query;
      if (episodeId && typeof episodeId === 'string') {
        const subtitles = SubtitleService.listByEpisodeId(episodeId);
        res.json(subtitles);
        return;
      }
      res.status(400).end();
    } catch (error) {
      res.status(500).end();
      console.error(error);
    }
  }

  static getVttFileById(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query;
      if (id && typeof id === 'string') {
        const subtitle = SubtitleService.getById(id);
        if (subtitle) {
          const vttFilePath = subtitle.filePath;
          const { size } = fs.statSync(vttFilePath);

          res.writeHead(200, {
            'Content-Type': 'vtt',
            'Content-Length': size,
          });

          const vttFileStream = fs.createReadStream(vttFilePath);
          vttFileStream.pipe(res);
          return;
        }
      }
      res.status(400).end();
    } catch (error) {
      console.error(error);
      res.status(500).end();
    }
  }
}

export default SubtitleController;
