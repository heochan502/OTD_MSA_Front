// src/services/community/mentService.js
import axios from '@/services/httpRequester';

const BASE = '/community';

/** 댓글 목록 */
export const fetchMents = (postId) =>
  axios.get(`${BASE}/posts/${postId}/ments`);

/** 댓글 생성 */
export const createMent = (postId, content, userId, nickName) => {
  const headers =
    userId != null
      ? { 'Content-Type': 'application/json', 'X-MEMBER-ID': String(userId) }
      : { 'Content-Type': 'application/json' };

  return axios.post(
    `${BASE}/posts/${postId}/ments`,
    { content, nickName }, // ← 닉네임 등 한글은 헤더 말고 바디로!
    { headers }
  );
};

/** 댓글 삭제 */
export const deleteMent = (mentId, userId) => {
  const headers =
    userId != null ? { 'X-MEMBER-ID': String(userId) } : undefined;

  return axios.delete(`${BASE}/ments/${mentId}`, { headers });
};
