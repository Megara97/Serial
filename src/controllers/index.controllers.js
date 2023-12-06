import path from 'path';
import {io} from '../index';

export const sendWeight = async (req, res) => {
  res.json({scale: 2, data: 540});
  io.emit('server:weight', {scale: 2, data: 540});
};

export const sendPage = async (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
};
