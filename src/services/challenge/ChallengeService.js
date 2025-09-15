import axios from 'axios';

axios.defaults.baseURL = '/api/OTD/challenge';

export const getAll = () => {
  return axios.get().catch((e) => e.response);
};

export const getSelectedAll = (userId) => {
  return axios
    .get('/selected', { params: { userId } })
    .catch((e) => e.response);
};

export const getChallenge = (keyword) => {
  return axios.get('list', { params: { keyword } }).catch((e) => e.response);
};
