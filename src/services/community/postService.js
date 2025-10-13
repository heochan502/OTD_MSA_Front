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
  const { data } = await axios.post(`${BASE}`, payload);
  return data; // ✅ data만 반환
};

export const updatePost = async (postId, payload) => {
  const { data } = await axios.put(`${BASE}/${postId}`, payload);
  return data;
};

export const deletePost = (postId) => axios.delete(`${BASE}/${postId}`);

export const putLifeUserProfile = (imgPath) => {
  return axios
    .put(`${BASE}/modify/profile`, { imgPath })
    .catch((e) => e.response);
};

export const updateLifeNickname = (nickname) => {
  return axios
    .put(`${BASE}/modify/nickname`, { nickname })
    .catch((e) => e.response);
};

export const updateLifeUserInfo = (jsonBody) => {
  return axios.put(`${BASE}/modify/info`, jsonBody).catch((e) => e.response);
};

export const toggleLike = (postId, userId) =>
  axios.post(`${BASE}/${postId}/likes/toggle`, null, {
    headers: {
      'Content-Type': 'application/json',
      'X-MEMBER-ID': String(userId ?? 0),
    },
  });

/**
 * 다중 파일 업로드 (files: File[])
 * 서버는 같은 키 'files'로 여러 개 받도록 구현되어 있어야 함.
 */
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

/**
 * 첨부 파일 목록 조회
 * - 기본: /community/posts/{postId}/files
 * - 폴백: /community/files?postId= (기존 백엔드 호환)
 */
export const fetchPostFiles = async (postId) => {
  try {
    return await axios.get(`${BASE}/${postId}/files`);
  } catch (e) {
    if (e?.response?.status === 404) {
      console.warn(
        '[postService] fallback -> /community/files?postId=' + postId
      );
      return await axios.get('/community/files', { params: { postId } });
    }
    throw e;
  }
};

/**
 * 첨부 파일 삭제
 * - 우선: /community/posts/{postId}/files/{fileId}
 * - 폴백: /community/files/{fileId}
 */
export const deletePostFile = async (postId, fileId, memberId) => {
  try {
    return await axios.delete(`${BASE}/${postId}/files/${fileId}`, {
      headers: { 'X-MEMBER-ID': String(memberId ?? 0) },
    });
  } catch (e) {
    if (e?.response?.status === 404) {
      console.warn(
        '[postService] delete fallback -> /community/files/' + fileId
      );
      return await axios.delete(`/community/files/${fileId}`, {
        headers: { 'X-MEMBER-ID': String(memberId ?? 0) },
      });
    }
    throw e;
  }
};
