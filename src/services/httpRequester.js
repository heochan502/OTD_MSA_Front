import axios from 'axios';

// 환경별 baseURL (dev → localhost:8080, prod → greenart.n-e.kr/otd-api)
axios.defaults.baseURL = `${import.meta.env.VITE_BASE_URL}/api/OTD`;
axios.defaults.withCredentials = true;

// const httpService = axios.create({
//   baseURL: 'http://localhost:8080/api/OTD',
//   headers: { 'Content-Type': 'application/json' },
// });

// 요청 인터셉터에서 토큰 자동 추가
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken'); // JWT 토큰
    console.log('Request token:', token); // 디버깅
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);
console.log('Axios BaseURL:', axios.defaults.baseURL);
export default axios;
