import { SerialPort, ReadlineParser } from "serialport";
import express from "express";
//import socketIo from "socket.io";
import { Server as SocketServer } from "socket.io";
import http from "http";

const app = express();
//app.set("port", process.env.PORT || 3007);

const server = http.createServer(app);
//const io = socketIo.listen(server);
const io = new SocketServer(server, {
	cors: {
		origin: "*",
	},
});

io.on("connection", (socket) => {
	console.log(`El cliente con el id ${socket.id} se a conectado`);
});

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/index.html");
});

const port = new SerialPort({ path: "/dev/ttyACM0", baudRate: 9600 });
const parser = new ReadlineParser();
port.pipe(parser);
//parser.on("data", console.log);

port.on("open", function () {
	console.log("Puerto Serial Abierto");
});

port.on("data", function (data) {
	console.log(data.toString());
	io.emit("serial:data", {
		value: data.toString(),
	});
});

port.on("error", function (err) {
	console.log("Error: ", err.message);
});

server.listen(3000, () => {
	console.log("server on port", 3000);
});