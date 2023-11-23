import express from "express";
import http from "http";
import { Server as WebSocketServer } from "socket.io";
import { SerialPort, ReadlineParser } from "serialport";
//import socketController from "./controllers/socket.controllers";
//import scaleController from "./controllers/scale.controllers";
import IndexRoutes from "./routes/index.routes";

const app = express();
app.set("port", process.env.PORT || 3000);
const server = http.createServer(app);
const io = new WebSocketServer(server, {
	cors: {
		origin: "*",
	},
});

io.on("connection", (socket) => {
	console.log(`El cliente con el id ${socket.id} se a conectado`);
});

function connectSerial() {
	const portB1 = new SerialPort({ path: "/dev/ttyACM0", baudRate: 9600 });
	//const portB1 = new SerialPort({ path: "/COM4", baudRate: 9600 });
	const portB2 = new SerialPort({ path: "/COM5", baudRate: 9600 });
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
		//setTimeout(connectSerial, 2000);
	});

	portB2.on("open", () => {
		console.log("Puerto Serial de la Bascula 2 Abierto");
	});

	portB2.on("close", () => {
		console.log("Puerto Serial de la Bascula 1 Cerrado");
		//setTimeout(connectSerial, 2000);
	});

	portB1.on("error", function (err) {
		console.log(err.message);
		//setTimeout(connectSerial, 2000);
	});

	portB2.on("error", function (err) {
		console.log(err.message);
		//setTimeout(connectSerial, 2000);
	});
}

//connectSerial();

function connectSerialPort(COM, connected) {
	//const port = new SerialPort({ path: "/COM4", baudRate: 9600 });
	const port = new SerialPort({ path: COM, baudRate: 9600 });
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
		/*setTimeout(function () {
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
		}, 1000);*/
		connected = true;
	});

	port.on("close", () => {
		console.log("Conexión cerrada");
	});

	port.on("error", (err) => {
		console.log(err.message);
	});
}

let isConnected = false;
if (isConnected === false) {
	//console.log("aqui");
	connectSerialPort("/dev/ttyACM0", isConnected);
}

/*socketController.scaleChannelListening((data) => {
	scaleController.requestToScale(portB1, data);
});*/

server.listen(app.get("port"), () => {
	console.log("Server on port", app.get("port"));
});

app.use(IndexRoutes);

export { io };

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
