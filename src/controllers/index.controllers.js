import path from 'path';
import ioClient from 'socket.io-client';

export const sendWeight = async (req, res) => {
  const socket = ioClient('http://localhost:3000', {
    // extraHeaders: {
    //   'Content-Type': 'application/json',
    // },
  });

  socket.on('client:weight', value => {
    console.log(value);
    res.json(value);
  });
  //res.json({scale: 3, data: 540});
};

export const sendPage = async (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
};
