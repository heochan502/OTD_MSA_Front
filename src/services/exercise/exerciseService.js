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

// 운동기록 상세조회
export const getExerciseRecordDetail = (recordId) => {
  return axios.get(`${BASE_URL}/${recordId}`).catch((e) => e.response);
};

// 운동기록삭제
export const deleteExerciseRecord = (recordId) => {
  return axios.delete(BASE_URL, recordId).catch((e) => e.response);
};

// 운동종목가져오기
export const getExercise = () => {
  return axios.get("/exercise").catch((e) => e.response);
};
