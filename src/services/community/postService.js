// src/services/community/postService.js
import axios from '@/services/httpRequester';

// httpRequester에서 baseURL = {VITE_BASE_URL}/api/OTD
// → 여기서는 /community/posts 이하만 작성
const BASE = '/community/posts';

// 목록 조회 (서버 page=0 기준)
export const fetchPosts = (page = 0, size = 10, categoryKey) => {
  const params = { page, size };
  if (categoryKey) params.categoryKey = categoryKey;
  return axios.get(BASE, { params });
};

// 상세
export const fetchPostById = (postId) => axios.get(`${BASE}/${postId}`);

// 게시글 생성(JSON)
// 게이트웨이에서 사용자 정보가 주입되므로 userId, 헤더 불필요
export const createPost = (payload) => {
  return axios.post(BASE, payload);
};

// 수정
export const updatePost = (postId, payload) => {
  return axios.put(`${BASE}/${postId}`, payload);
};

// 삭제
export const deletePost = (postId) => {
  return axios.delete(`${BASE}/${postId}`);
};

export const toggleLike = (postId, userId) =>
  axios.post(`/community/posts/${postId}/likes/toggle`, null, {
    headers: {
      'Content-Type': 'application/json',
      'X-MEMBER-ID': String(userId ?? 0), // ★ 이게 꼭 들어가야 함
    },
  });
