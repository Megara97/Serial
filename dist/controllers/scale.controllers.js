"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _serialport = require("serialport");
var _index = require("../index");
var scaleController = function () {
  var ports = [];
  var parsers = [];
  var weight = [];
  var weightCont = [];
  var sign = [];
  var signCont = [];
  function sendCommandToScale(port, command) {
    ports[port].write(command, function (err) {
      if (err) {
        console.error('Error al enviar comando:', err.message);
      } else {
        console.log('Comando enviado con éxito');
      }
    });
  }
  function connectSerialPort(port, COM, sendSocket) {
    ports[port] = new _serialport.SerialPort({
      path: COM,
      baudRate: 9600
    });
    parsers[port] = new _serialport.ReadlineParser({
      delimiter: 'g\r\n'
    }); //BASCULAS INICIALES
    //parsers[port] = new ReadlineParser({delimiter: '\r\n'}); //BASCULA FINAL (verificar)

    ports[port].pipe(parsers[port]);
    parsers[port].on('data', function (data) {
      //console.log(`Respuesta Bascula ${port}:\n${data.toString()}`);
      // Iterar sobre cada carácter e imprimir su código ASCII
      /*console.log(`Respuesta:`);
      for (let i = 0; i < data.length; i++) {
        const codigoAscii = data.charCodeAt(i);
        console.log(`Carácter ${i}: ${data[i]} (Código ASCII: ${codigoAscii})`);
      }*/

      if (port != 3) {
        //BASCULAS INICIALES (Indices verificados)
        var indiceTotal = data.indexOf('TOTAL');
        var indiceAVG = data.indexOf('AVG');
        if (indiceTotal !== -1) {
          //Modo Print
          /*sign[port] = data.substring(indiceTotal + 5, indiceTotal + 6);
          weight[port] = data.substring(indiceTotal + 6, indiceTotal + 14);
          weight[port] =
            sign[port] === '-'
              ? parseFloat(weight[port]) * -1
              : parseFloat(weight[port]);
          console.log(`Peso DEFINITIVO Bascula ${port}:`, weight[port]);*/
          console.log("Peso DEFINITIVO Bascula ".concat(port, ":"), weightCont[port]);
          _index.io.emit('server:weight', {
            scale: port,
            data: weightCont[port]
          }); //Socket local
          sendSocket({
            scale: port,
            data: weightCont[port]
          });
        } else {
          if (indiceAVG === -1) {
            //Modo Continuo
            signCont[port] = data.substring(5, 6);
            weightCont[port] = data.substring(6, 13);
            weightCont[port] = signCont[port] === '-' ? parseFloat(weightCont[port]) * -1 : parseFloat(weightCont[port]);
            //console.log(`Peso Bascula ${port}:`, weightCont[port]);
          }
        }
      } else {
        //BASCULA FINAL (Falta verificar indices)
        var _indiceTotal = data.indexOf('GROSS');
        if (_indiceTotal !== -1) {
          //Modo Print
          /*sign[port] = data.substring(indiceTotal + 9, indiceTotal + 10);
          weight[port] = data.substring(indiceTotal + 10, indiceTotal + 15);
          weight[port] =
            sign[port] === '-'
              ? parseFloat(weight[port]) * -1
              : parseFloat(weight[port]);
          //console.log(`Peso DEFINITIVO Bascula ${port}:`, weight[port]);*/
          console.log("Peso DEFINITIVO Bascula ".concat(port, ":"), weightCont[port]);
          _index.io.emit('server:weight', {
            scale: port,
            data: weightCont[port]
          }); //Socket local
          sendSocket({
            scale: port,
            data: weightCont[port]
          });
        } else {
          //Modo Continuo
          signCont[port] = data.substring(1, 2);
          weightCont[port] = data.substring(2, 10);
          weightCont[port] = signCont[port] === '-' ? parseFloat(weightCont[port]) * -1 : parseFloat(weightCont[port]);
          //console.log(`Peso Bascula ${port}:`, weightCont[port]);
        }
      }
    });

    ports[port].on('open', function () {
      console.log("Puerto Serial Bascula ".concat(port, " Abierto"));
    });
    ports[port].on('close', function () {
      console.log("Conexi\xF3n Bascula ".concat(port, " cerrada"));
      setTimeout(function () {
        return connectSerialPort(port, COM);
      }, 5000);
    });
    ports[port].on('error', function (err) {
      console.log("Error Bascula ".concat(port, ":"), err.message);
      setTimeout(function () {
        return connectSerialPort(port, COM);
      }, 5000);
    });
  }
  return {
    requestToScale: function requestToScale(port) {
      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      //console.log(data);
      var instruction = data.instruction;
      var command = 'R';
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
    connectScale: function connectScale(port, COM, sendSocket) {
      connectSerialPort(port, COM, sendSocket);
    }
  };
}();
var _default = exports["default"] = scaleController;