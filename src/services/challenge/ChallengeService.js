import axios from 'axios';

const baseURL = '/challenge';

export const getAll = () => {
  return axios.get(`${baseURL}/list`).catch((e) => e.response);
};

export const getSelectedAll = (userId, year, month) => {
  console.log('test', userId, year, month);
  return axios
    .get(`${baseURL}/selected`, { params: { userId, year, month } })
    .catch((e) => e.response);
};

export const getChallenge = (keyword) => {
  return axios
    .get(`${baseURL}/addlist`, { params: { keyword } })
    .catch((e) => e.response);
};

export const getRank = (cdId, req) => {
  console.log('rank', req);
  return axios
    .get(`${baseURL}/detail/${cdId}`, { params: req })
    .catch((e) => e.response);
};
