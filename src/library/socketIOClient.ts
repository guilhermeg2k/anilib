import { io } from 'socket.io-client';

const address =
  process.env.NEXT_PUBLIC_WEBSOCKET_CLIENT_ADDRESS || 'localhost:3001';

const socketIOClient = io(address, { transports: ['websocket'] });

export default socketIOClient;
