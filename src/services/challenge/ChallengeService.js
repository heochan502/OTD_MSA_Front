import axios from '@/services/httpRequester';

const BASE_URL = 'challenge';

export const getAll = () => {
  return axios.get(`${BASE_URL}/list`).catch((e) => e.response);
};

export const getSelectedAll = (year, month) => {
  return axios
    .get(`${BASE_URL}/selected`, { params: { year, month } })
    .catch((e) => e.response);
};

export const getChallenge = (userId, year, month, type) => {
  return axios
    .get(`${BASE_URL}/addlist`, { params: { userId, year, month, type } })
    .catch((e) => e.response);
};

export const getMapChallenge = (userId, year, month, type) => {
  return axios
    .get(`${BASE_URL}/addcompetitionlist`, {
      params: { userId, year, month, type },
    })
    .catch((e) => e.response);
};

export const getRank = (cdId, req) => {
  return axios
    .get(`${BASE_URL}/detail/per/${cdId}`, { params: req })
    .catch((e) => e.response);
};

export const getDay = (cdId, req) => {
  return axios
    .get(`${BASE_URL}/detail/day/${cdId}`, { params: req })
    .catch((e) => e.response);
};

export const putSuccess = (cpId) => {
  return axios.put(`${BASE_URL}/success`, { cpId }).catch((e) => e.response);
};

export const postMissionRecord = (userId, cdId) => {
  return axios
    .post(`${BASE_URL}/record/mission`, { userId, cdId })
    .catch((e) => e.response);
};

export const postChallenge = (params) => {
  return axios.post(`${BASE_URL}/add`, params).catch((e) => e.response);
};
