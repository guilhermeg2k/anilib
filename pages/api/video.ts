// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';

type Data = {
  msg: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const range = req.headers.range;
  if (!range) {
    res.status(400).send({ msg: 'Requires Range header' });
  }
  const videoPath = '/home/guilhermeg2k/Workspace/video-streaming/jujutsu.mp4';
  const videoSize = fs.statSync(videoPath).size;
  const CHUNK_SIZE = 10 ** 6;
  const start = Number(range?.replace(/\D/g, ''));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
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
}
