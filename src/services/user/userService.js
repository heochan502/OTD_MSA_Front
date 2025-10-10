import axios from '@/services/httpRequester';

const path = `/user`;

// 인증 관련
export const join = (data) => axios.post(`${path}/join`, data);

export const login = (data) => axios.post(`${path}/login`, data);

export const logout = () => axios.post(`${path}/logout`);

export const reissue = () =>
  axios.post(`/user/reissue`, null, { withCredentials: true });

// 프로필 관련
export const getUserProfile = () => axios.get(`${path}/profile`);

export const patchUserProfilePic = (data) =>
  axios.patch(`${path}/profile/pic`, data);

export const deleteUserProfilePic = () => axios.delete(`${path}/profile/pic`);

// 중복 체크 관련
export const checkUidDuplicate = (uid) => axios.get(`${path}/check-uid/${uid}`);

export const checkNicknameDuplicate = (nickname) =>
  axios.get(`${path}/check-nickname/${nickname}`);

export const checkDuplicateUser = (data) =>
  axios.post(`${path}/check-duplicate`, data);

// 업데이트 관련
export const updateNickname = (nickname) => 
  axios.patch(`${path}/nickname`, { nickname });


// 비밀번호 관련
export const changePassword = (data) => axios.patch(`${path}/password`, data);

export const getPointHistory = (userId) => axios.get(`${path}/pointhistory/${userId}`);

export const deleteUser = (userId) => {
  return axios
    .delete(`${path}/account`, { userId })
    .catch((e) => e.response);
};

export const getSelectedAll = () => axios.get(`${path}/missions/complete`);