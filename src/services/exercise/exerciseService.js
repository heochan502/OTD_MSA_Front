import axios from "@/services/httpRequester";

const BASE_URL = "/exercise_record";

// 운동 기록하기
export const saveExerciseRecord = (formData) => {
  return axios.post(BASE_URL, formData).catch((e) => e.response);
};

// 운동기록 목록
export const getExerciseRecordList = (params) => {
  return axios.get(`${BASE_URL}/list`, { params }).catch((e) => e.response);
};

// 운동기록 주간 조회
export const getExerciseRecordWeekly = (params) => {
  return axios.get(`${BASE_URL}/weekly`, { params }).catch((e) => e.response);
};

// 운동기록 상세조회
export const getExerciseRecordDetail = (recordId, params) => {
  return axios
    .get(`${BASE_URL}/${recordId}`, { params })
    .catch((e) => e.response);
};

// 운동기록삭제
export const deleteExerciseRecord = (exerciseRecordId) => {
  return axios
    .delete(`${BASE_URL}?exercise_record_id=${exerciseRecordId}`)
    .catch((e) => e.response);
};

// 운동종목가져오기
export const getExercise = () => {
  return axios.get("/exercise").catch((e) => e.response);
};

// admin
export const getUserExerciseRecord = (userId) => {
  return axios.get(`${BASE_URL}/${userId}`).catch((e) => e.response);
};

// 일자별 평균 운동 소요시간
export const getAvgDuration = () => {
  return axios.get(`${BASE_URL}/average/duration`).catch((e) => e.response);
};
