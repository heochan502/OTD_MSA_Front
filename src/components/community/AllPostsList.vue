<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import PopularList from '@/components/community/PopularList.vue';
import { useCommunityStore } from '@/stores/community/community';

const props = defineProps({
  query: { type: String, default: '' },
  idKey: { type: String, default: 'id' },
  detailRouteName: { type: String, default: 'CommunityPost' },
});

const router = useRouter();
const store = useCommunityStore();

const items = computed(() => {
  const q = (props.query || '').trim().toLowerCase();
  return store.allNormalized
    .filter(Boolean)
    .filter((p) => (q ? (p.title ?? '').toLowerCase().includes(q) : true))
    .map((p) => ({
      ...p,
      createdAtMs:
        Number(
          p?.createdAtMs ?? (p?.createdAt ? Date.parse(p.createdAt) : 0)
        ) || 0,
    }))
    .sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
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
    // 프로젝트에 이미 구현되어 있다 가정
    if (typeof store.loadMorePosts === 'function') {
      await store.loadMorePosts();
    }
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
    :showBadge="false"
    @click-post="open"
  />

  <div ref="sentinel" style="height: 1px"></div>

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
