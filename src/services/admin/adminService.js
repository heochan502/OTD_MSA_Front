import axios from '@/services/httpRequester';
import Inquiry from '@/views/user/Inquiry.vue';

const BASE_URL = 'admin';
const LIFE_URL = 'admin2';

// 대시보드
export const getUserData = () => {
  return axios.get(`${BASE_URL}/dash/user`).catch((e) => e.response);
};

export const getChallengeData = () => {
  return axios.get(`${BASE_URL}/dash/challenge`).catch((e) => e.response);
};

export const getPointData = () => {
  return axios.get(`${BASE_URL}/dash/point`).catch((e) => e.response);
};

export const getInquiryData = () => {
  return axios.get(`${BASE_URL}/dash/inquiry`).catch((e) => e.response);
};

// 사용자 관리 페이지
export const getUser = () => {
  return axios.get(`${BASE_URL}/user`).catch((e) => e.response);
};

export const getUserDetail = (userId) => {
  return axios.get(`${BASE_URL}/user/${userId}`).catch((e) => e.response);
};

export const putUserProfile = (params) => {
  return axios.put(`${BASE_URL}/user/modify`, params).catch((e) => e.response);
};

export const deleteUser = (userId) => {
  return axios.delete(`${BASE_URL}/user/${userId}`).catch((e) => e.response);
};

// 챌린지 관리 페이지
export const getChallenge = () => {
  return axios.get(`${BASE_URL}/challenge`).catch((e) => e.response);
};

export const postChallenge = (formData) => {
  return axios
    .post(`${BASE_URL}/challenge/add`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .catch((e) => e.response);
};

export const putChallenge = (formData) => {
  return axios
    .put(`${BASE_URL}/challenge/modify`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .catch((e) => e.response);
};

export const deleteChallenge = (cdId) => {
  return axios.delete(`${BASE_URL}/challenge/${cdId}`).catch((e) => e.response);
};

// 포인트 관리 페이지
export const getPointHistory = () => {
  return axios.get(`${BASE_URL}/point`).catch((e) => e.response);
};

// 통계페이지
export const getUserStatistics = () => {
  return axios.get(`${BASE_URL}/statistics/user`).catch((e) => e.response);
};

export const getChallengeStatistics = () => {
  return axios.get(`${BASE_URL}/statistics/challenge`).catch((e) => e.response);
};

export const getInquiryStatistics = () => {
  return axios.get(`${BASE_URL}/statistics/inquiry`).catch((e) => e.response);
};

export const getGender = () => {
  return axios.get(`${BASE_URL}/gender`).catch((e) => e.response);
};

export const getAgeCount = () => {
  return axios.get(`${BASE_URL}/agegroup`).catch((e) => e.response);
};

export const getTier = () => {
  return axios.get(`${BASE_URL}/tier`).catch((e) => e.response);
};

export const getChallengeRate = () => {
  return axios.get(`${BASE_URL}/challengerate`).catch((e) => e.response);
};

export const getSignInCount = () => {
  return axios.get(`${BASE_URL}/signin`).catch((e) => e.response);
};

// 문의 관리 페이지
export const getQna = () => {
  return axios.get(`${BASE_URL}/qna`).catch((e) => e.response);
};

export const getQnaDetail = (inquiryId) => {
  return axios.get(`${BASE_URL}/qna/${inquiryId}`).catch((e) => e.response);
};

export const putQna = (params) => {
  return axios.put(`${BASE_URL}/qna/modify`, params).catch((e) => e.response);
};


// life 서버
// 유저 디테일 식단 기록
export const getUserMealRecord = (userId) => {
  return axios.get(`${LIFE_URL}/meal/${userId}`).catch((e) => e.response);
};

// 유저 디테일 식단 기록 디테일
export const getUserMealDetail = (params) => {
  console.log('params2', params);
  return axios
    .get(`${LIFE_URL}/meal/detail`, { params })
    .catch((e) => e.response);
};

// 유저 디테일 운동 기록
export const getUserExerciseRecord = (userId) => {
  return axios.get(`${LIFE_URL}/exercise/${userId}`).catch((e) => e.response);
};

// 커뮤니티 목록
export const getCommunity = () => {
  return axios.get(`${LIFE_URL}/community`).catch((e) => e.response);
};

// 커뮤니티 디테일
export const getCommunityDetail = (postId) => {
  return axios.get(`${LIFE_URL}/community/${postId}`).catch((e) => e.response);
};

// 커뮤니티 글 삭제
export const deleteCommunity = (postId) => {
  return axios
    .delete(`${LIFE_URL}/community/${postId}`)
    .catch((e) => e.response);
};

// 커뮤니티 댓글 삭제
export const deleteComment = (commentId) => {
  return axios
    .delete(`${LIFE_URL}/community/comment/${commentId}`)
    .catch((e) => e.response);
};

// 커뮤니티 사진 삭제
export const deleteFile = (fileId) => {
  return axios
    .delete(`${LIFE_URL}/community/file/${fileId}`)
    .catch((e) => e.response);
};

// 게시글 대시보드
export const getCommunityData = () => {
  return axios.get(`${LIFE_URL}/dash/community`).catch((e) => e.response);
};

// 운동기록 대시보드
export const getExerciseData = () => {
  return axios.get(`${LIFE_URL}/dash/exercise`).catch((e) => e.response);
};

// 식단기록 대시보드
export const getMealData = () => {
  return axios.get(`${LIFE_URL}/dash/meal`).catch((e) => e.response);
};

// 게시글 통계
export const getCommunityStatistics = () => {
  return axios.get(`${LIFE_URL}/statistics/community`).catch((e) => e.response);
};

// 운동기록 통계
export const getExerciseStatistics = () => {
  return axios.get(`${LIFE_URL}/statistics/exercise`).catch((e) => e.response);
};

// 식단기록 통계
export const getMealStatistics = () => {
  return axios.get(`${LIFE_URL}/statistics/meal`).catch((e) => e.response);
};

// 운동 종목 목록
export const getExercise = () => {
  return axios.get(`${LIFE_URL}/exercise`).catch((e) => e.response);
};

export const postExercise = (exercise) => {
  return axios.post(`${LIFE_URL}/exercise`, exercise).catch((e) => e.response);
};

export const putExercise = (exerciseId, exercise) => {
  return axios
    .put(`${LIFE_URL}/exercise/${exerciseId}`, exercise)
    .catch((e) => e.response);
};

export const deleteExercise = (exerciseId) => {
  return axios
    .delete(`${LIFE_URL}/exercise/${exerciseId}`)
    .catch((e) => e.response);
};

// 음식 정보 목록
export const getMeals = (page = 0, size = 50, keyword = '') => {
  return axios
    .get(`${LIFE_URL}/meal`, { params: { page, size, keyword } })
    .catch((e) => e.response);
};

export const postMeal = (food) => {
  return axios.post(`${LIFE_URL}/meal`, food).catch((e) => e.response);
};

export const putMeal = (mealId, food) => {
  return axios.put(`${LIFE_URL}/meal/${mealId}`, food).catch((e) => e.response);
};

export const deleteMeal = (mealId) => {
  return axios.delete(`${LIFE_URL}/meal/${mealId}`).catch((e) => e.response);
};

export const deleteMealMake = (mealId) => {
  return axios
    .delete(`${LIFE_URL}/mealmake/${mealId}`)
    .catch((e) => e.response);
};
