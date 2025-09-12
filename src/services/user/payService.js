import axios from './HttpService';

const path = '/pay';

export const postPayReady = () => axios.post(`${path}/ready`);

export const getPayApprove = (params) =>
  axios.get(`${path}/approve`, { params });
