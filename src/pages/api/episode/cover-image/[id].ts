import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import EpisodeService from '@backend/service/episode';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { id } = req.query;
        if (id && typeof id === 'string') {
          const episode = await EpisodeService.getById(id);

          if (!episode || !episode.coverImagePath) {
            return res.status(400).end();
          }

          const { size } = fs.statSync(episode.coverImagePath);

          res.writeHead(200, {
            'Content-Type': 'image/jpeg',
            'Content-Length': size,
          });

          const imageFileStream = fs.createReadStream(episode.coverImagePath!);
          imageFileStream.pipe(res);
          return;
        }
        res.status(400).end();
      } catch (error) {
        console.error(error);
        res.status(500).end();
      }
      break;
    default:
      res.status(405).end();
      break;
  }
}
