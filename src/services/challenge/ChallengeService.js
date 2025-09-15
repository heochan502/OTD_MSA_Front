import axios from 'axios';

const baseURL = '/challenge';

export const getAll = () => {
  return axios.get(`${baseURL}/list`).catch((e) => e.response);
};

export const getSelectedAll = (userId, year, month) => {
  return axios
    .get(`${baseURL}/selected`, { params: { userId, year, month } })
    .catch((e) => e.response);
};

export const getChallenge = (userId, year, month, type) => {
  return axios
    .get(`${baseURL}/addlist`, { params: { userId,  year, month, type } })
    .catch((e) => e.response);
};

export const getMapChallenge = (userId, year, month, type) => {
  return axios
    .get(`${baseURL}/addCompetitionlist`, { params: { userId,  year, month, type } })
    .catch((e) => e.response);
};
