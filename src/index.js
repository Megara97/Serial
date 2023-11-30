import express from 'express';
import http from 'http';
import {Server as WebSocketServer} from 'socket.io';
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
// scaleController.connectScale(1, '/COM5'); //Bascula 1 COM5
// scaleController.connectScale(2, '/COM6'); //Bascula 2 COM6

//BASCULA FINAL (PC)
// scaleController.connectScale(3, '/COM3'); //Bascula 3 COM?

//Prueba Ubuntu
scaleController.connectScale(3, '/dev/ttyACM0');

server.listen(app.get('port'), () => {
  console.log('Server on port', app.get('port'));
});

app.use(indexRoutes);

export {io};
