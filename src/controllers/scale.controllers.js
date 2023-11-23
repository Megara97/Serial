const scaleController = (() => {
	function sendCommandToScale(port, command) {
		port.write(command, (err) => {
			if (err) {
				console.error("Error al enviar comando:", err.message);
			} else {
				console.log("Comando enviado con éxito");
			}
		});
	}

	return {
		requestToScale: (port, data) => {
			console.log(data);
			const { instruction } = data;
			let command = "R";
			if (instruction === "Tare") {
				command = "T";
			} else if (instruction === "Zero") {
				command = "Z";
			} else if (instruction === "Print") {
				command = "P";
			} else if (instruction === "Gross") {
				command = "G";
			}
			sendCommandToScale(port, command);
		},
	};
})();

export default scaleController;
