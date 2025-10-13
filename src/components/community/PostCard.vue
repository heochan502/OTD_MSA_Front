<script setup>
import { useRouter } from 'vue-router';
import axios from '@/services/httpRequester';

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

const getId = (p) => p?.[props.idKey] ?? p?.id ?? p?.postId;
const getAuthor = (p) =>
  p?.author ?? p?.writer?.nickName ?? p?.nickName ?? '익명';
const getTime = (p) => p?.time ?? p?.createdAt ?? '';
const getLikes = (p) => p?.likes ?? p?.like ?? p?.likeCount ?? 0;
const getComments = (p) => p?.comments ?? p?.commentCount ?? 0;

function toAbsUrl(p) {
  if (!p) return '';
  if (/^https?:\/\//i.test(p)) return p;
  try {
    return new URL(p, axios.defaults.baseURL).toString();
  } catch {
    // 상대경로가 public 자산인 경우
    return p.startsWith('/')
      ? p
      : import.meta.env.BASE_URL + p.replace(/^\.?\//, '');
  }
}

function getAvatar(p) {
  const raw =
    p?.avatar ||
    p?.profileImage ||
    p?.profileImg ||
    p?.memberImg ||
    p?.writer?.memberImg ||
    '';
  const url = raw ? toAbsUrl(raw) : DEFAULT_AVATAR;
  return url || DEFAULT_AVATAR;
}

const getThumb = (p) =>
  props.thumbnailUrl || p?.[props.thumbnailKey] || p?.thumb || p?.image;

function open() {
  if (!props.clickable) return;
  const id = getId(props.post);
  if (!id) return;
  router.push({
    name: props.routeName,
    params: { [props.routeParamKey]: String(id) },
  });
}
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
          alt=""
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

    <figure class="thumb" v-if="getThumb(post)">
      <img :src="getThumb(post)" alt="" loading="lazy" decoding="async" />
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
