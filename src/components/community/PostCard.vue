<script setup>
import { useRouter } from 'vue-router';

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

const emit = defineEmits(['click']);
const router = useRouter();

const getId = (p) => p?.[props.idKey] ?? p?.id ?? p?.postId;
const getAuthor = (p) =>
  p?.author ?? p?.writer?.nickName ?? p?.nickName ?? '익명';
const getTime = (p) => p?.time ?? p?.createdAt ?? '';
const getLikes = (p) => p?.likes ?? p?.like ?? p?.likeCount ?? 0;
const getComments = (p) => p?.comments ?? p?.commentCount ?? 0;
const getThumb = (p) =>
  props.thumbnailUrl || p?.[props.thumbnailKey] || p?.thumb || p?.image;

function open() {
  if (!props.clickable) return emit('click', props.post);
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
    <!-- 왼쪽 상단: 작성자/시간 -->
    <header class="meta">
      <span class="avatar" aria-hidden="true"></span>
      <div class="meta-text">
        <div class="author">{{ getAuthor(post) }}</div>
        <div class="time" v-if="getTime(post)">{{ getTime(post) }}</div>
        <div class="badge" v-if="badge">{{ badge }}</div>
      </div>
    </header>

    <!-- 왼쪽 중단: 제목 -->
    <h3 class="title">{{ post.title }}</h3>

    <!-- 왼쪽 하단: 통계 -->
    <footer class="stats">
      <span class="like">❤️ {{ getLikes(post) }}</span>
      <span class="comment">💬 {{ getComments(post) }}</span>
    </footer>

    <!-- 오른쪽: 썸네일(없어도 칸은 보이게) -->
    <figure class="thumb" v-if="getThumb(post)">
      <img :src="getThumb(post)" alt="" loading="lazy" decoding="async" />
    </figure>
    <div class="thumb thumb--skeleton" v-else aria-hidden="true"></div>
  </article>
</template>

<style scoped>
/* 카드 컨테이너: 폭/오버플로우 방지 */
.card {
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  overflow: hidden; /* 🔹 튀어나오는 것 방지 */
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
  padding: 10px 12px; /* 🔹 패딩 축소 */
  margin: 8px 10px; /* 🔹 카드 간격 축소 */
  display: grid;
  grid-template-columns: 1fr 92px; /* 🔹 썸네일 너비 축소 (기존 112px) */
  grid-template-rows: auto auto auto;
  grid-template-areas:
    'meta   thumb'
    'title  thumb'
    'stats  thumb';
  column-gap: 10px; /* 🔹 간격 축소 */
  row-gap: 6px;
  cursor: pointer;
  outline: none;
}
.card:focus-visible {
  box-shadow: 0 0 0 2px var(--color-primary, #26c6da);
}

/* 오른쪽 썸네일: 높이 축소 + 알약형 유지 */
.thumb {
  grid-area: thumb;
  align-self: center;
  width: 100%;
  height: 78px; /* 🔹 세로 확 줄임 (필요시 72~84px로 조절) */
  border-radius: 14px; /* 알약 */
  overflow: hidden;
  background: #f1f1f1;
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.thumb--skeleton {
  background: linear-gradient(90deg, #f1f1f1 0%, #ececec 50%, #f1f1f1 100%);
  background-size: 200% 100%;
  animation: shine 1.2s infinite linear;
}
@keyframes shine {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 메타: 닉네임 아래 시간 줄바꿈 유지, 폰트/간격 축소 */
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
  background: #eaeaea;
  box-shadow: inset 0 2px 3px rgba(0, 0, 0, 0.06);
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
  display: block;
  margin-top: 1px;
  font-size: 10.5px;
  color: #8b8b8b;
  line-height: 1.1;
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

/* 제목: 두 줄까지만 표시 (높이 제어) */
.title {
  grid-area: title;
  font-size: 14px; /* 🔹 살짝 축소 */
  font-weight: 700;
  color: #2b2b2b;
  line-height: 1.28;
  margin-right: 2px;

  display: -webkit-box; /* 🔹 라인 클램프 */
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 통계: 폰트/간격 축소 */
.stats {
  grid-area: stats;
  display: flex;
  gap: 10px;
  color: #8b8b8b;
  font-size: 11.5px;
}

/* 살짝 넓은 화면에서만 약간 키우기 */
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
