import { io } from 'socket.io-client';

const socketIOClient = io('localhost:3001', { transports: ['websocket'] });

export default socketIOClient;
