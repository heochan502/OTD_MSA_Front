import axios from 'axios';

const path = '/pass';

export const verifyPassAuth = (data) => 
  axios.post(`${path}/verify`, data);