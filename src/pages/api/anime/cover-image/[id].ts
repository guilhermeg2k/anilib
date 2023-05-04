import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import AnimeService from '@backend/service/anime';

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
          const anime = await AnimeService.getById(id);

          if (!anime || !anime.coverImagePath) {
            return res.status(400).end();
          }

          const { size } = fs.statSync(anime.coverImagePath);

          res.writeHead(200, {
            'Content-Type': 'image/jpeg',
            'Content-Length': size,
          });

          const imageFileStream = fs.createReadStream(anime.coverImagePath);
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
