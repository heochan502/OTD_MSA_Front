import axios from "axios";

const baseURL = "/exercise_record";

// 운동 기록하기
export const saveExerciseRecord = (formData) => {
  return axios.post(baseURL, formData).catch((e) => e.response);
};

// 운동기록 목록
export const getExerciseRecordList = (params) => {
  return axios.get(baseURL, params).catch((e) => e.response);
};

// 운동기록 상세조회
export const getExerciseRecordDetail = (recordId) => {
  return axios.get(`${baseURL}/${recordId}`).catch((e) => e.response);
};

// 운동기록삭제
export const deleteExerciseRecord = (recordId) => {
  return axios.delete(baseURL, recordId).catch((e) => e.response);
};
