// THIS SERVER IS ONLY FOR DEVELOPMENT MODE
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import ws from 'ws';
import { wsRouter } from './trpc/routers/wsRouter';

const wsServer = new ws.Server({
  port: 3001,
});

const handler = applyWSSHandler({ wss: wsServer, router: wsRouter });

console.log('Websocket server started on port 3001');

wsServer.on('connection', (ws) => {
  console.log(`➕➕ Connection (${wsServer.clients.size})`);
  ws.once('close', () => {
    console.log(`➖➖ Connection (${wsServer.clients.size})`);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM');
  handler.broadcastReconnectNotification();
  wsServer.close();
});
