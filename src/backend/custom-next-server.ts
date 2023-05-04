import * as dotenv from 'dotenv';
dotenv.config();
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import http from 'http';
import next from 'next';
import { parse } from 'url';
import ws from 'ws';
import { wsRouter } from './trpc/routers/ws';

const NODE_ENV = process.env.NODE_ENV ?? 'development';
const IS_DEV = NODE_ENV !== 'production';

if (IS_DEV) {
  console.log(
    'This server is only used for production builds. And you are running in development mode. Change it by changing NODE_ENV to production. Exiting...'
  );
  process.exit(1);
}

const PORT = process.env.NEXT_PUBLIC_PORT
  ? parseInt(process.env.NEXT_PUBLIC_PORT, 10)
  : 3000;

const app = next({ dev: IS_DEV });
const handle = app.getRequestHandler();

void app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const wsServer = new ws.Server({ server });
  const handler = applyWSSHandler({ wss: wsServer, router: wsRouter });

  process.on('SIGTERM', () => {
    console.log('SIGTERM');
    handler.broadcastReconnectNotification();
  });

  server.listen(PORT);

  console.log(
    `> Server listening at http://localhost:${PORT} as ${
      IS_DEV ? 'development' : process.env.NODE_ENV
    }`
  );
});
