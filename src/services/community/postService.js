import axios from '@/services/httpRequester';

const BASE = '/api/v1/community/posts';

// 공통 헤더 주입 (userId 있을 때만 추가)
const withUser = (userId, headers = {}) => ({
  ...headers,
  ...(userId ? { 'X-MEMBER-ID': String(userId) } : {}),
});

// 📌 게시글 목록 조회
export const fetchPosts = (page = 1, size = 10, searchText = '') => {
  return axios.get(BASE, { params: { page, size, searchText } });
};

// 📌 게시글 상세 조회
export const fetchPostById = (postId) => {
  return axios.get(`${BASE}/${postId}`);
};

// 📌 게시글 생성 (JSON)
export const createPostJson = (payload, userId) => {
  return axios.post(`${BASE}`, payload, {
    headers: withUser(userId, { 'Content-Type': 'application/json' }),
  });
};

// 📌 게시글 파일 업로드 (Multipart)
export const uploadPostFiles = (postId, files, userId) => {
  const fd = new FormData();
  files.forEach((f) => fd.append('files', f));
  return axios.post(`${BASE}/${postId}/files`, fd, {
    headers: withUser(userId),
  });
};

// 📌 통합 게시글 생성 (글 JSON + 파일 업로드)
export const createPost = async (formData, userId) => {
  const payload = {
    category: String(formData.get('category') || 'free'),
    title: String(formData.get('title') || ''),
    content: String(formData.get('content') || ''),
  };

  // 글 저장
  const { data: post } = await createPostJson(payload, userId);

  // 파일 있으면 업로드
  const files = formData.getAll('files').filter(Boolean);
  if (files.length > 0) {
    await uploadPostFiles(post.postId || post.id, files, userId);
  }

  return post;
};

// 📌 게시글 수정
export const updatePost = (postId, payload, userId) => {
  return axios.put(`${BASE}/${postId}`, payload, {
    headers: withUser(userId, { 'Content-Type': 'application/json' }),
  });
};

// 📌 게시글 삭제
export const deletePost = (postId, userId) => {
  return axios.delete(`${BASE}/${postId}`, {
    headers: withUser(userId),
  });
};

// 📌 좋아요 토글
export const toggleLike = (postId, userId) => {
  return axios.post(`${BASE}/${postId}/like`, null, {
    headers: withUser(userId),
  });
};

// 📌 인기 게시글 조회 (선택 사항)
export const fetchPopularPosts = () => {
  return axios.get(`${BASE}/popular`);
};
