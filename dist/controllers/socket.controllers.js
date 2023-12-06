"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _socket = _interopRequireDefault(require("socket.io-client"));
var _config = _interopRequireDefault(require("../config"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
var socketController = function () {
  var socketClient = (0, _socket["default"])(_config["default"].HOST_SERVER_SOCKET, {
    extraHeaders: {
      'Content-Type': 'application/json'
    }
  });
  socketClient.on('connect', function () {
    socketClient.emit('joinRoom', 'scales_164');
  });
  socketClient.on('connect_error', function (error) {
    console.log('Connection error:', error.message);
  });
  return {
    channelListening: function channelListening(handleScaleData) {
      socketClient.on('client:weight', function (data) {
        handleScaleData(data);
      });
    },
    channelWrite: function channelWrite(data) {
      //console.log(data);
      socketClient.emit('server:weight', data);
    }
  };
}();
var _default = exports["default"] = socketController;