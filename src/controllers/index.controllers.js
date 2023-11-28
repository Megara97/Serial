import path from 'path';

export const sendWeight = async (req, res) => {
  res.json({scale: 'Bascula 3', data: 50});
};

export const sendPage = async (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
};
