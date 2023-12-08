import config from '../config';
import axios from 'axios';

const scales = {
  Bafar: '164',
  //Bafar: '1', //Socket de prueba
};

export const postDataScale = async (port, weight) => {
  try {
    const res = await axios.post(config.HOST_SERVER_SOCKET + '/scale/weight', {
      items: {
        company_id: scales['Bafar'],
        data: {
          scale: port,
          data: weight,
        },
      },
    });
    //console.log(res.data);
    return await res.data;
  } catch (error) {
    const currentDate = new Date().toLocaleString();
    console.log(currentDate, error);
  }
};
