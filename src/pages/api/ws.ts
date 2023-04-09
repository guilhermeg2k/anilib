import SocketIO from '@backend/websocket/socket-io';
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(_: NextApiRequest, res: NextApiResponse) {
  SocketIO.init();
  res.end();
}
