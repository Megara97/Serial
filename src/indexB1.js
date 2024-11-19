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
});

//BASCULAS INICIALES (Mini PC)
scaleController.connectScale(1, '/COM3'); //Bascula 1 COM3
scaleController.connectScale(2, '/COM4'); //Bascula 2 COM4

server.listen(app.get('port'), () => {
  console.log('Server on port', app.get('port'));
});

app.use(indexRoutes);

export {io};