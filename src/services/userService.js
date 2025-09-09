import axios from './HttpService';

const path = '/user';

export const join = (data) => axios.post(`${path}/join`, data);

export const login = (data) => axios.post(`${path}/login`, data);

export const logout = () => axios.post(`${path}/logout`);

export const reissue = (data) => axios.post(`${path}/reissue`, data);

export const getUserProfile = (params) =>
  axios.get(`${path}/profile`, { params });

export const patchUserProfilePic = (data) =>
  axios.patch(`${path}/profile/pic`, data);

export const deleteUserProfilePic = () => axios.delete(`${path}/profile/pic`);
