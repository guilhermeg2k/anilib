// THIS CUSTOM SERVER IS USED ONLY ON THE PRODUCTION BUILD
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import http from 'http';
import next from 'next';
import { parse } from 'url';
import ws from 'ws';
import { wsRouter } from './trpc/routers/wsRouter';

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
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

  server.listen(port);

  console.log(
    `> Server listening at http://localhost:${port} as ${
      dev ? 'development' : process.env.NODE_ENV
    }`
  );
});
