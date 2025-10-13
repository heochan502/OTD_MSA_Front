// src/services/community/postService.js
import axios from '@/services/httpRequester';

const BASE = '/community/posts';

export const fetchPosts = (page = 0, size = 10, categoryKey) => {
  const params = { page, size };
  if (categoryKey) params.categoryKey = categoryKey;
  return axios.get(BASE, { params });
};

export const fetchPostById = (postId) => axios.get(`${BASE}/${postId}`);

export const createPost = async (payload) => {
  const { data } = await axios.post('/community/posts', payload);
  return data; // ✅ data만 반환
};

export const updatePost = async (postId, payload) => {
  const { data } = await axios.put(`${BASE}/${postId}`, payload);
  return data;
};

export const deletePost = (postId) => axios.delete(`${BASE}/${postId}`);

export const toggleLike = (postId, userId) =>
  axios.post(`${BASE}/${postId}/likes/toggle`, null, {
    headers: {
      'Content-Type': 'application/json',
      'X-MEMBER-ID': String(userId ?? 0),
    },
  });

export const uploadPostFiles = async (postId, files, memberId) => {
  const fd = new FormData();
  files.forEach((f) => fd.append('files', f));
  const { data } = await axios.post(`${BASE}/${postId}/files`, fd, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'X-MEMBER-ID': String(memberId ?? 0),
    },
    onUploadProgress: (e) => {
      const pct = e.total ? Math.round((e.loaded * 100) / e.total) : 0;
      console.info('[uploadPostFiles] progress', pct, '%');
    },
  });
  return data;
};

export const fetchPostFiles = (postId) => axios.get(`${BASE}/${postId}/files`);

export const putLifeUserProfile = (imgPath) => {
  return axios
    .put(`${BASE}/modify/profile`, { imgPath })
    .catch((e) => e.response);
};
