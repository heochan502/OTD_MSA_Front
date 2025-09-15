<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import CommunitySearch from '@/components/community/CommunitySearch.vue';
import CommunityCategory from '@/components/community/CommunityCategory.vue';
import PopularList from '@/components/community/PopularList.vue';
import { useCommunityStore } from '@/stores/community/community';

const router = useRouter();
const store = useCommunityStore();

onMounted(() => {
  // 최초 진입 시 더미/실데이터 로드
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
    .sort((a, b) => b.likes - a.likes)
    .slice(0, TOP_N)
);

const handleSelectCategory = (key) =>
  router.push({ name: 'CommunityCategory', params: { category: key } });
const handleSearchSubmit = (q) => (searchVal.value = q);
const handleClickPost = (post) =>
  router.push({ name: 'CommunityPost', params: { id: String(post.id) } });
</script>

<template>
  <div class="wrap">
    <section class="community-page">
      <CommunitySearch
        v-model="searchVal"
        placeholder="검색어를 입력해 주세요"
        @submit="handleSearchSubmit"
      />
      <CommunityCategory
        :categories="categories"
        :selected="''"
        @select="handleSelectCategory"
      />
      <div class="section-title">인기글</div>
      <PopularList
        :items="popularTop"
        empty-text="인기글이 아직 없어요."
        :navigateOnClick="false"
        @click-post="handleClickPost"
      />
    </section>
  </div>
</template>

<style scoped>
.community-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.section-title {
  margin: 8px 0 2px;
  font-weight: 700;
  color: #4b4b4b;
  padding: 0 var(--gap-lg);
}
.wrap {
  margin-top: 30px;
}
</style>
