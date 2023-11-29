import {SerialPort, ReadlineParser} from 'serialport';
import {io} from '../index';

const scaleController = (() => {
  let ports = [];
  let parsers = [];

  function sendCommandToScale(port, command) {
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
      //console.log(`Respuesta Bascula ${port}:`, data.toString());
      const indiceTotal = data.indexOf('TOTAL');
      if (indiceTotal !== -1) {
        signo = data.substring(indiceTotal + 5, indiceTotal + 6);
        weight = data.substring(indiceTotal + 6, indiceTotal + 14);
        weight = signo === '-' ? parseFloat(weight) * -1 : parseFloat(weight);
        console.log(`Peso DEFINITIVO Bascula ${port}:`, weight);
      } else {
        signo = data.substring(5, 6);
        weight = data.substring(6, 13);
        weight = signo === '-' ? parseFloat(weight) * -1 : parseFloat(weight);
        console.log(`Peso Bascula ${port}:`, weight);
      }
      //console.log(`Peso Bascula ${port}:`, weight);
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

  return {
    requestToScale: (port, data = {}) => {
      //console.log(data);
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
      connectSerialPort(port, COM, sendSocket);
    },
  };
})();

export default scaleController;
