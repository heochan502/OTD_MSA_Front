// import axios from 'axios';

// axios.defaults.baseURL = 'http://localhost:8080/api/OTD';

// class HttpService {}

// export default new HttpService();

import axios from 'axios';

const httpService = axios.create({
  baseURL: 'http://localhost:8080/api/OTD',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// 요청 인터셉터에서 토큰 자동 추가
httpService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken'); // JWT 토큰
    console.log('Request token:', token); // 디버깅
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export default httpService;