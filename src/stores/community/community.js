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
    posts: [], // 게시글 목록
    selectedPost: null, // 현재 선택된 게시글
    viewMode: 'list', // list | detail | write | edit
    loading: false,
    error: null,
    page: 1,
    size: 10,
    total: 0,
    searchText: '',
  }),

  actions: {
    // 게시글 목록 불러오기
    async loadPosts(page = 1, size = 10, searchText = '') {
      this.loading = true;
      this.error = null;
      try {
        const res = await fetchPosts(page, size, searchText);
        this.posts = res.data.content ?? res.data; // 백엔드 응답 구조에 맞춤
        this.page = page;
        this.size = size;
        this.total = res.data.totalElements ?? this.posts.length;
      } catch (err) {
        console.error('게시글 목록 불러오기 실패', err);
        this.error = err;
      } finally {
        this.loading = false;
      }
    },

    // 특정 게시글 불러오기
    async loadPostDetail(postId) {
      this.loading = true;
      this.error = null;
      try {
        const res = await fetchPostById(postId);
        this.selectedPost = res.data;
        this.viewMode = 'detail';
      } catch (err) {
        console.error('게시글 상세 불러오기 실패', err);
        this.error = err;
      } finally {
        this.loading = false;
      }
    },

    // 게시글 작성
    async createNewPost(formData) {
      try {
        const res = await createPost(formData);
        await this.loadPosts(this.page, this.size, this.searchText);
        this.viewMode = 'list';
        return res;
      } catch (err) {
        console.error('게시글 작성 실패', err);
        this.error = err;
        throw err;
      }
    },

    // 게시글 수정
    async updateExistingPost(postId, formData) {
      try {
        const res = await updatePost(postId, formData);
        await this.loadPosts(this.page, this.size, this.searchText);
        this.viewMode = 'list';
        return res;
      } catch (err) {
        console.error('게시글 수정 실패', err);
        this.error = err;
        throw err;
      }
    },

    // 게시글 삭제
    async removePost(postId) {
      try {
        await deletePost(postId);
        this.posts = this.posts.filter((p) => p.postId !== postId);
        this.viewMode = 'list';
      } catch (err) {
        console.error('게시글 삭제 실패', err);
        this.error = err;
      }
    },

    // 좋아요 토글
    async toggleLike(postId) {
      try {
        const res = await toggleLike(postId);
        // 응답 데이터에 좋아요 상태/갯수 포함 시 업데이트
        const idx = this.posts.findIndex((p) => p.postId === postId);
        if (idx !== -1) {
          this.posts[idx].like = res.data.likeCount;
          this.posts[idx].liked = res.data.liked;
        }
        if (this.selectedPost?.postId === postId) {
          this.selectedPost.like = res.data.likeCount;
          this.selectedPost.liked = res.data.liked;
        }
      } catch (err) {
        console.error('좋아요 토글 실패', err);
        this.error = err;
      }
    },

    // 화면 모드 전환
    setViewMode(mode) {
      this.viewMode = mode;
    },
  },

  persist: true, // pinia-plugin-persistedstate 적용
});
