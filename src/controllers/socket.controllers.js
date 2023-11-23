import ioClient from "socket.io-client";
import config from "../../config";

const socketController = (() => {
	const socketClient = ioClient(config.HOST_SERVER_SOCKET, {
		extraHeaders: {
			"Content-Type": "application/json",
		},
	});

	socketClient.on("connect", () => {
		socketClient.emit("joinRoom", "scales_164");
	});

	socketClient.on("connect_error", (error) => {
		console.log("Connection error:", error.message);
	});

	return {
		scaleChannelListening: (handleScaleData) => {
			socketClient.on("server:scale", (data) => {
				handleScaleData(data);
			});
		},
	};
})();

export default socketController;
