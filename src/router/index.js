import { createRouter, createWebHistory } from 'vue-router';
import { useAuthenticationStore } from '@/stores/user/authentication';

// 공통 뷰
import Home from '@/views/HomeView.vue';

// 커뮤니티
import Community from '@/views/community/CommunityView.vue';
import CategoryFeedView from '@/views/community/categories/CategoryFeedView.vue';
import PostDetailView from '@/views/community/PostDetailView.vue';
// 챌린지
import ChallengeHome from '@/views/challenge/ChallengeHome.vue';
import ChallengeAllList from '@/views/challenge/ChallengeAllList.vue';
import ChallengeWeeklyList from '@/views/challenge/ChallengeWeeklyList.vue';
import ChallengeCompetitionList from '@/views/challenge/ChallengeMonthlyList.vue';

import Login from '@/views/user/Login.vue';
import Join from '@/views/user/Join.vue';
import PassCallback from '@/views/auth/PassCallback.vue';
import Oauth2 from '@/views/auth/OAuth2Handler.vue';

import PayApproval from '@/views/pay/PayApproval.vue';
import PayCancel from '@/views/pay/PayCancel.vue';
import PayCompleted from '@/views/pay/PayCompleted.vue';
import PayFail from '@/views/pay/PayFail.vue';

// 포인트샵
import PointShop from '@/components/pointshop/PointShop.vue';

//식단
import MealMainView from '@/views/meal/MealMainView.vue';

import MealDetailView from '@/views/meal/MealDetailView.vue';
>>>>>>>>> Temporary merge branch 2

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
      path: '/community/post/:id(\\d+)',
      name: 'CommunityPost',
      component: PostDetailView,
      meta: { headerType: 'title', title: '커뮤니티', showUserPanel: false },
      props: true,
    },

    {
      path: '/test',
      name: 'Test',
      component: () => import('@/components/test.vue'),
      meta: { headerType: 'title', title: '테스트', showUserPanel: false },
    },
    {
      path: '/challenge',
      name: 'ChallengeHome',
      component: ChallengeHome,
      meta: { headerType: 'title', title: '챌린지', showUserPanel: false },
    },
    {
      path: '/challenge/alllist',
      name: 'ChallengeAllList',
      component: ChallengeAllList,
      meta: { headerType: 'title', title: '챌린지 목록', showUserPanel: false },
    },
    {
      path: "/challenge/dailylist",
      name: "ChallengedailyList",
      component: ChallengeWeeklyList,
      meta: {
        headerType: "title",
        title: "일일 미션 목록",
        showUserPanel: false,
      },
    },
    {
      path: "/challenge/weeklylist",
      name: "ChallengeweeklyList",
      component: ChallengeWeeklyList,
      meta: {
        headerType: "title",
        title: "주간 챌린지 목록",
        showUserPanel: false,
      },
    },
    {
      path: "/challenge/competitionlist",
      name: "ChallengecompetitionList",
      component: ChallengeCompetitionList,
      meta: {
        headerType: "title",
        title: "월간 경쟁챌린지 목록",
        showUserPanel: false,
      },
    },
    {
      path: "/challenge/personallist",
      name: "ChallengepersonalList",
      component: ChallengeWeeklyList,
      meta: {
        headerType: "title",
        title: "월간 개인챌린지 목록",
        showUserPanel: false,
      },
    },
<<<<<<<<< Temporary merge branch 1
=========
    { path: '/user/login', name: 'login', component: Login },
>>>>>>>>> Temporary merge branch 2
    {
      path: '/challenge/detail/:id',
      name: 'ChallengeDetail',
      component: ChallengePer,
      props: (route) => ({
        id: Number(route.params.id),
        name: route.params.name,
      }),
      meta: {
        headerType: 'title',
        title: '',
        showUserPanel: false,
      },
    },
    { path: '/user/login', name: 'login', component: Login },
    {
      path: '/user/join',
      name: 'join',
      component: Join,
    },
    {
      path: '/auth/pass/callback',
      name: 'PassCallback',
      component: PassCallback,
    },
    {
      path: '/fe/redirect',
      name: 'oauth2',
      component: Oauth2,
    },
    {
      path: '/pay/approval',
      name: 'pay-approval',
      component: PayApproval,
    },
    {
      path: '/pay/cancel',
      name: 'pay-cancel',
      component: PayCancel,
    },
    {
      path: '/pay/completed',
      name: 'pay-completed',
      component: PayCompleted,
    },
    {
      path: '/pay/fail',
      name: 'pay-fail',
      component: PayFail,
    },
    {
      path: '/pointshop',
      name: 'PointShop',
      component: PointShop,
      meta: { headerType: 'title', title: '포인트샵', showUserPanel: false },
    },
    {
      path: '/meal',
      name: 'MealMainView',
      component: MealMainView,
      meta: { headerType: 'title', title: '식단', showUserPanel: false },
    },
    {
      path: '/meal/detail',
      name: 'MealDetailView',
      component: MealDetailView,
      meta: { headerType: 'title', title: '음식 상세', showUserPanel: false },
    },
    {
      path: '/meal/water',
      name: 'WaterLog',
      component: () => import('@/views/meal/WaterLogView.vue'), // lazy 권장
      meta: { headerType: 'title', title: '물 섭취량', showUserPanel: false },
    },
    {
      path: '/meal/food-search',
      name: 'MealFoodSearchView',
      component: () => import('@/views/meal/MealFoodSearchView.vue'),
    },
    {
      path: '/meal/record',
      name: 'MealRecordView',
      component: () => import('@/views/meal/MealRecordView.vue'),
    },
  ],
});

// //로그인 하지 않아도 이용할 수 있는 Path들
// const unSignedPathList = ['/user/login', '/user/join', '/fe/redirect'];

// //navigation guard
// router.beforeEach((to, from) => {
//   console.log('to.path:', `"${to.path}"`);
//   const authentcationStore = useAuthenticationStore();
//   const isUnsignedPath = unSignedPathList.some((path) =>
//     to.path.startsWith(path)
//   );

//   if (to.name === 'ChallengeDetail' && to.params.name) {
//     to.meta.title = to.params.name; // 카드 이름을 제목으로
//   }

//   if (unSignedPathList.includes(to.path) && authentcationStore.state.isSigned) {
//     //로그인 상태에서 /user/login, /user/join 경로로 이동하려고 하면
//     return { path: '/' };
//   } else if (
//     !authentcationStore.state.isSigned &&
//     !unSignedPathList.includes(to.path)
//   ) {
//     console.log('로그아웃 상태에서 접근 불가 경로');
//     //로그아웃 상태에서 /user/login, /user/join 경로가 아닌 경우
//     return { path: '/user/login' };
//   }
// });

export default router;
