/* eslint-disable no-var */
import { Server } from 'socket.io';
import { WebsocketEvent } from '../constants/websocketEvents';

declare global {
  var socketIOServer: Server;
  var hasSocketIOServerStarted: boolean;
}

class SocketIO {
  static init() {
    try {
      if (global.hasSocketIOServerStarted) {
        return;
      }
      console.log('Starting SocketIO');
      const SocketIOServer = new Server(3001);
      global.socketIOServer = SocketIOServer;
      global.hasSocketIOServerStarted = true;
    } catch (error) {
      console.log('Failed to init SocketIO');
      console.log(error);
      global.hasSocketIOServerStarted = true;
    }
  }

  static send(event: WebsocketEvent, data: string) {
    global.socketIOServer.emit(event, data);
  }
}

export default SocketIO;
