import axios from '@/services/httpRequester';


const path = `/email`;

// 이메일 인증관련
export const sendEmailVerification = (data) =>
  axios.post(`${path}/send-verification`, data);

export const verifyEmailCode = (data) =>
  axios.post(`${path}/verify-code`, data);

export const getEmailVerificationStatus = (email) =>
  axios.get(`${path}/verification-status/${email}`);

// 비밀번호 재설정 관련
export const sendPasswordResetCode = (data) =>
  axios.post(`${path}/send-password-reset`, data);

export const verifyPasswordResetCode = (data) =>
  axios.post(`${path}/verify-password-reset-code`, data);

export const resetPassword = (data) =>
  axios.post(`${path}/reset-password`, data);

// 아이디찾기
export const sendFindIdCode = (data) =>
  axios.post(`${path}/send-find-id-code`, data);

export const verifyFindIdCode = (data) =>
  axios.post(`${path}/verify-find-id-code`, data);

//업데이트 이메일
export const updateEmail = (email) => 
  axios.patch(`${path}/email-update`, { email });