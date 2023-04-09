import EpisodeService from '@services/episode-service';
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { id } = req.query;
        const { range } = req.headers;

        if (id && typeof id === 'string' && range) {
          const episode = await EpisodeService.getById(id);

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
      break;
    default:
      res.status(405).end();
      break;
  }
}
