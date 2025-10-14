import { defineStore } from 'pinia';
import {
  fetchPosts,
  fetchPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
} from '@/services/community/postService';
import { useAuthenticationStore } from '@/stores/user/authentication';

const DEFAULT_AVATAR =
  import.meta.env.BASE_URL + 'image/main/default-profile.png';

function normalizePost(p, me) {
  if (!p) return null;

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

  const category = (p.categoryKey ?? p.category ?? '').toString().trim();

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

  const authorRaw =
    p.nickname ??
    p.nickName ??
    p.nick_name ??
    p.authorNickname ??
    p.author ??
    p.writerNickName ??
    p.writer?.nickName ??
    p.writer?.nick_name ??
    null;

  const author =
    authorRaw && String(authorRaw).trim()
      ? String(authorRaw)
      : isMine && me?.nickName
      ? String(me.nickName)
      : '익명';

  const avatarRaw =
    p.profile ??
    p.profilePath ??
    p.profileUrl ??
    p.profile_url ??
    p.profileImage ??
    p.profileImg ??
    p.profile_img ??
    p.profile_img_path ??
    p.memberImg ??
    p.member_img ??
    p.avatar ??
    p.writer?.memberImg ??
    p.writer?.member_img ??
    null;
  const avatar = avatarRaw ? String(avatarRaw) : DEFAULT_AVATAR;

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
    avatar,
    isMine,
    createdAt,
    createdAtMs,
    likes: Number(p.likeCount ?? p.likes ?? p.like ?? 0),
    comments: Number(p.commentCount ?? p.comments ?? 0),
    liked: typeof p.liked === 'boolean' ? p.liked : undefined,
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
    userId: 0,
  }),

  getters: {
    list: (state) => (categoryKey) => {
      const auth = useAuthenticationStore();
      const me = auth?.state?.signedUser ?? null;
      return (state.posts || [])
        .map((p) => normalizePost(p, me))
        .filter((np) => np && np.category === categoryKey);
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

      if (
        !found &&
        state.selectedPost &&
        String(state.selectedPost.id) === idStr
      ) {
        return state.selectedPost;
      }
      if (
        found &&
        state.selectedPost &&
        String(state.selectedPost.id) === idStr
      ) {
        return normalizePost({ ...found, ...state.selectedPost._raw }, me);
      }
      return normalizePost(found, me);
    },

    popularByCategory:
      (state) =>
      (categoryKey, limit = 5) => {
        const auth = useAuthenticationStore();
        const me = auth?.state?.signedUser ?? null;
        return (state.posts || [])
          .map((p) => normalizePost(p, me))
          .filter((np) => np && np.category === categoryKey)
          .sort((a, b) => Number(b.likes) - Number(a.likes))
          .slice(0, limit);
      },

    popularAll:
      (state) =>
      (limit = 5) => {
        const auth = useAuthenticationStore();
        const me = auth?.state?.signedUser ?? null;
        return (state.posts || [])
          .map((p) => normalizePost(p, me))
          .filter(Boolean)
          .sort((a, b) => Number(b.likes) - Number(a.likes))
          .slice(0, limit);
      },
  },

  actions: {
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

    async loadPostDetail(idLike) {
      this.loading = true;
      this.error = null;
      try {
        const idStr = String(idLike);
        const res = await fetchPostById(idStr);
        const auth = useAuthenticationStore();
        const me = auth?.state?.signedUser ?? null;

        const raw = res?.data ?? null;
        console.log('[community] detail raw:', raw);

        const normalized = normalizePost(raw, me);
        console.log('[community] normalized:', normalized);

        this.selectedPost = normalized;

        if (raw) {
          const idx = (this.posts || []).findIndex(
            (p) => String(p.postId ?? p.id) === idStr
          );
          if (idx === -1) this.posts = [raw, ...(this.posts || [])];
          else this.posts.splice(idx, 1, raw);
        }

        this.viewMode = 'detail';
      } catch (err) {
        console.error('[community] loadPostDetail error:', err);
        this.selectedPost = null;
        this.error = err;
      } finally {
        this.loading = false;
      }
    },
    async createNewPost(payload) {
      this.error = null;
      try {
        const auth = useAuthenticationStore();
        const me = auth?.state?.signedUser ?? null;
        const myId = me?.userId ?? me?.memberNoLogin ?? null;

        const createdRaw = await createPost(payload);

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

        const createdForList = {
          ...(typeof createdRaw === 'object' ? createdRaw : {}),
          ...(postId ? { postId } : {}),
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

        const page0 = Math.max(0, (this.page ?? 1) - 1);
        await this.loadPosts(page0 + 1, this.size);

        if (!postId) {
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
            String(p.title ?? '').trim() ===
              String(payload.title ?? '').trim() &&
            String(p.content ?? '').trim() ===
              String(payload.content ?? '').trim();

          const pool = this.posts || [];
          const candidate =
            pool.find((p) => matchesMe(p) && sameText(p)) ||
            pool.find((p) => sameText(p));
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

        if (!postId) {
          throw new Error('생성 응답에 postId가 없습니다.');
        }

        const normalized = normalizePost({ ...createdForList, postId }, me);
        return normalized;
      } catch (err) {
        this.error = err;
        throw err;
      }
    },

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

        this.posts = (this.posts || []).map((p) =>
          Number(p.postId ?? p.id) === Number(postId) ? { ...p, ...data } : p
        );

        const page0 = Math.max(0, (this.page ?? 1) - 1);
        await this.loadPosts(page0 + 1, this.size);
        this.viewMode = 'list';
        return data;
      } catch (err) {
        this.error = err;
        throw err;
      }
    },

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
