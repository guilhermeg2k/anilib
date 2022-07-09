// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

type Data = {
  msg: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const filePath = '/home/guilhermeg2k/Workspace/video-streaming/file.vtt';
  var stat = fs.statSync(filePath);

  res.writeHead(200, {
    'Content-Type': 'vtt',
    'Content-Length': stat.size,
  });
  const readStream = fs.createReadStream(filePath);
  readStream.pipe(res);
}
