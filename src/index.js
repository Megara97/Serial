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

let weight;
let signo;

function connectSerialPort(port, parser, COM) {
  const scale = COM === '/COM5' ? 'Bascula 1' : 'Bascula 2';
  port = new SerialPort({path: COM, baudRate: 9600});
  parser = new ReadlineParser({delimiter: 'g\r\n'});
  //parser = new ReadlineParser({ delimiter: "\r\n" });  //CR + LF
  //parser = new ReadlineParser({ delimiter: "\r" }); //CR
  //parser = new ReadlineParser({ delimiter: "\n" }); //LF
  port.pipe(parser);

  parser.on('data', data => {
    console.log(`Respuesta ${scale}:`, data.toString()); //data.toString()
    /*console.log(`Respuesta ${scale}:`);
		// Iterar sobre cada carácter e imprimir su código ASCII
		for (let i = 0; i < data.length; i++) {
		  const codigoAscii = data.charCodeAt(i);
		  console.log(`Carácter ${i + 1}: ${data[i]} (Código ASCII: ${codigoAscii})`);
		}*/

    const indiceTotal = data.indexOf('TOTAL');
    //console.log('indice',indiceTotal)
    if (indiceTotal !== -1) {
      signo = data.substring(indiceTotal + 5, indiceTotal + 6);
      weight = data.substring(indiceTotal + 6, indiceTotal + 14);
      weight = signo === '-' ? parseFloat(weight) * -1 : parseFloat(weight);
      //weight = data.substring(indiceTotal + 5, indiceTotal + 14);
      //weight = parseFloat(weight);
    } else {
      signo = data.substring(5, 6);
      weight = data.substring(6, 13);
      weight = signo === '-' ? parseFloat(weight) * -1 : parseFloat(weight);
      //weight= signo === '-' ? 0 : parseFloat(weight)
    }

    /* 
    //Modo  RS Cor Protocolo 1
    const signo = data.toString().substring(5, 6);
    weight = data.toString().substring(6, 13);
    weight = signo === '-' ? parseFloat(weight) * -1 : parseFloat(weight);
    //weight= signo === '-' ? 0 : parseFloat(weight)
	*/

    /*
    //Modo  RS Prt
    const indiceTotal = data.indexOf('TOTAL');
    weight = data.substring(indiceTotal + 5, indiceTotal + 14);
    weight = parseFloat(weight);
	*/

    /*
    //Modo  RS Cor Protocolo 4
    //weight = data.toString().substring(1, 7);
    //weight= weight.split('').reverse().join('')
    //console.log('invertido',weight);
	*/

    console.log(`Peso ${scale}:`, weight);
    //io.emit('scale:server', {scale: scale, data: weight});
  });

  port.on('open', () => {
    console.log(`Puerto Serial ${scale} Abierto`);
  });

  port.on('close', () => {
    console.log(`Conexión ${scale} cerrada`);
    //console.log(port);
    setTimeout(() => connectSerialPort(port, parser, COM), 5000);
  });

  port.on('error', err => {
    console.log(`Error ${scale}:`, err.message);
    setTimeout(() => connectSerialPort(port, parser, COM), 5000);
  });
}

let port1;
let parser1;
let port2;
let parser2;
let port3;
let parser3;
//connectSerialPort(port1, parser1, '/COM5'); //Bascula 1 COM5
//connectSerialPort(port2, parser2, '/COM3'); //Bascula 2 COM6
//connectSerialPort(port3, parser3, '/dev/ttyACM0'); //Bascula 3

scaleController.connectScale(3, '/dev/ttyACM0', socketController.channelWrite);
//scaleController.connectScale();
//scaleController.readScale(3,socketController.channelWrite);

/*socketController.channelListening(data => {
  scaleController.requestToScale(3, data);
});*/

server.listen(app.get('port'), () => {
  console.log('Server on port', app.get('port'));
});

app.use(indexRoutes);

export {io};
