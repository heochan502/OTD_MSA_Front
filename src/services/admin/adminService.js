import axios from '@/services/httpRequester';

const BASE_URL = 'admin';

export const getUser = () => {
  return axios.get(`${BASE_URL}/user`).catch((e) => e.response);
};

export const getChallenge = () => {
  return axios.get(`${BASE_URL}/challenge`).catch((e) => e.response);
};

export const getPointHistory = () => {
  return axios.get(`${BASE_URL}/point`).catch((e) => e.response);
};

export const getUserDetail = (userId) => {
  return axios.get(`${BASE_URL}/user/${userId}`).catch((e) => e.response);
};

export const getGender = () => {
  return axios.get(`${BASE_URL}/gender`).catch((e) => e.response);
};

export const getAgeCount = () => {
  return axios.get(`${BASE_URL}/agegroup`).catch((e) => e.response);
};

export const getQnA = () => {
  return axios.get(`${BASE_URL}/qna`).catch((e) => e.response);
};

export const postChallenge = (params) => {
  return axios
    .post(`${BASE_URL}/challenge/add`, params)
    .catch((e) => e.response);
};

export const putChallenge = (params) => {
  return axios
    .put(`${BASE_URL}/challenge/modify`, params)
    .catch((e) => e.response);
};

export const deleteChallenge = (cdId) => {
  return axios.delete(`${BASE_URL}/challenge/${cdId}`).catch((e) => e.response);
};
