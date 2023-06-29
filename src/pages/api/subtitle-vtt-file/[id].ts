import SubtitleService from '@backend/service/subtitle';
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
        if (id && typeof id === 'string') {
          const subtitle = await SubtitleService.getById(id);
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
      break;
    default:
      res.status(405).end();
      break;
  }
}
