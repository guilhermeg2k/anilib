import * as dotenv from 'dotenv';
dotenv.config();
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import ws from 'ws';
import { wsRouter } from './trpc/routers/ws';

const NODE_ENV = process.env.NODE_ENV ?? 'development';
const IS_DEV = NODE_ENV !== 'production';

const WS_PORT = process.env.NEXT_PUBLIC_WS_DEV_PORT
  ? parseInt(process.env.NEXT_PUBLIC_WS_DEV_PORT, 10)
  : 3001;

if (!IS_DEV) {
  console.log(
    'This server is only used for development. And you are running in production mode. Exiting...'
  );
  process.exit(1);
}

const wsServer = new ws.Server({
  port: WS_PORT,
});

const handler = applyWSSHandler({ wss: wsServer, router: wsRouter });

wsServer.on('connection', (ws) => {
  console.log(`WSS - New connection (Total = ${wsServer.clients.size})`);
  ws.once('close', () => {
    console.log(`WSS - Connection closed (Total = ${wsServer.clients.size})`);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM');
  handler.broadcastReconnectNotification();
  wsServer.close();
});

console.log(`WSS Dev Server - Started on port ${WS_PORT}`);
