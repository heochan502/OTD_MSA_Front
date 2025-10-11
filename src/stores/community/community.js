// stores/community/community.js
import { defineStore } from 'pinia';
import {
  fetchPosts,
  fetchPostById,
  createPost, // createPost(payload) -> data만 반환
  updatePost, // updatePost(postId, payload) -> data만 반환
  deletePost,
  toggleLike,
} from '@/services/community/postService';
import { useAuthenticationStore } from '@/stores/user/authentication';

/** 서버 응답을 화면에서 쓰기 쉬운 형태로 정규화 */
function normalizePost(p, me) {
  if (!p) return null;

  // id 추출 폭 넓힘 (여러 백엔드 응답 형태 대비)
  const idRaw =
    p.postId ??
    p.id ??
    p.data?.postId ??
    p.data?.id ??
    p.result?.postId ??
    p.result?.id ??
    p.payload?.postId ??
    p.payload?.id ??
    p.post_no ??
    p.boardId ??
    p.seq ??
    p.pk ??
    null;
  const id = idRaw != null ? Number(idRaw) : null;

  const category = p.categoryKey ?? p.category ?? '';

  const currentUserId = me?.userId ?? me?.memberNoLogin ?? me?.id ?? null;

  const authorIdRaw =
    p.userId ??
    p.authorId ??
    p.memberNoLogin ??
    p.memberNo ??
    p.writerId ??
    p.writer?.id ??
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

  const createdAt = p.createdAt ?? p.time ?? p.created_at ?? null;
  const createdAtMs = createdAt
    ? Number(createdAt) || Date.parse(createdAt) || 0
    : 0;

  return {
    id,
    postId: id,
    category,
    title: p.title ?? '',
    content: p.content ?? '',
    author,
    authorId,
    isMine,
    createdAt,
    createdAtMs, // 정렬용 안전 숫자
    likes: Number(p.likeCount ?? p.likes ?? p.like ?? 0),
    comments: Number(p.commentCount ?? p.comments ?? 0),
    avatar: p.avatar ?? p.writer?.memberImg ?? '',
    liked: typeof p.liked === 'boolean' ? p.liked : undefined,
    _raw: p,
  };
}

export const useCommunityStore = defineStore('community', {
  state: () => ({
    posts: [], // 서버 원본(정규화 전)
    selectedPost: null, // 정규화된 단건
    viewMode: 'list',
    loading: false,
    error: null,

    page: 1,
    size: 10,
    total: 0,

    searchText: '',
    userId: 0,
  }),

  getters: {
    list: (state) => (categoryKey) => {
      const auth = useAuthenticationStore();
      const me = auth?.state?.signedUser ?? null;
      return (state.posts || [])
        .filter((p) => (p?.categoryKey ?? p?.category) === categoryKey)
        .map((p) => normalizePost(p, me))
        .filter(Boolean);
    },

    allNormalized: (state) => {
      const auth = useAuthenticationStore();
      const me = auth?.state?.signedUser ?? null;
      return (state.posts || [])
        .map((p) => normalizePost(p, me))
        .filter(Boolean);
    },

    getById: (state) => (idLike) => {
      const idStr = String(idLike);
      const auth = useAuthenticationStore();
      const me = auth?.state?.signedUser ?? null;
      const found =
        (state.posts || []).find((p) => String(p.postId ?? p.id) === idStr) ??
        null;
      return normalizePost(found, me);
    },

    popularByCategory:
      (state) =>
      (categoryKey, limit = 5) => {
        const auth = useAuthenticationStore();
        const me = auth?.state?.signedUser ?? null;
        return (state.posts || [])
          .filter((p) => (p?.categoryKey ?? p?.category) === categoryKey)
          .sort((a, b) => Number(b.likeCount ?? 0) - Number(a.likeCount ?? 0))
          .slice(0, limit)
          .map((p) => normalizePost(p, me))
          .filter(Boolean);
      },

    popularAll:
      (state) =>
      (limit = 5) => {
        const auth = useAuthenticationStore();
        const me = auth?.state?.signedUser ?? null;
        return (state.posts || [])
          .slice()
          .sort((a, b) => Number(b.likeCount ?? 0) - Number(a.likeCount ?? 0))
          .slice(0, limit)
          .map((p) => normalizePost(p, me))
          .filter(Boolean);
      },
  },

  actions: {
    /** 목록 */
    async loadPosts(page = 1, size = 10, categoryKey) {
      this.loading = true;
      this.error = null;
      try {
        const page0 = Math.max(0, Number(page) - 1);
        const res = await fetchPosts(page0, size, categoryKey);
        const raw = res?.data?.content ?? res?.data ?? [];
        this.posts = Array.isArray(raw) ? raw : [];
        this.page = page;
        this.size = size;
        this.total = Number(res?.data?.totalElements ?? this.posts.length);
      } catch (err) {
        this.posts = [];
        this.total = 0;
        this.error = err;
      } finally {
        this.loading = false;
      }
    },

    /** 상세 */
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

    /**
     * 글 생성(JSON) — 정규화 객체를 반환(postId 보장).
     * 백엔드가 id를 응답에 안 넣어주는 경우, 방금 쓴 글을 목록에서 탐색해서 id를 폴백으로 확보.
     */
    async createNewPost(payload) {
      this.error = null;
      try {
        const auth = useAuthenticationStore();
        const me = auth?.state?.signedUser ?? null;
        const myId = me?.userId ?? me?.memberNoLogin ?? null;

        // 1) 생성 (data만 반환)
        const createdRaw = await createPost(payload);

        // 2) 응답에서 id 바로 탐색
        let postId = Number(
          createdRaw?.postId ??
            createdRaw?.id ??
            createdRaw?.data?.postId ??
            createdRaw?.data?.id ??
            createdRaw?.result?.postId ??
            createdRaw?.result?.id ??
            createdRaw?.payload?.postId ??
            createdRaw?.payload?.id ??
            createdRaw?.post_no ??
            createdRaw?.boardId ??
            createdRaw?.seq ??
            createdRaw?.pk
        );

        // 3) 목록 폴백 탐색 조건 (작성자/제목/내용 매칭)
        const matchesMe = (p) => {
          const aId = Number(
            p.userId ??
              p.authorId ??
              p.memberNoLogin ??
              p.memberNo ??
              p.writerId ??
              p.writer?.id
          );
          return myId != null && aId === Number(myId);
        };
        const sameText = (p) =>
          String(p.title ?? '').trim() === String(payload.title ?? '').trim() &&
          String(p.content ?? '').trim() ===
            String(payload.content ?? '').trim();

        // 4) 목록 옵티미스틱 반영(원본 push) — id 없으면 나중 탐색 시 재사용
        const createdForList = {
          ...(typeof createdRaw === 'object' ? createdRaw : {}),
          ...(postId ? { postId } : {}),
          // 작성자 id 없을 수 있어 폴백 주입
          ...(myId != null &&
          createdRaw?.userId == null &&
          createdRaw?.authorId == null
            ? { userId: myId }
            : {}),
          categoryKey:
            payload.categoryKey ??
            createdRaw?.categoryKey ??
            createdRaw?.category,
          title: payload.title ?? createdRaw?.title,
          content: payload.content ?? createdRaw?.content,
        };
        this.posts = [createdForList, ...(this.posts || [])];

        // 5) 재조회 (최신 목록 확보)
        const page0 = Math.max(0, (this.page ?? 1) - 1);
        await this.loadPosts(page0 + 1, this.size);

        // 6) 폴백: 목록에서 방금 쓴 글 찾기
        if (!postId) {
          const pool = this.posts || [];
          const candidate =
            pool.find((p) => matchesMe(p) && sameText(p)) ||
            pool.find((p) => sameText(p)); // 작성자 매칭이 안될 때 제목/내용만으로라도
          if (candidate) {
            postId = Number(
              candidate.postId ??
                candidate.id ??
                candidate._raw?.postId ??
                candidate._raw?.id ??
                0
            );
          }
        }

        this.viewMode = 'list';

        // 7) 최종 방어
        if (!postId) {
          console.warn(
            '[community] createNewPost: cannot resolve postId',
            createdRaw
          );
          throw new Error('생성 응답에 postId가 없습니다.');
        }

        // 8) 정규화 후 반환
        const normalized = normalizePost({ ...createdForList, postId }, me);
        return normalized;
      } catch (err) {
        this.error = err;
        throw err;
      }
    },

    /** 글 수정(JSON/FD → JSON) */
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

        const data = await updatePost(postId, payload);

        // 로컬 반영
        this.posts = (this.posts || []).map((p) =>
          Number(p.postId ?? p.id) === Number(postId) ? { ...p, ...data } : p
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

    /** 삭제 */
    async removePost(postId) {
      this.error = null;
      try {
        await deletePost(postId);
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

    /** 좋아요 토글 */
    async toggleLike(postId) {
      this.error = null;
      try {
        const auth = useAuthenticationStore();
        const me = auth?.state?.signedUser ?? null;
        if (!me?.userId && !me?.memberNoLogin) {
          throw new Error('로그인이 필요합니다.');
        }

        const res = await toggleLike(postId, me.userId ?? me.memberNoLogin);
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
