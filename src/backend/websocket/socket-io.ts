/* eslint-disable no-var */
import { Server } from 'socket.io';
import { WebsocketEvent } from '../constants/websocket-events';

declare global {
  var socketIOServer: Server;
}

const SERVER_PORT = process.env.WEBSOCKET_SERVER_PORT || 3001;

class SocketIO {
  static init() {
    try {
      if (global.socketIOServer) {
        return;
      }
      // const port =
      //   typeof SERVER_PORT === 'string' ? parseInt(SERVER_PORT) : SERVER_PORT;

      // console.log('Starting SocketIO');
      // // const SocketIOServer = new Server(port);
      // global.socketIOServer = SocketIOServer;
    } catch (error) {
      console.log('Failed to init SocketIO');
      console.log(error);
    }
  }

  static send(event: WebsocketEvent, data: string) {
    global.socketIOServer.emit(event, data);
  }
}

export default SocketIO;
