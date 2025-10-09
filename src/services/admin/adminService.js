import axios from '@/services/httpRequester';

const BASE_URL = 'admin';

// 대시보드 페이지
export const getGender = () => {
  return axios.get(`${BASE_URL}/gender`).catch((e) => e.response);
};

export const getAgeCount = () => {
  return axios.get(`${BASE_URL}/agegroup`).catch((e) => e.response);
};

// 사용자 관리 페이지
export const getUser = () => {
  return axios.get(`${BASE_URL}/user`).catch((e) => e.response);
};

export const getUserDetail = (userId) => {
  return axios.get(`${BASE_URL}/user/${userId}`).catch((e) => e.response);
};

export const putUserProfile = (params) => {
  return axios.put(`${BASE_URL}/user/modify`, params).catch((e) => e.response);
};

export const deleteUser = (userId) => {
  return axios.delete(`${BASE_URL}/user/${userId}`).catch((e) => e.response);
};

// 챌린지 관리 페이지
export const getChallenge = () => {
  return axios.get(`${BASE_URL}/challenge`).catch((e) => e.response);
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

// 포인트 관리 페이지
export const getPointHistory = () => {
  return axios.get(`${BASE_URL}/point`).catch((e) => e.response);
};

// 문의 관리 페이지
export const getQna = () => {
  return axios.get(`${BASE_URL}/qna`).catch((e) => e.response);
};

export const putQna = (params) => {
  return axios.put(`${BASE_URL}/qna/modify`, params).catch((e) => e.response);
};
