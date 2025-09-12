import axios from './HttpService';

const path = '/pass';

export const verifyPassAuth = (data) => 
  axios.post(`${path}/verify`, data);