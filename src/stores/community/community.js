// src/stores/community/community.js
import { defineStore } from 'pinia';
import {
  fetchPosts,
  fetchPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
} from '@/services/community/communityService';

// ✅ 더미 게시글 생성 함수
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
        likes: Math.floor(Math.random() * 30), // 0~29 사이 랜덤 좋아요
        writer: {
          nickName: `${cat}작성자${i}`,
          memberNoLogin: i,
          memberImg: '/image/main/test.png',
        },
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(), // 하루 전씩 날짜 차등
      });
    }
  });

  return demo;
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

    // ✅ 카테고리별 15개씩 총 60개 더미 데이터
    demoPosts: generateDemoPosts(),
  }),

  getters: {
    list: (state) => (category) => {
      const source =
        Array.isArray(state.posts) && state.posts.length > 0
          ? state.posts
          : state.demoPosts;
      return source
        .filter((p) => p?.category === category)
        .map((p) => ({ ...p, likes: p.likes ?? p.like ?? 0 }));
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
          Array.isArray(raw) && raw.length > 0
            ? raw.map((p) => ({ ...p, likes: p.likes ?? p.like ?? 0 }))
            : this.demoPosts;

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

    async loadPostDetail(postId) {
      this.loading = true;
      this.error = null;
      try {
        const res = await fetchPostById(postId);
        this.selectedPost =
          res.data ?? this.demoPosts.find((p) => p.postId === postId);
        this.viewMode = 'detail';
      } catch (err) {
        this.selectedPost =
          this.demoPosts.find((p) => p.postId === postId) || null;
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
        this.posts = this.posts.filter((p) => p.postId !== postId);
        this.viewMode = 'list';
      } catch (err) {
        this.error = err;
      }
    },

    async toggleLike(postId) {
      try {
        const res = await toggleLike(postId);
        const likeCount = res.data?.likeCount ?? res.data?.likes ?? 0;
        const liked = res.data?.liked ?? undefined;

        const idx = this.posts.findIndex((p) => p.postId === postId);
        if (idx !== -1) {
          this.posts[idx].likes = likeCount;
          if (typeof liked === 'boolean') this.posts[idx].liked = liked;
        }
        if (this.selectedPost?.postId === postId) {
          this.selectedPost.likes = likeCount;
          if (typeof liked === 'boolean') this.selectedPost.liked = liked;
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
