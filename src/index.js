import express from 'express';
import http from 'http';
import {Server as WebSocketServer} from 'socket.io';
import {SerialPort, ReadlineParser} from 'serialport';
//import socketController from './controllers/socket.controllers';
//import scaleController from './controllers/scale.controllers';
import IndexRoutes from './routes/index.routes';

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

/*
function connectSerial() {
	//const portB1 = new SerialPort({ path: "/dev/ttyACM0", baudRate: 9600 });
	const portB2 = new SerialPort({ path: "/COM3", baudRate: 9600 });
	const portB1 = new SerialPort({ path: "/COM4", baudRate: 9600 });
	//const portB2 = new SerialPort({ path: "/COM5", baudRate: 9600 });
	const parser1 = new ReadlineParser({ delimiter: "\r\n" });
	portB1.pipe(parser1);
	const parser2 = new ReadlineParser({ delimiter: "\r\n" });
	portB2.pipe(parser2);
	parser1.on("data", (data) => {
		console.log("Respuesta B1: ", data.toString());
		io.emit("scale1:server", {
			data: data.toString(),
		});
	});

	parser2.on("data", (data) => {
		console.log("Respuesta B2: ", data.toString());
		io.emit("scale2:server", {
			data: data.toString(),
		});
	});

	portB1.on("open", () => {
		console.log("Puerto Serial de la Bascula 1 Abierto");
		console.log(portB1);
	});

	portB1.on("close", () => {
		console.log("Puerto Serial de la Bascula 1 Cerrado");
		setTimeout(connectSerial, 5000);
	});

	portB2.on("open", () => {
		console.log("Puerto Serial de la Bascula 2 Abierto");
	});

	portB2.on("close", () => {
		console.log("Puerto Serial de la Bascula 1 Cerrado");
		setTimeout(connectSerial, 5000);
	});

	portB1.on("error", (err) => {
		console.log(err.message);
		setTimeout(connectSerial, 5000);
	});

	portB2.on("error", function (err) {
		console.log(err.message);
		setTimeout(connectSerial, 5000);
	});
}
*/
/*
function connectSerial1() {
	const portB1 = new SerialPort({ path: "/COM3", baudRate: 9600 });
	const parser1 = new ReadlineParser({ delimiter: "\r\n" });
	portB1.pipe(parser1);
	
	parser1.on("data", (data) => {
		console.log("Respuesta B1: ", data.toString());
		io.emit("scale1:server", {
			data: data.toString(),
		});
	});

	portB1.on("open", () => {
		console.log("Puerto Serial de la Bascula 1 Abierto");
	});

	portB1.on("close", () => {
		console.log("Puerto Serial de la Bascula 1 Cerrado");
		setTimeout(connectSerial1, 5000);
	});

	portB1.on("error", (err) => {
		console.log('Error Bascula 1',err.message);
		setTimeout(connectSerial1, 5000);
	});
}

function connectSerial2() {
	const portB2 = new SerialPort({ path: "/COM4", baudRate: 9600 });
	const parser2 = new ReadlineParser({ delimiter: "\r\n" });
	portB2.pipe(parser2);
	
	parser2.on("data", (data) => {
		console.log("Respuesta B2: ", data.toString());
		io.emit("scale2:server", {
			data: data.toString(),
		});
	});

	portB2.on("open", () => {
		console.log("Puerto Serial de la Bascula 2 Abierto");
	});

	portB2.on("close", () => {
		console.log("Puerto Serial de la Bascula 2 Cerrado");
		setTimeout(connectSerial2, 5000);
	});

	portB2.on("error", (err) => {
		console.log('Error Bascula 2',err.message);
		setTimeout(connectSerial2, 5000);
	});
}

connectSerial1();
connectSerial2();
*/
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
    //const weightOK= weight.split('').reverse().join('')
    //console.log('invertido',weightOK);
	*/

    console.log(`Peso ${scale}:`, weight);
    io.emit('scale:server', {puerto: scale, data: weight});
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
connectSerialPort(port1, parser1, '/COM5'); //Bascula 1 COM5
connectSerialPort(port2, parser2, '/COM3'); //Bascula 2 COM6

/*
socketController.scaleChannelListening(data => {
  scaleController.requestToScale(portB1, data);
});
*/

server.listen(app.get('port'), () => {
  console.log('Server on port', app.get('port'));
});

app.use(IndexRoutes);

export {io};

/*
const port = new SerialPort({ path: "/COM4", baudRate: 9600 });
const parser = new ReadlineParser({ delimiter: "\r\n" });
port.pipe(parser);

parser.on("data", (data) => {
	console.log("Respuesta: ", data.toString());
	io.emit("scale3:server", {
		data: data.toString(),
	});
});

port.on("open", () => {
	console.log("Puerto Serial Abierto");
	setTimeout(function () {
		// Tu código aquí
		console.log("Han pasado 1000 milisegundos");
		//port.write('R')
		//port.write(String.fromCharCode(82))
		port.write(Buffer.from("52", "hex"), (err) => {
			if (err) {
				console.error("Error al enviar comando:", err.message);
			} else {
				console.log("Comando enviado con éxito");
			}
		});
	}, 1000);
});

port.on("error", (err) => {
	console.log("Error: ", err.message);
});
*/
