import { defineStore } from 'pinia';
import {
  fetchPosts,
  fetchPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
} from '@/services/community/postService';

// ------------------------------
// Demo data generator
// ------------------------------
function generateDemoPosts() {
  const categories = ['free', 'diet', 'work', 'love'];
  const demo = [];
  let idCounter = 1;

  categories.forEach((cat) => {
    for (let i = 1; i <= 15; i++) {
      demo.push({
        postId: idCounter++,
        category: cat,
        title: `[${cat}] 더미 게시글 ${i}`,
        content: `${cat} 카테고리의 테스트 내용 ${i}`,
        likes: Math.floor(Math.random() * 30), // 0~29
        comments: Math.floor(Math.random() * 10), // 0~9
        writer: {
          nickName: `${cat}작성자${i}`,
          memberNoLogin: i,
          memberImg: '/image/main/test.png',
        },
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
  });
  return demo;
}

// ------------------------------
// Normalizer: 어떤 형태의 게시물도
// 공통 키로 매핑해서 반환
// ------------------------------
function normalizePost(p) {
  if (!p) return null;
  const id = p.postId ?? p.id;
  return {
    // 공통 필드 (뷰들이 기대하는 이름)
    id,
    category: p.category ?? '',
    title: p.title ?? '',
    content: p.content ?? '',
    author: p.author ?? p.writer?.nickName ?? '익명',
    time: p.time ?? p.createdAt ?? '',
    likes: p.likes ?? p.like ?? 0,
    comments: p.comments ?? 0,
    avatar: p.avatar ?? p.writer?.memberImg ?? '',
    // 원본도 필요하면 같이 보관
    _raw: p,
  };
}

export const useCommunityStore = defineStore('community', {
  state: () => ({
    posts: [], // 서버에서 받은 원본 목록
    selectedPost: null, // 정규화된 단건
    viewMode: 'list',
    loading: false,
    error: null,
    page: 1,
    size: 10,
    total: 0,
    searchText: '',
    demoPosts: generateDemoPosts(), // 로컬 더미
  }),

  getters: {
    // 카테고리별 정규화 리스트
    list: (state) => (category) => {
      const src =
        Array.isArray(state.posts) && state.posts.length > 0
          ? state.posts
          : state.demoPosts;
      return src.filter((p) => p?.category === category).map(normalizePost);
    },

    // 전체 정규화 리스트
    allNormalized: (state) => {
      const src =
        Array.isArray(state.posts) && state.posts.length > 0
          ? state.posts
          : state.demoPosts;
      return src.map(normalizePost);
    },

    // ✅ 상세뷰에서 쓰는 것: id로 정규화 데이터 반환
    getById: (state) => (idLike) => {
      const idStr = String(idLike);
      const src =
        Array.isArray(state.posts) && state.posts.length > 0
          ? state.posts
          : state.demoPosts;
      const found = src.find((p) => String(p.postId ?? p.id) === idStr) ?? null;
      return normalizePost(found);
    },

    // 필요시 원본도 제공
    getByIdRaw: (state) => (idLike) => {
      const idStr = String(idLike);
      const src =
        Array.isArray(state.posts) && state.posts.length > 0
          ? state.posts
          : state.demoPosts;
      return src.find((p) => String(p.postId ?? p.id) === idStr) ?? null;
    },
  },

  actions: {
    async loadPosts(page = 1, size = 10, searchText = '') {
      this.loading = true;
      this.error = null;
      try {
        const res = await fetchPosts(page, size, searchText);
        const raw = res.data?.content ?? res.data ?? [];
        this.posts =
          Array.isArray(raw) && raw.length > 0 ? raw : this.demoPosts;
        this.page = page;
        this.size = size;
        this.total = res.data?.totalElements ?? this.posts.length;
      } catch (err) {
        // 실패시 더미로 폴백
        this.posts = this.demoPosts;
        this.total = this.demoPosts.length;
        this.error = err;
      } finally {
        this.loading = false;
      }
    },

    async loadPostDetail(idLike) {
      this.loading = true;
      this.error = null;
      try {
        const idStr = String(idLike);
        const res = await fetchPostById(idStr);
        const raw = res?.data ?? this.getByIdRaw(idStr);
        this.selectedPost = normalizePost(raw);
        this.viewMode = 'detail';
      } catch (err) {
        // 서버 실패 시에도 로컬에서라도 보여주기
        const fallback = this.getByIdRaw(idLike);
        this.selectedPost = normalizePost(fallback);
        this.error = err;
      } finally {
        this.loading = false;
      }
    },

    async createNewPost(formData) {
      try {
        const res = await createPost(formData);
        await this.loadPosts(this.page, this.size, this.searchText);
        this.viewMode = 'list';
        return res;
      } catch (err) {
        this.error = err;
        throw err;
      }
    },

    async updateExistingPost(postId, formData) {
      try {
        const res = await updatePost(postId, formData);
        await this.loadPosts(this.page, this.size, this.searchText);
        this.viewMode = 'list';
        return res;
      } catch (err) {
        this.error = err;
        throw err;
      }
    },

    async removePost(postId) {
      try {
        await deletePost(postId);
        // 목록/선택 모두 갱신
        this.posts = this.posts.filter((p) => (p.postId ?? p.id) !== postId);
        if (this.selectedPost?.id === postId) this.selectedPost = null;
        this.viewMode = 'list';
      } catch (err) {
        this.error = err;
      }
    },

    async toggleLike(postId) {
      try {
        const res = await toggleLike(postId);
        const likeCount = res.data?.likeCount ?? res.data?.likes ?? null;
        const liked = res.data?.liked ?? undefined;

        // 목록 갱신(원본 배열 수정)
        const idx = this.posts.findIndex((p) => (p.postId ?? p.id) === postId);
        if (idx !== -1 && likeCount !== null) {
          this.posts[idx] = { ...this.posts[idx], likes: likeCount };
        }

        // 선택 항목 갱신(정규화된 selectedPost)
        if (this.selectedPost?.id === postId && likeCount !== null) {
          this.selectedPost = { ...this.selectedPost, likes: likeCount };
          if (typeof liked === 'boolean') {
            this.selectedPost.liked = liked;
          }
        }
      } catch (err) {
        this.error = err;
      }
    },

    setViewMode(mode) {
      this.viewMode = mode;
    },
  },

  persist: true,
});
