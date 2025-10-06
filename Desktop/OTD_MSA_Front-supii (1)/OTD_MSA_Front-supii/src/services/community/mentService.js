import axios from '@/services/httpRequester';

const BASE = '/community';
const withUser = (userId, headers = {}) => ({
  ...headers,
  'Content-Type': 'application/json',
  'X-MEMBER-ID': String(userId ?? 0),
});

export const fetchMents = (postId) =>
  axios.get(`${BASE}/posts/${postId}/ments`);

export const createMent = (postId, content, userId) =>
  axios.post(
    `${BASE}/posts/${postId}/ments`,
    { content },
    {
      headers: withUser(userId),
    }
  );

export const deleteMent = (mentId, userId) =>
  axios.delete(`${BASE}/ments/${mentId}`, {
    headers: withUser(userId),
  });
