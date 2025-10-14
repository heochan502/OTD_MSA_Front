// stores/community/comments.js
import { defineStore } from 'pinia';
import {
  fetchMents,
  createMent,
  deleteMent,
} from '@/services/community/mentService';
import { useAuthenticationStore } from '@/stores/user/authentication';

export const useCommentsStore = defineStore('comments', {
  state: () => ({
    byPost: {}, // { [postId]: Array<MentRes> }
    loading: {}, // { [postId]: boolean }
    error: null,
  }),

  getters: {
    list: (s) => (postId) => s.byPost[String(postId)] ?? [],
    count: (s) => (postId) => (s.byPost[String(postId)] ?? []).length,
    isLoading: (s) => (postId) => !!s.loading[String(postId)],
  },

  actions: {
    async load(postId) {
      const k = String(postId);
      this.loading[k] = true;
      this.error = null;
      try {
        const { data } = await fetchMents(k);
        this.byPost[k] = Array.isArray(data) ? data : [];
      } catch (e) {
        this.byPost[k] = [];
        this.error = e;
      } finally {
        this.loading[k] = false;
      }
    },

    // opts 추가 (닉네임/권한 헤더용)
    async add(postId, content, opts = {}) {
      const k = String(postId);
      const auth = useAuthenticationStore();
      const me = auth?.state?.signedUser ?? { userId: 0, nickName: '익명' };

      const { data } = await createMent(
        k,
        content,
        me.userId,
        opts.nickName ?? me.nickName
      );

      // 낙관적 갱신: 응답 + 내 닉네임 보강
      const next = {
        ...data,
      };
      this.byPost[k] = [next, ...(this.byPost[k] ?? [])];
    },

    async remove(mentId, postId, myrole) {
      const k = String(postId);
      const auth = useAuthenticationStore();
      const me = auth?.state?.signedUser ?? { userId: 0 };

      await deleteMent(mentId, me.userId, myrole);
      this.byPost[k] = (this.byPost[k] ?? []).filter(
        (m) => m.commentId !== mentId
      );
    },
  },

  persist: true,
});
