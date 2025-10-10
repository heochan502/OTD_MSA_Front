<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import CommunitySearch from '@/components/community/CommunitySearch.vue';
import CommunityCategory from '@/components/community/CommunityCategory.vue';
import PopularList from '@/components/community/PopularList.vue';
import AllPostsList from '@/components/community/AllPostsList.vue';
import ComposeForm from '@/components/community/ComposeForm.vue';
import { useCommunityStore } from '@/stores/community/community';

const iconFreeUrl = new URL('@/assets/img/community/free.png', import.meta.url)
  .href;
const iconDietUrl = new URL('@/assets/img/community/diet.png', import.meta.url)
  .href;
const iconWorkUrl = new URL(
  '@/assets/img/community/workout.png',
  import.meta.url
).href;
const iconLoveUrl = new URL('@/assets/img/community/love.png', import.meta.url)
  .href;

const router = useRouter();
const store = useCommunityStore();

onMounted(async () => {
  await store.loadPosts(1, 20, '');
});

// ✅ 생성된 URL을 그대로 넘김
const categories = [
  { key: 'free', label: '자유수다', icon: iconFreeUrl },
  { key: 'diet', label: '다이어트', icon: iconDietUrl },
  { key: 'work', label: '운동', icon: iconWorkUrl },
  { key: 'love', label: '연애', icon: iconLoveUrl },
];

const searchVal = ref('');

const allPosts = computed(() =>
  ['free', 'diet', 'work', 'love'].flatMap((k) => store.list(k))
);
const query = computed(() => searchVal.value.trim().toLowerCase());
const TOP_N = 3;
const popularTop = computed(() =>
  allPosts.value
    .filter((p) =>
      query.value ? (p.title ?? '').toLowerCase().includes(query.value) : true
    )
    .slice()
    .sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0))
    .slice(0, TOP_N)
);

const handleSelectCategory = (key) =>
  router.push({ name: 'CommunityCategory', params: { category: key } });

function handleSearchSubmit(q) {
  searchVal.value = q;
  router.push({
    name: 'CommunityCategory',
    params: { category: 'free' },
    query: { q },
  });
}

const handleClickPost = (post) =>
  router.push({ name: 'CommunityPost', params: { id: String(post.id) } });

const showOverlay = ref(false);
const composeStep = ref('none');
const selectedCategory = ref('');

function openCompose() {
  showOverlay.value = true;
  composeStep.value = 'pick';
}
function closeOverlay() {
  showOverlay.value = false;
  composeStep.value = 'none';
  selectedCategory.value = '';
}
function onPickCategory(key) {
  selectedCategory.value = key;
  composeStep.value = 'form';
}
async function onSubmitSuccess() {
  closeOverlay();
  (await store.reloadFirstPage?.()) ?? store.loadPosts(1, 20, '');
}
</script>

<template>
  <div class="cv-wrap">
    <section :class="['community-page', { blurred: showOverlay }]">
      <div class="section-card top-card">
        <div class="head-row">
          <div class="search-line">
            <CommunitySearch
              v-model="searchVal"
              class="search-flex"
              placeholder="검색어를 입력해 주세요"
              @submit="handleSearchSubmit"
            />
            <button
              class="compose-emoji"
              aria-label="글쓰기"
              @click="openCompose"
            >
              +
            </button>
          </div>
        </div>

        <div class="cat-wrap">
          <CommunityCategory
            :categories="categories"
            :selected="''"
            @select="handleSelectCategory"
          />
        </div>
      </div>

      <h3 class="section-title">인기글</h3>
      <div class="section-card list-card">
        <PopularList
          :items="popularTop"
          detail-route-name="CommunityPost"
          :navigateOnClick="true"
          id-key="id"
          route-param-key="id"
          @click-post="handleClickPost"
        />
      </div>

      <h3 class="section-title">전체글</h3>
      <div class="section-card list-card">
        <AllPostsList :query="query" />
      </div>
    </section>

    <!-- 오버레이(기존 그대로) -->
    <div v-if="showOverlay" class="overlay-full" @click.self="closeOverlay">
      <div v-if="composeStep === 'pick'" class="picker-floating">
        <button class="pill" @click="onPickCategory('free')">자유수다</button>
        <button class="pill" @click="onPickCategory('diet')">다이어트</button>
        <button class="pill" @click="onPickCategory('work')">운동</button>
        <button class="pill" @click="onPickCategory('love')">연애</button>
      </div>

      <ComposeForm
        v-if="composeStep === 'form'"
        v-model:category="selectedCategory"
        @cancel="closeOverlay"
        @submitted="onSubmitSuccess"
      />
    </div>
  </div>
</template>

<style scoped>
/* 기존 스타일 그대로 */
.cv-wrap {
  margin: 0 !important;
  align-self: stretch;
  width: 100%;
  min-height: 100%;
  background: #f4f6f8;
  overflow-x: hidden;
}
.community-page {
  width: 100%;
  max-width: 420px;
  margin-left: auto !important;
  margin-right: auto !important;
  padding: 16px 16px 28px !important;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-sizing: border-box;
  transition: filter 0.2s ease, opacity 0.2s ease;
}
.blurred {
  filter: blur(2px);
  opacity: 0.6;
}
.section-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(17, 24, 39, 0.07);
  border: 1px solid #eef1f4;
  margin-left: 0 !important;
  margin-right: 0 !important;
}
.top-card {
  padding: 14px;
}
.list-card {
  padding: 10px;
}
.section-title {
  margin: 4px 0 0 !important;
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
}
.head-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.search-line {
  display: flex;
  align-items: center;
  gap: 10px;
}
.search-flex {
  flex: 1;
}
.compose-emoji {
  padding-bottom: 5px;
  width: 44px;
  height: 44px;
  border: 1px solid #e8ebef;
  background: #fff;
  border-radius: 50%;
  font-size: 30px;
  line-height: 1;
  display: grid;
  place-items: center;
  box-shadow: 0 4px 10px rgba(17, 24, 39, 0.06);
  cursor: pointer;
}
.cat-wrap {
  margin-top: 8px;
}
:deep(.cat-row) {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 0 2px;
  margin: 0;
}

.overlay-full {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border-radius: 0; /* 둥근 모서리 제거 */
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
  z-index: 999;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding-left: 12px;
  padding-top: 96px;
  padding-right: 12px;
}
.picker-floating {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.pill {
  min-width: 96px;
  padding: 10px 14px;
  border-radius: 999px;
  background: #fff;
  border: none;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);
  font-weight: 700;
  color: #333;
  cursor: pointer;
  text-align: center;
}
.pill-cancel {
  background: #f7f7f7;
  color: #666;
}
*,
*::before,
*::after {
  box-sizing: border-box;
}
</style>
