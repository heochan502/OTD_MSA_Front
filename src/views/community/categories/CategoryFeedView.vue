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
  { key: 'all', label: '전체' },
  { key: 'free', label: '자유수다' },
  { key: 'diet', label: '다이어트' },
  { key: 'work', label: '운동' },
  { key: 'love', label: '연애' },
];

const validKeys = new Set(TABS.map((t) => t.key));
const initialKey =
  typeof route.params.category === 'string' &&
  validKeys.has(route.params.category)
    ? route.params.category
    : 'all';

const activeKey = ref(initialKey);

// 페이지네이션 관리
const PAGE_SIZE = 10;
const page = ref(1);
const items = ref([]);
const hasMore = ref(true);
const loading = ref(false);

// 게시글 불러오기 (페이지 단위)
async function fetchByActiveKey(reset = false) {
  if (loading.value) return;
  loading.value = true;

  try {
    if (reset) {
      page.value = 1;
      items.value = [];
      hasMore.value = true;
    }

    const key = activeKey.value === 'all' ? undefined : activeKey.value;
    const res = await store.loadPosts(page.value, PAGE_SIZE, key);

    // store.posts 갱신 후 실제 데이터 가져오기
    const newPosts =
      activeKey.value === 'all'
        ? store.allNormalized
        : store.list(activeKey.value);

    if (reset) {
      items.value = [...newPosts];
    } else {
      const seen = new Set(items.value.map((p) => p.id));
      const append = newPosts.filter((p) => !seen.has(p.id));
      items.value.push(...append);
    }

    // 다음 페이지 여부 판정
    if (newPosts.length < PAGE_SIZE * page.value) {
      hasMore.value = false;
    } else {
      page.value += 1;
    }
  } catch (err) {
    console.error('[fetchByActiveKey]', err);
  } finally {
    loading.value = false;
  }
}

// 무한 스크롤 감지
const sentinel = ref(null);
let io;
function observe() {
  if (io) io.disconnect();
  io = new IntersectionObserver(
    (entries) => {
      if (
        entries.some((e) => e.isIntersecting) &&
        hasMore.value &&
        !loading.value
      ) {
        fetchByActiveKey(false);
      }
    },
    { root: null, rootMargin: '120px', threshold: 0.01 }
  );
  if (sentinel.value) io.observe(sentinel.value);
}

onMounted(async () => {
  await fetchByActiveKey(true);
  observe();

  if (route.query.posted === '1') {
    showPostedToast();
    router.replace({
      name: 'CommunityCategory',
      params: { category: activeKey.value },
    });
  }
});

onBeforeUnmount(() => io && io.disconnect());

// 탭 전환 시 리셋
function selectTab(k) {
  if (activeKey.value !== k) {
    activeKey.value = k;
    router.replace({ name: 'CommunityCategory', params: { category: k } });
    fetchByActiveKey(true);
  }
}

// 라우트 변경 감지
watch(
  () => route.params.category,
  (v) => {
    const k = typeof v === 'string' && validKeys.has(v) ? v : 'all';
    if (activeKey.value !== k) {
      activeKey.value = k;
      fetchByActiveKey(true);
    }
  }
);

const openDetail = (p) =>
  router.push({ name: 'CommunityPost', params: { id: String(p.id) } });

// 토스트
const toastOpen = ref(false);
const toastMessage = ref('');
function showPostedToast() {
  toastMessage.value = '게시글이 등록되었습니다.';
  toastOpen.value = true;
  setTimeout(() => (toastOpen.value = false), 1600);
}
</script>

<template>
  <div class="cf-wrap">
    <section class="category-page">
      <!-- 탭 -->
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

      <!-- 리스트 -->
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
  height: 100vh;
  margin: 0 !important;
  align-self: stretch;
  width: 100%;
  background: #f4f6f8;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-gutter: stable both-edges;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.cf-wrap::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

/* ===== 페이지 기본 ===== */
.category-page {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  padding: 14px 14px 28px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-sizing: border-box;
  overflow-x: hidden;
}

/* ===== 카드 공통 ===== */
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

/* ===== 탭 ===== */
.tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 2px;
  scrollbar-width: none;
}
.tabs::-webkit-scrollbar {
  display: none;
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
  cursor: pointer;
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
  overflow-x: hidden;
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

/* ===== 전역 스크롤 차단 ===== */
:global(html),
:global(body) {
  overflow-x: hidden;
  overflow-y: hidden;
  height: 100%;
  overscroll-behavior-x: none;
}
</style>
