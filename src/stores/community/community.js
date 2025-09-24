import { defineStore } from 'pinia';
import {
  fetchPosts,
  fetchPostById,
  createPost, // (formData, userId)
  updatePost, // (postId, payload, userId)
  deletePost, // (postId, userId)
  toggleLike, // (postId, userId)
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
        likes: Math.floor(Math.random() * 30),
        comments: Math.floor(Math.random() * 10),
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
// Normalizer
// ------------------------------
function normalizePost(p) {
  if (!p) return null;
  const id = p.postId ?? p.id;
  return {
    id,
    category: p.category ?? '',
    title: p.title ?? '',
    content: p.content ?? '',
    author: p.author ?? p.writer?.nickName ?? '익명',
    time: p.time ?? p.createdAt ?? '',
    likes: p.likes ?? p.like ?? p.likeCount ?? 0, // ← likeCount도 고려
    comments: p.comments ?? p.commentCount ?? 0, // ← commentCount도 고려
    avatar: p.avatar ?? p.writer?.memberImg ?? '',
    _raw: p,
  };
}

export const useCommunityStore = defineStore('community', {
  state: () => ({
    posts: [],
    selectedPost: null,
    viewMode: 'list',
    loading: false,
    error: null,
    page: 1,
    size: 10,
    total: 0,
    searchText: '',
    demoPosts: generateDemoPosts(),
    // TODO: 로그인 연동 시 교체(ex. useAuthStore().userId)
    userId: 123,
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

    // 상세뷰: id로 정규화 데이터 반환
    getById: (state) => (idLike) => {
      const idStr = String(idLike);
      const src =
        Array.isArray(state.posts) && state.posts.length > 0
          ? state.posts
          : state.demoPosts;
      const found = src.find((p) => String(p.postId ?? p.id) === idStr) ?? null;
      return normalizePost(found);
    },

    // 필요 시 원본
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
        const fallback = this.getByIdRaw(idLike);
        this.selectedPost = normalizePost(fallback);
        this.error = err;
      } finally {
        this.loading = false;
      }
    },

    // 글 생성: FormData -> (JSON 저장) -> (파일 업로드)
    async createNewPost(formData) {
      this.error = null;
      try {
        const post = await createPost(formData, this.userId);
        await this.loadPosts(this.page, this.size, this.searchText);
        this.viewMode = 'list';
        return post;
      } catch (err) {
        this.error = err;
        throw err;
      }
    },

    // 글 수정: FormData여도 JSON payload로 자동 변환해서 호출
    async updateExistingPost(postId, formOrPayload) {
      this.error = null;
      try {
        let payload = formOrPayload;

        // FormData로 들어온 경우(title/content/category만 추출)
        if (
          typeof FormData !== 'undefined' &&
          formOrPayload instanceof FormData
        ) {
          payload = {
            title: String(formOrPayload.get('title') || ''),
            content: String(formOrPayload.get('content') || ''),
            category: String(formOrPayload.get('category') || ''),
          };
        }

        const res = await updatePost(postId, payload, this.userId);
        await this.loadPosts(this.page, this.size, this.searchText);
        this.viewMode = 'list';
        return res;
      } catch (err) {
        this.error = err;
        throw err;
      }
    },

    async removePost(postId) {
      this.error = null;
      try {
        await deletePost(postId, this.userId);
        this.posts = this.posts.filter((p) => (p.postId ?? p.id) !== postId);
        if (this.selectedPost?.id === postId) this.selectedPost = null;
        this.viewMode = 'list';
      } catch (err) {
        this.error = err;
      }
    },

    async toggleLike(postId) {
      this.error = null;
      try {
        const res = await toggleLike(postId, this.userId);
        const likeCount = res.data?.likeCount ?? res.data?.likes ?? null;
        const liked = res.data?.liked ?? undefined;

        // 목록 갱신
        const idx = this.posts.findIndex((p) => (p.postId ?? p.id) === postId);
        if (idx !== -1 && likeCount !== null) {
          this.posts[idx] = { ...this.posts[idx], likes: likeCount };
        }

        // 상세 갱신
        if (this.selectedPost?.id === postId && likeCount !== null) {
          const next = { ...this.selectedPost, likes: likeCount };
          if (typeof liked === 'boolean') next.liked = liked;
          this.selectedPost = next;
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
