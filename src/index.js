import express from 'express';
import http from 'http';
import {Server as WebSocketServer} from 'socket.io';
import socketController from './controllers/socket.controllers';
import scaleController from './controllers/scale.controllers';
import indexRoutes from './routes/index.routes';

const app = express();
app.set('port', process.env.PORT || 3000);
const server = http.createServer(app);

const io = new WebSocketServer(server, {
  cors: {
    origin: '*',
  },
});

io.on('connection', socket => {
  console.log(`El cliente con el id ${socket.id} se a conectado`);
  /*socket.on('joinRoom', room => {
    socket.join(room);
    console.log(
      `El cliente con el id ${socket.id} se a unido a la sala ${room}`,
    );
  });
  socket.on('server:weight', data => {
    console.log(data);
  });*/
});

//Conectar las basculas, recibir el peso y enviar a socket
//scaleController.connectScale(1, '/COM5', socketController.channelWrite); //Bascula 1 COM5
//scaleController.connectScale(2, '/COM6', socketController.channelWrite); //Bascula 2 COM6
scaleController.connectScale(3, '/COM3', socketController.channelWrite); //Bascula 3 COM?
//connectSerialPort(3, '/dev/ttyACM0', socketController.channelWrite); //Prueba Ubuntu

//Escuchar socket y mandar comando a bascula 3 (pedir peso)
socketController.channelListening(data => {
  scaleController.requestToScale(3, data);
});

server.listen(app.get('port'), () => {
  console.log('Server on port', app.get('port'));
});

app.use(indexRoutes);

export {io};
