<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCommunityStore } from '@/stores/community/community';
import PostCard from '@/components/community/PostCard.vue';
import FabComposer from '@/components/community/FabComposer.vue';

const route = useRoute();
const router = useRouter();
const store = useCommunityStore();

const TABS = [
  { key: 'free', label: '자유수다' },
  { key: 'diet', label: '다이어트' },
  { key: 'work', label: '운동' },
  { key: 'love', label: '연애' },
];
const activeKey = ref(route.params.category ?? 'free');

const PAGE_SIZE = 10;
const loaded = ref(PAGE_SIZE);
const baseList = computed(() => store.list(activeKey.value));
const items = computed(() => baseList.value.slice(0, loaded.value));
const hasMore = computed(() => loaded.value < baseList.value.length);
const loadMore = () =>
  hasMore.value &&
  (loaded.value = Math.min(loaded.value + PAGE_SIZE, baseList.value.length));

const sentinel = ref(null);
let io;
function observe() {
  if (io) io.disconnect();
  io = new IntersectionObserver(
    (es) => es.forEach((e) => e.isIntersecting && loadMore()),
    { root: null, rootMargin: '120px', threshold: 0.01 }
  );
  if (sentinel.value) io.observe(sentinel.value);
}
onMounted(() => observe());
onBeforeUnmount(() => io && io.disconnect());

function selectTab(k) {
  if (activeKey.value !== k) {
    activeKey.value = k;
    loaded.value = PAGE_SIZE;
    router.replace({ name: 'CommunityCategory', params: { category: k } });
  }
}
watch(
  () => route.params.category,
  (v) => {
    const k = typeof v === 'string' ? v : 'free';
    if (TABS.some((t) => t.key === k)) {
      activeKey.value = k;
      loaded.value = PAGE_SIZE;
    }
  }
);

const openDetail = (p) =>
  router.push({ name: 'CommunityPost', params: { id: String(p.id) } });
const goWrite = (category) =>
  router.push({ name: 'CommunityWrite', params: { category } });
</script>

<template>
  <section class="category-feed">
    <div class="tabs">
      <button
        v-for="t in TABS"
        :key="t.key"
        class="tab"
        :class="{ active: t.key === activeKey }"
        @click="selectTab(t.key)"
      >
        {{ t.label }}
      </button>
    </div>

    <div class="list">
      <button
        v-for="p in items"
        :key="p.id"
        class="card-btn"
        @click="openDetail(p)"
      >
        <PostCard :post="p" />
      </button>

      <div ref="sentinel" class="sentinel"></div>
      <div v-if="!hasMore" class="end-caption caption">
        더 이상 게시물이 없습니다.
      </div>
    </div>

    <FabComposer @pick-category="goWrite" />
  </section>
</template>

<style scoped>
.category-feed {
  display: flex;
  flex-direction: column;
  gap: var(--gap-md);
}
.tabs {
  display: flex;
  gap: var(--gap-sm);
  padding: 0 var(--gap-lg);
  overflow-x: auto;
}
.tab {
  height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: #fff;
  color: var(--color-typo-secondary);
  font-size: var(--fs-body-2);
  white-space: nowrap;
  box-shadow: var(--shadow-sm);
}
.tab.active {
  background: #393e46;
  color: #fff;
  border-color: transparent;
}
.list {
  display: flex;
  flex-direction: column;
  gap: var(--gap-sm);
  padding: 0 var(--gap-lg) var(--gap-lg);
}
.card-btn {
  padding: 0;
  border: none;
  background: transparent;
  text-align: left;
}
.sentinel {
  height: 1px;
}
.end-caption {
  text-align: center;
  color: var(--color-typo-caption);
  margin-top: var(--gap-sm);
}
</style>
