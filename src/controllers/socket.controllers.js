import ioClient from 'socket.io-client';
import config from '../config';

const socketController = (() => {
  const socketClient = ioClient(config.HOST_SERVER_SOCKET, {
    extraHeaders: {
      'Content-Type': 'application/json',
    },
  });

  socketClient.on('connect', () => {
    socketClient.emit('joinRoom', 'scales_164');
  });

  socketClient.on('connect_error', error => {
    console.log('Connection error:', error.message);
  });

  return {
    channelListening: handleScaleData => {
      socketClient.on('client:weight', data => {
        handleScaleData(data);
      });
    },
    channelWrite: data => {
      //console.log(data);
      socketClient.emit('server:weight', data);
    },
  };
})();

export default socketController;
