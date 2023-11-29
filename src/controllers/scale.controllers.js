import {SerialPort, ReadlineParser} from 'serialport';
import io from '../index';

const scaleController = (() => {
  let ports = [];
  let parsers = [];

  function sendCommandToScale(port, command) {
    console.log(ports[port]);
    ports[port].write(command, err => {
      if (err) {
        console.error('Error al enviar comando:', err.message);
      } else {
        console.log('Comando enviado con éxito');
      }
    });
  }

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

  function readSerialPort(port, sendSocket) {
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
      sendSocket({scale: port, data: weight});
      //io.emit('scale:server', {scale: scale, data: weight});
    });
  }

  return {
    requestToScale: (port, data = {}) => {
      console.log(data);
      const {instruction} = data;
      let command = 'R';
      if (instruction === 'Tare') {
        command = 'T';
      } else if (instruction === 'Zero') {
        command = 'Z';
      } else if (instruction === 'Print') {
        command = 'P';
      } else if (instruction === 'Gross') {
        command = 'G';
      }
      sendCommandToScale(port, command);
    },
    connectScale: (port, COM, sendSocket) => {
      //connectSerialPort(1, '/COM5'); //Bascula 1 COM5
      //connectSerialPort(2, '/COM3'); //Bascula 2 COM6
      //connectSerialPort(3, '/dev/ttyACM0'); //Bascula 3
      connectSerialPort(port, COM, sendSocket);
    },

    readScale: (port, sendSocket) => {
      //readSerialPort(1);
      //readSerialPort(2);
      //readSerialPort(3);
      readSerialPort(port, sendSocket);
    },
  };
})();

export default scaleController;
