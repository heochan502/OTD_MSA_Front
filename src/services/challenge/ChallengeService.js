import axios from 'axios';

axios.defaults.baseURL = '/api/OTD/challenge';

export const getAll = () => {
  return axios.get().catch((e) => e.response);
};

export const getSelectedAll = (userId, year, month) => {
  console.log('test', userId, year, month)
  return axios
    .get('/selected', { params: { userId, year, month } })
    .catch((e) => e.response);
};

export const getChallenge = (keyword) => {
  return axios.get('list', { params: { keyword } }).catch((e) => e.response);
};
