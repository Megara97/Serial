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

  //BASCULA FINAL (PC)
  //Escuchar cliente y mandar comando a bascula final (pedir peso)
  socket.on('client:weight', data => {
    console.log(data);
    scaleController.requestToScale(3, data);
  });*/
});

//BASCULAS INICIALES (Mini PC)
//scaleController.connectScale(1, '/COM6', socketController.channelWrite); //Bascula 1 COM6
//scaleController.connectScale(2, '/COM5', socketController.channelWrite); //Bascula 2 COM5

//BASCULA FINAL (PC)
//scaleController.connectScale(3, '/COM3', socketController.channelWrite); //Bascula 3 COM?

scaleController.connectScale(3, '/dev/ttyACM0', socketController.channelWrite); //Prueba Ubuntu

//BASCULA FINAL (PC)   //Escuchar cliente y mandar comando a bascula final (pedir peso)
/*socketController.channelListening(data => {
  scaleController.requestToScale(3, data);
});*/

server.listen(app.get('port'), () => {
  console.log('Server on port', app.get('port'));
});

app.use(indexRoutes);

export {io};
