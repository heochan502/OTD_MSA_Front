import axios from 'axios';

axios.defaults.baseURL = '/api/OTD/challenge';

export const getAll = () => {
  return axios.get().catch((e) => e.response);
};

export const getSelectedAll = () => {
  return axios.get('/selected').catch((e) => e.response);
};
