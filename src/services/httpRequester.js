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

// 요청 인터셉터에서 토큰 자동 추가
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

    //  ADD 1) 네트워크/타임아웃 등 response 자체가 없을 때
    if (!err.response) {
      const messageModalStore = useMessageModalStore();
      messageModalStore.setMessage('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      return Promise.reject(err);
    }

    if (err.response) {
      console.log('err.response : ', err.response);

      //  MOVE: status는 여기(안전)
      const status = err.response.status ?? 0;

      const authenticationStore = useAuthenticationStore();

      // ADD 2) 재발급 API 자체는 어떤 코드든 재시도 금지
      const isReissue = err.config?.url?.includes('/user/reissue');
      if (isReissue) {
        authenticationStore.signOut();
        return Promise.reject(err);
      }

      // 기존 분기 유지 +  무한루프 방지 (_retry)
      if ((status === 403 || status === 401 || status=== 500 ) && authenticationStore.state.isSigned) {
        // ADD 3) 한 번만 재발급/재요청
        if (err.config._retry) {
          return Promise.reject(err);
        }
        err.config._retry = true;

        console.log('실행되는거 맞냐');

        await reissue(); // AccessToken 재발행 시도 (쿠키 기반이면 헤더 갱신 불필요)
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

    //  ADD 4) 항상 reject로 마무리
    return Promise.reject(err);
  }
);
// console.log("Axios BaseURL:", axios.defaults.baseURL);
export default axios;
