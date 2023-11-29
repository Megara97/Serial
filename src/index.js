import express from 'express';
import http from 'http';
import {Server as WebSocketServer} from 'socket.io';
import {SerialPort, ReadlineParser} from 'serialport';
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
});

let ports = [];
let parsers = [];

function connectSerialPort(port, COM, sendSocket) {
  ports[port] = new SerialPort({path: COM, baudRate: 9600});
  parsers[port] = new ReadlineParser({delimiter: 'g\r\n'});

  ports[port].pipe(parsers[port]);

  let weight;
  let signo;
  parsers[port].on('data', data => {
    //console.log(`Respuesta ${scale}:`, data.toString());
    const indiceTotal = data.indexOf('TOTAL');
    if (indiceTotal !== -1) {
      signo = data.substring(indiceTotal + 5, indiceTotal + 6);
      weight = data.substring(indiceTotal + 6, indiceTotal + 14);
      weight = signo === '-' ? parseFloat(weight) * -1 : parseFloat(weight);
    } else {
      signo = data.substring(5, 6);
      weight = data.substring(6, 13);
      weight = signo === '-' ? parseFloat(weight) * -1 : parseFloat(weight);
    }
    console.log(`Peso Bascula ${port}:`, weight);
    io.emit('client:weight', {scale: port, data: weight});
    sendSocket({scale: port, data: weight});
  });

  ports[port].on('open', () => {
    console.log(`Puerto Serial Bascula ${port} Abierto`);
  });

  ports[port].on('close', () => {
    console.log(`Conexión Bascula ${port} cerrada`);
    setTimeout(() => connectSerialPort(port, COM), 5000);
  });

  ports[port].on('error', err => {
    console.log(`Error Bascula ${port}:`, err.message);
    setTimeout(() => connectSerialPort(port, COM), 5000);
  });
}

//connectSerialPort(1, '/COM5'); //Bascula 1 COM5
//connectSerialPort(2, '/COM3'); //Bascula 2 COM6
connectSerialPort(3, '/dev/ttyACM0', socketController.channelWrite); //Bascula 3

//scaleController.connectScale();
//scaleController.readScale(3,socketController.channelWrite);

/*socketController.channelListening(data => {
  scaleController.requestToScale(3, data);
});*/

server.listen(app.get('port'), () => {
  console.log('Server on port', app.get('port'));
});

app.use(indexRoutes);

//scaleController.connectScale(3, '/dev/ttyACM0', socketController.channelWrite);

export {io};
