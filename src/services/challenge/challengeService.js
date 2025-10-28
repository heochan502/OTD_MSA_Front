import axios from '@/services/httpRequester';

const BASE_URL = 'challenge';

export const getAll = () => {
  return axios.get(`${BASE_URL}/list`).catch((e) => e.response);
};

export const getSelectedAll = () => {
  return axios.get(`${BASE_URL}/selected`).catch((e) => e.response);
};

export const getChallenge = (type) => {
  return axios
    .get(`${BASE_URL}/addlist`, { params: { type } })
    .catch((e) => e.response);
};

export const getChallengeList = (type) => {
  return axios
    .get(`${BASE_URL}/addlist`, { params: { type } })
    .catch((e) => e.response);
};

export const getCompetitionList = (type) => {
  return axios
    .get(`${BASE_URL}/addcompetitionlist`, {
      params: { type },
    })
    .catch((e) => e.response);
};

export const getRank = (cdId) => {
  return axios.get(`${BASE_URL}/detail/per/${cdId}`).catch((e) => e.response);
};

export const getDay = (cdId) => {
  return axios.get(`${BASE_URL}/detail/day/${cdId}`).catch((e) => e.response);
};

export const putSuccess = (cpId) => {
  return axios.put(`${BASE_URL}/success`, { cpId }).catch((e) => e.response);
};

export const postMissionRecord = (cdId) => {
  return axios
    .post(`${BASE_URL}/record/mission`, { cdId })
    .catch((e) => e.response);
};

export const postChallenge = (params) => {
  return axios.post(`${BASE_URL}/add`, params).catch((e) => e.response);
};

export const settlement = (params) => {
  return axios.post(`${BASE_URL}/settlement`, params).catch((e) => e.response);
};

export const getChallengeSettlementLog = (params) => {
  return axios
    .get(`${BASE_URL}/settlement/log`, { params })
    .catch((e) => e.response);
};

export const getMyChallenge = () => {
  return axios.get(`${BASE_URL}/home`).catch((e) => e.response);
};
