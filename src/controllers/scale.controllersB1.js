import {SerialPort, ReadlineParser} from 'serialport';
import {io} from '../index';
import {postDataScale} from './socket.controllers';

const scaleController = (() => {
  let ports = [];
  let parsers = [];
  let weight = [];
  let weightCont = [];
  let sign = [];
  let signCont = [];

  function sendCommandToScale(port, command) {
    ports[port].write(command, err => {
      if (err) {
        console.error('Error al enviar comando:', err.message);
      } else {
        console.log('Comando enviado con éxito');
      }
    });
  }

  function connectSerialPort(port, COM) {
    ports[port] = new SerialPort({path: COM, baudRate: 9600});
    parsers[port] = new ReadlineParser({delimiter: 'g    \r\n'}); //BASCULAS INICIALES 'g    \r\n'
    ports[port].pipe(parsers[port]);

    parsers[port].on('data', data => {
      //console.log(`Respuesta Bascula ${port}:\n${data.toString()}`);
      if (port != 3) {
        //BASCULAS INICIALES
        const indiceTotal = data.indexOf('TOTAL');
        const indiceAVG = data.indexOf('AVG');
        if (indiceTotal !== -1) {
          //Modo Print
          /*sign[port] = data.substring(indiceTotal + 5, indiceTotal + 6);
          weight[port] = data.substring(indiceTotal + 6, indiceTotal + 14);
          weight[port] =
            sign[port] === '-'
              ? parseFloat(weight[port]) * -1
              : parseFloat(weight[port]);
          console.log(`Peso DEFINITIVO Bascula ${port}:`, weight[port]);*/
          console.log(`Peso DEFINITIVO Bascula ${port}:`, weightCont[port]);
          io.emit('server:weight', {scale: port, data: weightCont[port]}); //Socket local
          postDataScale(port, weightCont[port]); //Web Socket
        } else {
          if (indiceAVG === -1) {
            //Modo Continuo
            signCont[port] = data.substring(5, 6);
            weightCont[port] = data.substring(6, 13);
            weightCont[port] =
              signCont[port] === '-'
                ? parseFloat(weightCont[port]) * -1
                : parseFloat(weightCont[port]);
            //console.log(`Peso Bascula ${port}:`, weightCont[port]);
          }
        }
      } else {
        //BASCULA FINAL
      }
    });

    ports[port].on('open', () => {
      console.log(`Puerto serial Bascula ${port} abierto`);
    });

    ports[port].on('close', () => {
      console.log(`Conexión Bascula ${port} cerrada`);
      setTimeout(() => connectSerialPort(port, COM), 5000);
    });

    ports[port].on('error', err => {
      const currentDate = new Date().toLocaleString();
      console.log(`${currentDate} Error Bascula ${port}:`, err.message);
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
    connectScale: (port, COM) => {
      connectSerialPort(port, COM);
    },
  };
})();

export default scaleController;