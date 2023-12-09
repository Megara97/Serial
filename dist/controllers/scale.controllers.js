"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _serialport = require("serialport");
var _index = require("../index");
var _socket = require("./socket.controllers");
var scaleController = function () {
  var ports = [];
  var parsers = [];
  var weight = [];
  var weightCont = [];
  var sign = [];
  var signCont = [];
  var prevData = 0;
  var time;
  var startHour = 6;
  var endHour = 20;
  var now = new Date();
  function sendCommandToScale(port, command) {
    ports[port].write(command, function (err) {
      if (err) {
        console.error('Error al enviar comando:', err.message);
      } else {
        console.log('Comando enviado con éxito');
      }
    });
  }
  function connectSerialPort(port, COM) {
    ports[port] = new _serialport.SerialPort({
      path: COM,
      baudRate: 9600
    });
    //parsers[port] = new ReadlineParser({delimiter: 'g\r\n'}); //BASCULAS INICIALES
    parsers[port] = new _serialport.ReadlineParser({
      delimiter: '\r\n'
    }); //BASCULA FINAL
    ports[port].pipe(parsers[port]);
    parsers[port].on('data', function (data) {
      //console.log(`Respuesta Bascula ${port}:\n${data.toString()}`);
      if (port != 3) {
        //BASCULAS INICIALES
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
          (0, _socket.postDataScale)(port, weightCont[port]); //Web Socket
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
        //BASCULA FINAL
        var dataParse = data.toString().split(' ');
        dataParse = dataParse[dataParse.length - 1].split('kg')[0];
        dataParse = parseFloat(dataParse);
        now = new Date();
        if (parseFloat(prevData) != parseFloat(dataParse) && dataParse >= 0 && now.getHours() >= startHour && now.getHours() <= endHour) {
          clearTimeout(time);
          //console.log(prevData, dataParse)
          time = setTimeout(function () {
            console.log("".concat(now.toLocaleString(), " Peso Bascula ").concat(port, ":"), dataParse);
            //console.log(dataParse, port)
            (0, _socket.postDataScale)(port, dataParse); //Web Socket
            _index.io.emit('server:weight', {
              scale: port,
              data: dataParse
            }); //Socket local
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

    ports[port].on('open', function () {
      console.log("Puerto serial Bascula ".concat(port, " abierto"));
    });
    ports[port].on('close', function () {
      console.log("Conexi\xF3n Bascula ".concat(port, " cerrada"));
      setTimeout(function () {
        return connectSerialPort(port, COM);
      }, 5000);
    });
    ports[port].on('error', function (err) {
      now = new Date().toLocaleString();
      console.log("".concat(now, " Error Bascula ").concat(port, ":"), err.message);
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
    connectScale: function connectScale(port, COM) {
      connectSerialPort(port, COM);
    }
  };
}();
var _default = exports["default"] = scaleController;