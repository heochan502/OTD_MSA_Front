<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import CommunitySearch from '@/components/community/CommunitySearch.vue';
import CommunityCategory from '@/components/community/CommunityCategory.vue';
import PopularList from '@/components/community/PopularList.vue';
import ComposeCategoryPicker from '@/components/community/ComposeCategoryPicker.vue';
import ComposeForm from '@/components/community/ComposeForm.vue';
import { useCommunityStore } from '@/stores/community/community';

const router = useRouter();
const store = useCommunityStore();

onMounted(() => {
  store.loadPosts(1, 10, '');
});

const categories = [
  { key: 'free', label: '자유수다', icon: '/image/community/free.png' },
  { key: 'diet', label: '다이어트', icon: '/image/community/diet.png' },
  { key: 'work', label: '운동', icon: '/image/community/workout.png' },
  { key: 'love', label: '연애', icon: '/image/community/love.png' },
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
      query.value ? p.title.toLowerCase().includes(query.value) : true
    )
    .slice()
    .sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0))
    .slice(0, TOP_N)
);

const handleSelectCategory = (key) =>
  router.push({ name: 'CommunityCategory', params: { category: key } });
const handleSearchSubmit = (q) => (searchVal.value = q);
const handleClickPost = (post) =>
  router.push({ name: 'CommunityPost', params: { id: String(post.id) } });

// 글쓰기 플로우
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
function onSubmitSuccess() {
  closeOverlay();
  store.loadPosts(1, 10, '');
}
</script>

<template>
  <div class="wrap">
    <section class="community-page" :class="{ blurred: showOverlay }">
      <div class="search-line">
        <CommunitySearch
          v-model="searchVal"
          class="search-flex"
          placeholder="검색어를 입력해 주세요"
          @submit="handleSearchSubmit"
        />
        <button class="compose-emoji" aria-label="글쓰기" @click="openCompose">
          ➕
        </button>
      </div>

      <CommunityCategory
        :categories="categories"
        :selected="''"
        @select="handleSelectCategory"
      />

      <div class="section-title">인기글</div>
      <PopularList
        :items="popularTop"
        detail-route-name="CommunityPost"
        :navigateOnClick="true"
        id-key="postId"
        route-param-key="id"
      />
    </section>

    <!-- 오버레이 -->
    <div v-if="showOverlay" class="overlay-full" @click.self="closeOverlay">
      <div class="picker-floating">
        <button class="pill" @click="onPickCategory('free')">자유수다</button>
        <button class="pill" @click="onPickCategory('diet')">다이어트</button>
        <button class="pill" @click="onPickCategory('work')">운동</button>
        <button class="pill" @click="onPickCategory('love')">연애</button>
        <button class="pill pill-cancel" @click="closeOverlay">취소</button>
      </div>

      <ComposeForm
        v-if="composeStep === 'form'"
        :category="selectedCategory"
        @cancel="closeOverlay"
        @submitted="onSubmitSuccess"
      />
    </div>
  </div>
</template>

<style scoped>
.wrap {
  position: relative;
  width: 100%;
  height: 100%;
}

.community-page {
  display: flex;

  flex-direction: column;
  gap: 14px;
  transition: filter 0.2s ease, opacity 0.2s ease;
}
.blurred {
  filter: blur(2px);
  opacity: 0.6;
}

.search-line {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 var(--gap-lg);
}
.search-flex {
  flex: 1;
}
.compose-emoji {
  margin-right: 28px;
  width: 44px;
  height: 44px;
  border-radius: 22px;
  border: none;
  background: #e6e6e6;
  font-size: 22px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
  cursor: pointer;
}

/* ✅ 뷰포트 기준으로 전체 덮기 */
.overlay-full {
  position: fixed; /* 뷰포트 전체 */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 390px; /* 아이폰 12 프레임과 동일 */
  height: 805px;
  border-radius: 60px;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
  z-index: 999;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding-top: 96px;
  padding-right: 12px;
}

/* 버튼 스택 */
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
</style>
