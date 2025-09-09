<script setup>
import { ref, computed, onMounted } from 'vue';
import CommunitySearch from '@/components/community/CommunitySearch.vue';
import CommunityCategory from '@/components/community/CommunityCategory.vue';
import CommunityList from '@/components/community/CommunityList.vue';

// 카테고리(자유수다/다이어트/운동/연애)
const categories = [
  { key: 'free',  label: '자유수다', icon: '/image/community/free.png' },
  { key: 'diet',  label: '다이어트', icon: '/image/community/diet.png' },
  { key: 'work',  label: '운동',     icon: '/image/community/workout.png' },
  { key: 'love',  label: '연애',     icon: './image/community/love.png' },
];

const search = ref('');
const selected = ref('free'); // 기본: 자유수다

// TODO: API 연동 시 여기서 불러오기
const posts = ref([
  { id: 101, category: 'free', title: '대구 맛집 추천해주세요', author: '고은 정우',  likes: 12, comments: 4, time: '2시간 전' },
  { id: 102, category: 'diet', title: '1일 1사과 괜찮나요?ㅠ', author: '이한결',   likes: 5,  comments: 1, time: '3시간 전' },
  { id: 103, category: 'work', title: '하체 루틴 공유합니다',   author: '민서',     likes: 8,  comments: 3, time: '5시간 전' },
  { id: 104, category: 'love', title: '연애 고민 들어주실 분',   author: '레나',     likes: 21, comments: 9, time: '1일 전' },
  { id: 105, category: 'free', title: '부산여행 코스 추천!',     author: '이찬',     likes: 3,  comments: 0, time: '1일 전' },
]);

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  return posts.value
    .filter(p => p.category === selected.value)
    .filter(p => (q ? p.title.toLowerCase().includes(q) : true));
});

function handleSearchSubmit(q) {
  search.value = q;
}

function handleSelectCategory(key) {
  selected.value = key;
  // 카테고리 바뀌면 검색어 초기화(선택)
  // search.value = '';
}

function handleClickPost(post) {
  // TODO: 상세 라우팅
  // router.push({ name: 'community-detail', params: { id: post.id } });
  console.log('open post:', post.id);
}

onMounted(() => {
  // 초기 로드 시 API 호출 자리
});
</script>

<template>
  <section class="community-page">
    <!-- 검색 -->
    <CommunitySearch
      v-model="search"
      placeholder="검색어를 입력해 주세요"
      @submit="handleSearchSubmit"
    />

    <!-- 카테고리 -->
    <CommunityCategory
      :categories="categories"
      :selected="selected"
      @select="handleSelectCategory"
    />

    <!-- 인기글 섹션 타이틀 -->
    <div class="section-title">인기글</div>

    <!-- 리스트 -->
    <CommunityList
      :items="filtered"
      @click-post="handleClickPost"
    />
  </section>
</template>

<style scoped>
.community-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.section-title {
  margin: 6px 0 2px;
  font-weight: 700;
  color: #4b4b4b;
}
</style>
