<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCommunityStore } from '@/stores/community/community';
import PostCard from '@/components/community/PostCard.vue';
import Toast from '@/components/community/Toast.vue';

const route = useRoute();
const router = useRouter();
const store = useCommunityStore();

const TABS = [
  { key: 'free', label: '자유수다' },
  { key: 'diet', label: '다이어트' },
  { key: 'work', label: '운동' },
  { key: 'love', label: '연애' },
];
const activeKey = ref(
  typeof route.params.category === 'string' ? route.params.category : 'free'
);

const PAGE_SIZE = 10;
const loaded = ref(PAGE_SIZE);

// 스토어에 쌓인 서버 응답을 카테고리로 필터링
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

onMounted(async () => {
  // ★ 최초 로드 시에도 categoryKey 전달
  await store.loadPosts(1, PAGE_SIZE, activeKey.value);
  observe();

  // 작성 성공 플래그 감지 → 토스트
  if (route.query.posted === '1') {
    showPostedToast();
    // 쿼리 제거(뒤로가기 시 토스트 재표시 방지)
    router.replace({
      name: 'CommunityCategory',
      params: { category: activeKey.value },
    });
  }
});

onBeforeUnmount(() => io && io.disconnect());

// 탭 전환 시: 라우팅 + categoryKey로 재조회
function selectTab(k) {
  if (activeKey.value !== k) {
    activeKey.value = k;
    loaded.value = PAGE_SIZE;
    router.replace({ name: 'CommunityCategory', params: { category: k } });
    store.loadPosts(1, PAGE_SIZE, k); // ★ 전달
  }
}

// 라우트 파라미터 변경 시에도 재조회
watch(
  () => route.params.category,
  (v) => {
    const k = typeof v === 'string' ? v : 'free';
    if (TABS.some((t) => t.key === k)) {
      activeKey.value = k;
      loaded.value = PAGE_SIZE;
      store.loadPosts(1, PAGE_SIZE, k); // ★ 전달
    }
  }
);

const openDetail = (p) =>
  router.push({ name: 'CommunityPost', params: { id: String(p.id) } });
const goWrite = (category) =>
  router.push({ name: 'CommunityWrite', params: { category } });

// ----- Toast 상태 -----
const toastOpen = ref(false);
const toastMessage = ref('');
function showPostedToast() {
  toastMessage.value = '게시글이 등록되었습니다.';
  toastOpen.value = true;
  setTimeout(() => (toastOpen.value = false), 1600);
}
</script>

<template>
  <!-- 전역 중앙정렬 영향을 최소화한 래퍼 -->
  <div class="cf-wrap">
    <section class="category-page">
      <!-- 탭 패널 -->
      <div class="section-card tabs-card">
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
      </div>

      <!-- 리스트 패널 -->
      <div class="section-card list-card">
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
          <div v-if="!hasMore" class="end-caption">
            더 이상 게시물이 없습니다.
          </div>
        </div>
      </div>

      <Toast :open="toastOpen" :message="toastMessage" />
    </section>
  </div>
</template>

<style scoped>
/* ===== 페이지 래퍼 ===== */
.cf-wrap {
  margin: 0 !important;
  align-self: stretch;
  width: 100%;
  min-height: 100%;
  background: #f4f6f8;
  overflow-x: hidden;
}

/* 가운데 정렬 + 대칭 패딩 */
.category-page {
  width: 100%;
  max-width: 420px;
  margin-left: auto;
  margin-right: auto;
  padding: 14px 14px 28px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-sizing: border-box;
}

/* ===== 공통 카드 패널 ===== */
.section-card {
  background: #fff;
  border-radius: 18px;
  border: 1px solid #eef1f4;
  box-shadow: 0 8px 24px rgba(17, 24, 39, 0.07);
}
.tabs-card {
  padding: 10px 10px 12px;
}
.list-card {
  padding: 6px 8px 10px;
}

/* ===== 탭(칩) ===== */
.tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 2px;
}
.tab {
  height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid #e8ebef;
  background: #ffffff;
  color: #4b5563;
  font-size: 14px;
  white-space: nowrap;
  box-shadow: 0 3px 8px rgba(17, 24, 39, 0.05);
}
.tab.active {
  background: #393e46;
  color: #fff;
  border-color: transparent;
}

/* ===== 리스트 ===== */
.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 6px;
}
.card-btn {
  padding: 0;
  border: none;
  background: transparent;
  text-align: left;
}
:deep(.post-card),
:deep(.v-card),
:deep(.card) {
  box-shadow: none !important;
  border: none !important;
  background: transparent !important;
}

.sentinel {
  height: 1px;
}
.end-caption {
  text-align: center;
  color: #9aa3af;
  margin: 8px 0 2px;
  font-size: 13px;
}
</style>
