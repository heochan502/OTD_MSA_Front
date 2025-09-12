import { defineStore } from 'pinia';
import {
  fetchPosts,
  fetchPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
} from '@/services/community/communityService';

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
  }),

  getters: {
    list: (state) => (category) => {
      if (!Array.isArray(state.posts)) return [];
      return state.posts
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
        this.posts = Array.isArray(raw)
          ? raw.map((p) => ({
              ...p,
              likes: p.likes ?? p.like ?? 0,
            }))
          : [];
        this.page = page;
        this.size = size;
        this.total = res.data?.totalElements ?? this.posts.length;
      } catch (err) {
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
        const d = res.data;
        this.selectedPost = d ? { ...d, likes: d.likes ?? d.like ?? 0 } : null;
        this.viewMode = 'detail';
      } catch (err) {
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
        if (this.selectedPost?.postId === postId) this.selectedPost = null;
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

        const i = this.posts.findIndex((p) => p.postId === postId);
        if (i !== -1) {
          this.posts[i].likes = likeCount;
          if (typeof liked === 'boolean') this.posts[i].liked = liked;
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
    setSearchText(v) {
      this.searchText = v ?? '';
    },
  },

  persist: true,
});
