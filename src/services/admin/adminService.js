import axios from '@/services/httpRequester';

const BASE_URL = 'admin';

export const getUsers = () => {
  return axios.get(`${BASE_URL}/users`).catch((e) => e.response);
};

export const getChallenges = () => {
  return axios.get(`${BASE_URL}/challenges`).catch((e) => e.response);
};

export const getPointHistory = () => {
  return axios.get(`${BASE_URL}/point`).catch((e) => e.response);
};
