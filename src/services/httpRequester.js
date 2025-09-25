import axios from 'axios';
import { useAuthenticationStore } from '@/stores/user/authentication';
import { reissue } from './user/userService';

import { useMessageModalStore } from '@/stores/messageModal';


// 환경별 baseURL (dev → localhost:8080, prod → greenart.n-e.kr/otd-api)
axios.defaults.baseURL = `${import.meta.env.VITE_BASE_URL}/api/OTD`;
axios.defaults.withCredentials = true;

const BASE_URL = import.meta.env.VITE_BASE_URL;
// const httpService = axios.create({
//   baseURL: 'http://localhost:8080/api/OTD',
//   headers: { 'Content-Type': 'application/json' },
// });

// //요청 인터셉터에서 토큰 자동 추가
// axios.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('accessToken'); // JWT 토큰
//     console.log('Request token:', token); // 디버깅
//     if (token) config.headers.Authorization = `Bearer ${token}`;
//     return config;
//   },
//   (error) => Promise.reject(error)
// );
// axios.interceptors.request.use(
//   (config) => {
//     // 쿠키 자동 전송만 사용
//     return config;
//   },
//   (error) => Promise.reject(error)
// );
axios.interceptors.response.use(
  (res) => {
    return res;
  },
  async (err) => {
    console.log('err: ', err);
    if (err.response) {
      console.log('err.response : ', err.response);
      const authenticationStore = useAuthenticationStore();
      if (
        err.config.url === `${BASE_URL}/user/reissue` &&
        err.response.status === 500
      ) {
        authenticationStore.signOut();
      } else if (err.response.status === 403 && authenticationStore.state.isSigned) {
        //401 UnAuthorized 에러인데 FE 로그인 처리 되어 있다면


        await reissue(); //AccessToken 재발행 시도

        // 중단된 요청을(에러난 요청)을 토큰 갱신 후 재요청
        return await axios.request(err.config);
      } else {
        const message = err.response.data?.message
          ? err.response.data?.message
          : err.response.data;
        const messageModalStore = useMessageModalStore();
        messageModalStore.setMessage(message);
      }
    }
    return Promise.reject(err);
  }
);
// console.log("Axios BaseURL:", axios.defaults.baseURL);
export default axios;
