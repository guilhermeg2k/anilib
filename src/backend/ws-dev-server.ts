// THIS SERVER IS ONLY FOR DEVELOPMENT MODE
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import ws from 'ws';
import { wsRouter } from './trpc/routers/ws';

const wsServer = new ws.Server({
  port: 3001,
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

console.log('WSS - Server started on port 3001');
