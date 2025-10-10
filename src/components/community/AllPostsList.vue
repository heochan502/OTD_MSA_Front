<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import PopularList from '@/components/community/PopularList.vue';
import { useCommunityStore } from '@/stores/community/community';

const props = defineProps({
  /** 검색어(소문자 비교용 문자열이 오면 좋음) */
  query: { type: String, default: '' },
  idKey: { type: String, default: 'id' },
  detailRouteName: { type: String, default: 'CommunityPost' },
});

const router = useRouter();
const store = useCommunityStore();

const items = computed(() => {
  const q = (props.query || '').trim().toLowerCase();
  return store.allNormalized
    .filter((p) => (q ? (p.title ?? '').toLowerCase().includes(q) : true))
    .slice() // 복사
    .sort((a, b) => (b.createdAtMs ?? 0) - (a.createdAtMs ?? 0)); // 최신순
});

function open(post) {
  router.push({
    name: props.detailRouteName,
    params: { id: String(post[props.idKey]) },
  });
}

/* 무한 스크롤 */
const sentinel = ref(null);
let observer;

/** store 기준으로 더 로드 가능한지 */
const hasMore = computed(() => {
  const total = Number(store.total ?? 0);
  return items.value.length < total;
});

async function onIntersect(entries) {
  const ent = entries[0];
  if (!ent.isIntersecting) return;
  if (!hasMore.value) return;
  if (store.loading) return;

  try {
    await store.loadMorePosts(); // 다음 페이지 이어붙이기
  } catch (e) {
    console.error('[AllPostsList] loadMorePosts failed:', e);
  }
}

onMounted(() => {
  observer = new IntersectionObserver(onIntersect, {
    root: null,
    threshold: 0.1,
  });
  if (sentinel.value) observer.observe(sentinel.value);
});

onBeforeUnmount(() => {
  if (observer) observer.disconnect();
});
</script>

<template>
  <PopularList
    :items="items"
    :navigateOnClick="false"
    :id-key="idKey"
    :route-param-key="idKey"
    @click-post="open"
  />

  <!-- 무한스크롤 센티넬 -->
  <div ref="sentinel" style="height: 1px"></div>

  <!-- 로딩/끝 상태 -->
  <div v-if="store.loading" class="hint">불러오는 중…</div>
  <div v-else-if="!hasMore" class="hint">모든 글을 불러왔어요 👌</div>
</template>

<style scoped>
.hint {
  text-align: center;
  color: #8b8b8b;
  font-size: 12px;
  padding: 10px 0 16px;
}
</style>
