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
  let prevData = 0;
  let time;
  const startHour = 6;
  const endHour = 20;
  let now = new Date();

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
    ports[port] = new SerialPort({path: COM, baudRate: 9600,stopBits: 2});
    parsers[port] = new ReadlineParser({delimiter: '\n'}); //BASCULA FINAL
    ports[port].pipe(parsers[port]);

    parsers[port].on('data', data => {
      console.log(`Respuesta Bascula ${port}:\n${data.toString()}`);
      if (port != 3) {
        //BASCULAS INICIALES
      } else {
        //BASCULA FINAL
        let dataParse = data.toString().split(' ');
        dataParse = dataParse[dataParse.length - 1].split('kg')[0];
        dataParse = parseFloat(dataParse);
        now = new Date();
        if (
          parseFloat(prevData) != parseFloat(dataParse) &&
          dataParse >= 0 &&
          now.getHours() >= startHour &&
          now.getHours() <= endHour
        ) {
          clearTimeout(time);
          //console.log(prevData, dataParse)
          time = setTimeout(() => {
            console.log(
              `${now.toLocaleString()} Peso Bascula ${port}:`,
              dataParse,
            );
            //console.log(dataParse, port)
            postDataScale(port, dataParse); //Web Socket
            io.emit('server:weight', {scale: port, data: dataParse}); //Socket local
          }, 3000);
          prevData = dataParse;
        }

        /*const indiceTotal = data.indexOf('Gross');
        if (indiceTotal !== -1) {
          //Modo Print
          weight[port] = data.substring(indiceTotal + 6, indiceTotal + 15);
          console.log(weight[port]);
          weight[port] = parseFloat(weight[port]);
          //console.log(`Peso DEFINITIVO Bascula ${port}:`, weight[port]);
          //io.emit('server:weight', {scale: port, data: weight[port]}); //Socket local
          //postDataScale(port, weight[port]); //Web Socket
        } else {
          //Modo Continuo
          signCont[port] = data.substring(6, 7);
          weightCont[port] = data.substring(7, 14);
          weightCont[port] =
            signCont[port] === '-'
              ? parseFloat(weightCont[port]) * -1
              : parseFloat(weightCont[port]);
          //console.log(`Peso Bascula ${port}:`, weightCont[port]);
          //io.emit('server:weight', {scale: port, data: weight[port]}); //Socket local
          //postDataScale(port, weight[port]); //Web Socket
        }*/
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
      now = new Date().toLocaleString();
      console.log(`${now} Error Bascula ${port}:`, err.message);
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