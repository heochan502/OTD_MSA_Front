import axios from './HttpService';

const path = '/email';

export const sendEmailVerification = (data) => 
  axios.post(`${path}/send-verification`, data);

export const verifyEmailCode = (data) => 
  axios.post(`${path}/verify-code`, data);

export const sendPasswordResetCode = (data) => 
  axios.post(`${path}/send-password-reset`, data);

export const verifyPasswordResetCode = (data) => 
  axios.post(`${path}/verify-password-reset-code`, data);