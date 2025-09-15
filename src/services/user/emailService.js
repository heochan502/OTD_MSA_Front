import axios from './HttpService';

const path = '/email';

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