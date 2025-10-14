<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/services/httpRequester';
import { fetchPostFiles } from '@/services/community/postService';

const props = defineProps({
  post: { type: Object, required: true },
  badge: { type: String, default: '' },
  clickable: { type: Boolean, default: true },
  routeName: { type: String, default: 'CommunityPost' },
  routeParamKey: { type: String, default: 'id' },
  idKey: { type: String, default: 'postId' },
  thumbnailKey: { type: String, default: 'thumbnail' },
  thumbnailUrl: { type: String, default: '' },
});

const router = useRouter();
const DEFAULT_AVATAR =
  import.meta.env.BASE_URL + 'image/main/default-profile.png';

//  썸네일 캐시(카드 여러개일 때 중복 API 방지)
const thumbCache = (globalThis.__postThumbCache ||= new Map());

const getId = (p) => p?.[props.idKey] ?? p?.id ?? p?.postId;
const getAuthor = (p) =>
  p?.author ?? p?.writer?.nickName ?? p?.nickName ?? '익명';
const getTime = (p) => p?.time ?? p?.createdAt ?? '';
const getLikes = (p) => p?.likes ?? p?.like ?? p?.likeCount ?? 0;
const getComments = (p) => p?.comments ?? p?.commentCount ?? 0;


const API_BASE =
  (import.meta.env.VITE_BASE_URL ).replace(/\/$/, '');


function toAbsUrl(path) {
  const base = import.meta.env.VITE_BASE_URL.replace(/\/$/, ''); // https://greenart.n-e.kr/otd-api
  if (!path) return base;

  // 슬래시 중복 방지해서 안전하게 합침
  return `${base}/${path.replace(/^\/+/, '')}`;
}

/** 프로필: DB profile 컬럼 우선 */
function getAvatar(p) {
  const raw =
    p?.profile || // ← 새로 들어온 컬럼
    p?.profilePath ||
    p?.profileUrl ||
    p?.avatar ||
    p?.profileImage ||
    p?.profileImg ||
    p?.memberImg ||
    p?.writer?.memberImg ||
    '';
  const url = raw ? toAbsUrl(raw) : DEFAULT_AVATAR;
  return url || DEFAULT_AVATAR;
}

/** 1차: post 자체에서 썸네일 후보 찾기 */
function findInlineThumb(p) {
  const explicit =
    props.thumbnailUrl ||
    p?.[props.thumbnailKey] ||
    p?.thumb ||
    p?.image ||
    null;

  if (explicit) return toAbsUrl(explicit);

  const files =
    p?.images ||
    p?.files ||
    p?.fileList ||
    p?.attachments ||
    p?.postFiles ||
    [];

  if (Array.isArray(files) && files.length > 0) {
    const f = files[0];
    const path = f?.url || f?.filePath || f?.path || f?.src || null;
    if (path) return toAbsUrl(path);
  }
  return '';
}

/** 2차: 서버에서 첫 이미지 지연 로딩 */
const thumbUrlRef = ref('');
async function lazyLoadThumb(p) {
  const id = getId(p);
  if (!id) return;
  if (thumbCache.has(id)) {
    thumbUrlRef.value = thumbCache.get(id);
    return;
  }
  try {
    const { data } = await fetchPostFiles(id);
    const list = Array.isArray(data) ? data : [];
    if (list.length > 0) {
      const first = list[0];
      const path = first.filePath || first.url || first.src || '';
      if (path) {
        const url = toAbsUrl(path);
        thumbCache.set(id, url);
        thumbUrlRef.value = url;
      }
    }
  } catch (e) {
    // 조용히 실패
  }
}

/** 실제로 쓸 썸네일 src */
function getThumbSrc() {
  return findInlineThumb(props.post) || thumbUrlRef.value || '';
}

function open() {
  if (!props.clickable) return;
  const id = getId(props.post);
  if (!id) return;
  router.push({
    name: props.routeName,
    params: { [props.routeParamKey]: String(id) },
  });
}

onMounted(() => {
  if (!findInlineThumb(props.post)) {
    lazyLoadThumb(props.post);
  }
});

watch(
  () => props.post,
  (p) => {
    thumbUrlRef.value = '';
    if (!findInlineThumb(p)) {
      lazyLoadThumb(p);
    }
  },
  { deep: false }
);
</script>

<template>
  <article
    class="card"
    role="button"
    tabindex="0"
    @click="open"
    @keydown.enter.prevent="open"
    @keydown.space.prevent="open"
  >
    <header class="meta">
      <div class="avatar">
        <img
          :src="getAvatar(post)"
          alt="프로필 이미지"
          @error="(e) => (e.target.src = DEFAULT_AVATAR)"
        />
      </div>
      <div class="meta-text">
        <div class="author">{{ getAuthor(post) }}</div>
        <div class="time" v-if="getTime(post)">{{ getTime(post) }}</div>
        <div class="badge" v-if="badge">{{ badge }}</div>
      </div>
    </header>

    <h3 class="title">{{ post.title }}</h3>

    <footer class="stats">
      <span class="like">❤️ {{ getLikes(post) }}</span>
      <span class="comment">💬 {{ getComments(post) }}</span>
    </footer>

    <figure class="thumb" v-if="getThumbSrc()">
      <img
        :src="getThumbSrc()"
        alt="게시글 썸네일"
        loading="lazy"
        decoding="async"
        @error="(e) => (e.target.style.display = 'none')"
      />
    </figure>
  </article>
</template>

<style scoped>
.card {
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
  padding: 10px 12px;
  margin: 8px 10px;
  display: grid;
  grid-template-columns: 1fr 92px;
  grid-template-rows: auto auto auto;
  grid-template-areas:
    'meta   thumb'
    'title  thumb'
    'stats  thumb';
  column-gap: 10px;
  row-gap: 6px;
  cursor: pointer;
  outline: none;
}
.card:focus-visible {
  box-shadow: 0 0 0 2px var(--color-primary, #26c6da);
}

.meta {
  grid-area: meta;
  display: flex;
  align-items: center;
  gap: 8px;
}
.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  overflow: hidden;
  background: #f1f1f1;
}
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.meta-text {
  flex: 1;
  min-width: 0;
}
.author {
  font-size: 12px;
  font-weight: 700;
  color: #333;
  line-height: 1.2;
}
.time {
  margin-top: 1px;
  font-size: 10.5px;
  color: #8b8b8b;
}
.badge {
  display: inline-block;
  margin-top: 4px;
  background: #ffedcf;
  color: #ff9f1c;
  border-radius: 8px;
  padding: 1px 6px;
  font-size: 10px;
  font-weight: 700;
}

.title {
  grid-area: title;
  font-size: 14px;
  font-weight: 700;
  color: #2b2b2b;
  line-height: 1.28;
  margin-right: 2px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.stats {
  grid-area: stats;
  display: flex;
  gap: 10px;
  color: #8b8b8b;
  font-size: 11.5px;
}

.thumb {
  grid-area: thumb;
  align-self: center;
  width: 100%;
  height: 78px;
  border-radius: 14px;
  overflow: hidden;
  background: #f1f1f1;
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

@media (min-width: 420px) {
  .card {
    grid-template-columns: 1fr 104px;
    padding: 12px 14px;
  }
  .thumb {
    height: 88px;
  }
}
@media (min-width: 520px) {
  .card {
    grid-template-columns: 1fr 120px;
  }
  .thumb {
    height: 96px;
  }
}
</style>
