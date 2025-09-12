import { createRouter, createWebHistory } from 'vue-router';

// 공통 뷰
import Test from '@/components/test.vue';
import Home from '@/views/HomeView.vue';

// 커뮤니티
import Community from '@/views/community/CommunityView.vue';
import CategoryFeedView from '@/views/community/categories/CategoryFeedView.vue';

// 챌린지
import ChallengeHome from '@/views/challenge/ChallengeHome.vue';
import ChallengeList from '@/views/challenge/ChallengeList.vue';

// 포인트샵
import PointShop from '@/components/pointshop/PointShop.vue';

// 카테고리 라벨 맵
const CATEGORY_LABEL = {
  free: '자유수다',
  diet: '다이어트',
  work: '운동',
  love: '연애',
};

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: { headerType: 'logo', showUserPanel: true },
    },
    {
      path: '/community',
      name: 'Community',
      component: Community,
      meta: { headerType: 'title', title: '커뮤니티', showUserPanel: false },
    },
    {
      path: '/community/:category(free|diet|work|love)',
      name: 'CommunityCategory',
      component: CategoryFeedView,
      props: true,
      meta: {
        headerType: 'title',
        showUserPanel: false,
        title: (route) => CATEGORY_LABEL[route.params.category] ?? '',
      },
    },
    {
      path: '/test',
      name: 'Test',
      component: Test,
      meta: { headerType: 'title', title: '테스트', showUserPanel: false },
    },
    {
      path: '/challenge',
      name: 'ChallengeHome',
      component: ChallengeHome,
      meta: { headerType: 'title', title: '챌린지', showUserPanel: false },
    },
    {
      path: '/challenge/list',
      name: 'ChallengeList',
      component: ChallengeList,
      meta: { headerType: 'title', title: '챌린지 목록', showUserPanel: false },
    },
    {
      path: '/pointshop',
      name: 'PointShop',
      component: PointShop,
      meta: { headerType: 'title', title: '포인트샵', showUserPanel: false },
    },
  ],
});

export default router;
