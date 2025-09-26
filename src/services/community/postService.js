import axios from '@/services/httpRequester';

// httpRequester에서 baseURL = {VITE_BASE_URL}/api/OTD
// → 여기서는 /community/posts 이하만 작성
const BASE = '/community/posts';

// X-MEMBER-ID 헤더 유틸
const withUser = (userId, headers = {}) => ({
  ...headers,
  ...(userId ? { 'X-MEMBER-ID': String(userId) } : {}),
});

// 목록 조회 (서버 page=0 기준)
export const fetchPosts = (page = 0, size = 10, categoryKey) => {
  const params = { page, size };
  if (categoryKey) params.categoryKey = categoryKey;
  return axios.get(BASE, { params });
};

// 상세
export const fetchPostById = (postId) => axios.get(`${BASE}/${postId}`);

// JSON으로 게시글 생성 (FormData 아님)
export const createPost = (payload, userId) =>
  axios.post(`${BASE}`, payload, {
    headers: withUser(userId, { 'Content-Type': 'application/json' }),
  });

// 수정
export const updatePost = (postId, payload, userId) =>
  axios.put(`${BASE}/${postId}`, payload, {
    headers: withUser(userId, { 'Content-Type': 'application/json' }),
  });

// 삭제
export const deletePost = (postId, userId) =>
  axios.delete(`${BASE}/${postId}`, { headers: withUser(userId) });

// (서버에 있을 때만) 좋아요 토글 – 필요 없으면 제거해도 됨
export const toggleLike = (postId, userId) =>
  axios.post(`${BASE}/${postId}/likes/toggle`, null, {
    headers: withUser(userId),
  });
