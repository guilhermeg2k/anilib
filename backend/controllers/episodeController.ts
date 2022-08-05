import EpisodeService from '@backend/service/episodeService';
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';

class EpisodeController {
  static getById(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query;
      if (id) {
        const episode = EpisodeService.getById(String(id));
        res.json(episode);
        return;
      }
      res.status(400).end();
    } catch (error) {
      console.error(error);
      res.status(500).end();
    }
  }

  static listByAnimeId(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { animeId } = req.query;
      if (animeId && typeof animeId === 'string') {
        const episodes = EpisodeService.listByAnimeId(animeId);
        res.json(episodes);
        return;
      }
      res.status(400).end();
    } catch (error) {
      console.error(error);
      res.status(400).end();
    }
  }

  static async getImageCoverBase64ById(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    try {
      const { episodeId } = req.query;
      if (episodeId && typeof episodeId === 'string') {
        const imageCoverBase64 = await EpisodeService.getImageCoverBase64ById(
          episodeId
        );
        res.send(imageCoverBase64);
        return;
      }
      res.status(400).end();
    } catch (error) {
      console.error(error);
      res.status(500).end();
    }
  }

  static getVideoStreamById(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query;
      const { range } = req.headers;

      if (id && typeof id === 'string' && range) {
        const episode = EpisodeService.getById(id);

        if (episode) {
          const chunkSize = 10 ** 6;
          const videoPath = episode.filePath;
          const videoSize = fs.statSync(videoPath).size;

          const start = Number(range.replace(/\D/g, ''));
          const end = Math.min(start + chunkSize, videoSize - 1);
          const contentLength = end - start + 1;

          const headers = {
            'Content-Range': `bytes ${start}-${end}/${videoSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': contentLength,
            'Content-Type': 'video/mp4',
          };

          res.writeHead(206, headers);
          const videoStream = fs.createReadStream(videoPath, { start, end });
          videoStream.pipe(res);
          return;
        }
      }
      res.status(400).end();
    } catch (error) {
      console.log(error);
      res.status(500).end();
    }
  }
}

export default EpisodeController;
