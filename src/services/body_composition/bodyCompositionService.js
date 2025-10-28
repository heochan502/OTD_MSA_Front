import axios from "@/services/httpRequester";

const BASE_URL = "/body_composition";

export const saveUserBasicBodyInfo = (formData) => {
  // console.log("formData : ", formData);
  return axios.post(BASE_URL, formData).catch((e) => e.response);
};

export const getUserBasicBodyInfo = () => {
  return axios.get(`${BASE_URL}/basic`).catch((e) => e.response);
};

export const getLastestBodyComposition = () => {
  return axios.get(`${BASE_URL}/lastest`).catch((e) => e.response);
};

// 체성분 변화 그래프를 위한 데이터
export const getSeries = (jsonBody) => {
  // console.log("series : ", jsonBody);
  return axios.get(`${BASE_URL}/series`, jsonBody).catch((e) => e.response);
};

// 체성분 기록 목록 조회(조회 범위 설정 시 사용)
export const getList = (params) => {
  return axios.get(`${BASE_URL}/list`, { params }).catch((e) => e.response);
};

// metirics 조회
export const getMetrics = () => {
  return axios.get(`${BASE_URL}`).catch((e) => e.response);
};
