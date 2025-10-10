// stores/community/community.js
import { defineStore } from 'pinia';
import {
  fetchPosts,
  fetchPostById,
  createPost, // (payload, userId)
  updatePost,
  deletePost,
  toggleLike,
} from '@/services/community/postService';
import { useAuthenticationStore } from '@/stores/user/authentication';

// 정규화: authorId / isMine 반드시 포함
function normalizePost(p, me) {
  if (!p) return null;

  const id = p.postId ?? p.id;
  const category = p.categoryKey ?? p.category ?? '';

  const currentUserId = me?.userId ?? me?.memberNoLogin ?? me?.id ?? null;

  const authorIdRaw =
    p.userId ??
    p.authorId ??
    p.memberNoLogin ??
    p.memberNo ??
    p.writerId ??
    null;
  const authorId = authorIdRaw != null ? Number(authorIdRaw) : null;

  const isMine =
    typeof p.isMine === 'boolean'
      ? p.isMine
      : currentUserId != null &&
        authorId != null &&
        Number(currentUserId) === Number(authorId);

  const author =
    p.authorNickname ??
    p.author ??
    p.writerNickName ??
    p.writer?.nickName ??
    (isMine && me?.nickName ? me.nickName : '익명');

  return {
    id,
    category,
    title: p.title ?? '',
    content: p.content ?? '',
    author, // 닉네임/표시명
    authorId, // 작성자 식별자
    isMine, // 내 글 여부 (버튼 노출 조건)
    time: p.createdAt ?? p.time ?? '',
    likes: p.likeCount ?? p.likes ?? p.like ?? 0,
    comments: p.commentCount ?? p.comments ?? 0,
    avatar: p.avatar ?? p.writer?.memberImg ?? '',
    liked: typeof p.liked === 'boolean' ? p.liked : undefined,
    _raw: p,
  };
}

export const useCommunityStore = defineStore('community', {
  state: () => ({
    posts: [], // 서버 원본 배열(정규화 전)
    selectedPost: null, // 정규화된 단건
    viewMode: 'list',
    loading: false,
    error: null,

    page: 1,
    size: 10,
    total: 0,

    searchText: '',
    userId: 0, // (옵션) 캐시. 실제 로그인은 auth에서 읽음
  }),

  getters: {
    // 카테고리별 정규화 리스트
    list: (state) => (categoryKey) => {
      const auth = useAuthenticationStore();
      const me = auth?.state?.signedUser ?? null;
      return (state.posts || [])
        .filter((p) => (p?.categoryKey ?? p?.category) === categoryKey)
        .map((p) => normalizePost(p, me));
    },

    // 전체 정규화 리스트
    allNormalized: (state) => {
      const auth = useAuthenticationStore();
      const me = auth?.state?.signedUser ?? null;
      return (state.posts || []).map((p) => normalizePost(p, me));
    },

    // 상세(정규화)
    getById: (state) => (idLike) => {
      const idStr = String(idLike);
      const auth = useAuthenticationStore();
      const me = auth?.state?.signedUser ?? null;
      const found =
        (state.posts || []).find((p) => String(p.postId ?? p.id) === idStr) ??
        null;
      return normalizePost(found, me);
    },

    // 인기글(카테고리별)
    popularByCategory:
      (state) =>
      (categoryKey, limit = 5) => {
        const auth = useAuthenticationStore();
        const me = auth?.state?.signedUser ?? null;
        return (state.posts || [])
          .filter((p) => (p?.categoryKey ?? p?.category) === categoryKey)
          .sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0))
          .slice(0, limit)
          .map((p) => normalizePost(p, me));
      },

    // 인기글(전체)
    popularAll:
      (state) =>
      (limit = 5) => {
        const auth = useAuthenticationStore();
        const me = auth?.state?.signedUser ?? null;
        return (state.posts || [])
          .slice()
          .sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0))
          .slice(0, limit)
          .map((p) => normalizePost(p, me));
      },
  },

  actions: {
    // 목록
    async loadPosts(page = 1, size = 10, categoryKey) {
      this.loading = true;
      this.error = null;
      try {
        const page0 = Math.max(0, Number(page) - 1);
        const res = await fetchPosts(page0, size, categoryKey);
        const raw = res.data?.content ?? res.data ?? [];
        this.posts = Array.isArray(raw) ? raw : [];
        this.page = page;
        this.size = size;
        this.total = Number(res.data?.totalElements ?? this.posts.length);
      } catch (err) {
        this.posts = [];
        this.total = 0;
        this.error = err;
      } finally {
        this.loading = false;
      }
    },

    // 상세
    async loadPostDetail(idLike) {
      this.loading = true;
      this.error = null;
      try {
        const idStr = String(idLike);
        const res = await fetchPostById(idStr);
        const auth = useAuthenticationStore();
        const me = auth?.state?.signedUser ?? null;

        const raw = res?.data ?? null;
        this.selectedPost = normalizePost(raw, me);

        // 목록에도 반영(상세 조회만 된 글이 목록에 없으면 추가/갱신)
        if (raw) {
          const idx = (this.posts || []).findIndex(
            (p) => String(p.postId ?? p.id) === idStr
          );
          if (idx === -1) this.posts = [raw, ...(this.posts || [])];
          else this.posts.splice(idx, 1, raw);
        }

        this.viewMode = 'detail';
      } catch (err) {
        this.selectedPost = null;
        this.error = err;
      } finally {
        this.loading = false;
      }
    },

    // 글 생성(JSON)
    async createNewPost(payload) {
      this.error = null;
      try {
        const auth = useAuthenticationStore();
        const me = auth?.state?.signedUser ?? null;

        const { data: created } = await createPost(payload, me?.userId || 0);

        // 낙관 반영
        this.posts = [created, ...(this.posts || [])];

        // 재조회로 정합성 확보
        const page0 = Math.max(0, (this.page ?? 1) - 1);
        await this.loadPosts(page0 + 1, this.size);

        this.viewMode = 'list';
        return created;
      } catch (err) {
        this.error = err;
        throw err;
      }
    },

    // 글 수정(JSON/FD → JSON)
    async updateExistingPost(postId, formOrPayload) {
      this.error = null;
      try {
        let payload = formOrPayload;
        if (
          typeof FormData !== 'undefined' &&
          formOrPayload instanceof FormData
        ) {
          payload = {
            title: String(formOrPayload.get('title') || ''),
            content: String(formOrPayload.get('content') || ''),
            categoryKey: String(
              formOrPayload.get('categoryKey') ||
                formOrPayload.get('category') ||
                ''
            ),
          };
        }

        const auth = useAuthenticationStore();
        const me = auth?.state?.signedUser ?? null;

        const { data } = await updatePost(postId, payload, me?.userId || 0);

        // 로컬 반영
        this.posts = (this.posts || []).map((p) =>
          (p.postId ?? p.id) === postId ? { ...p, ...data } : p
        );

        // 재조회
        const page0 = Math.max(0, (this.page ?? 1) - 1);
        await this.loadPosts(page0 + 1, this.size);
        this.viewMode = 'list';
        return data;
      } catch (err) {
        this.error = err;
        throw err;
      }
    },

    // 삭제
    async removePost(postId) {
      this.error = null;
      try {
        const auth = useAuthenticationStore();
        const me = auth?.state?.signedUser ?? null;

        await deletePost(postId, me?.userId || 0);

        const asNum = (v) => Number(v ?? 0);
        this.posts = (this.posts || []).filter(
          (p) => asNum(p.postId ?? p.id) !== asNum(postId)
        );
        if (asNum(this.selectedPost?.id) === asNum(postId)) {
          this.selectedPost = null;
        }
        this.viewMode = 'list';
      } catch (err) {
        this.error = err;
      }
    },

    // 좋아요 토글
    async toggleLike(postId) {
      this.error = null;
      try {
        const auth = useAuthenticationStore();
        const me = auth?.state?.signedUser ?? null;
        if (!me?.userId || me.userId <= 0)
          throw new Error('로그인이 필요합니다.');

        const res = await toggleLike(postId, me.userId);
        const likeCount = res.data?.likeCount ?? res.data?.likes ?? null;
        const liked = res.data?.liked ?? undefined;
        const asNum = (v) => Number(v ?? 0);

        const idx = (this.posts || []).findIndex(
          (p) => asNum(p.postId ?? p.id) === asNum(postId)
        );
        if (idx !== -1 && likeCount !== null) {
          const next = {
            ...this.posts[idx],
            likeCount,
            likes: likeCount,
            liked,
          };
          this.posts.splice(idx, 1, next);
        }

        if (
          asNum(this.selectedPost?.id) === asNum(postId) &&
          likeCount !== null
        ) {
          const next = { ...this.selectedPost, likes: likeCount };
          if (typeof liked === 'boolean') next.liked = liked;
          this.selectedPost = next;
        }
      } catch (err) {
        this.error = err;
        throw err;
      }
    },

    setViewMode(mode) {
      this.viewMode = mode;
    },
  },

  persist: true,
});
