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
import ChallengeCategoryList from '@/views/challenge/ChallengeCategoryList.vue';
import ChallengePer from '@/views/challenge/ChallengePer.vue';
import ChallengeDay from '@/views/challenge/ChallengeDay.vue';

import Login from '@/views/user/Login.vue';
import Join from '@/views/user/Join.vue';
import Profile from '@/views/user/Profile.vue';
import Signal from '@/views/user/Signal.vue';
import QnA from '@/views/user/QnA.vue';
import Munhe from '@/views/user/Munhe.vue';
import ModifiProfile from '@/views/user/ModifiProfile.vue';
import PointHistory from '@/views/user/pointHistory.vue';
import Term from '@/views/user/Term.vue';
import Oauth2 from '@/views/auth/OAuth2Handler.vue';

import PayApproval from '@/views/pay/PayApproval.vue';
import PayCancel from '@/views/pay/PayCancel.vue';
import PayCompleted from '@/views/pay/PayCompleted.vue';
import PayFail from '@/views/pay/PayFail.vue';

// 포인트샵
import PointShopListView from '@/views/point/PointShopListView.vue';
import PointUserPurchaseHistoryView from '@/views/point/PointUserPurchaseHistoryView.vue';
import PointUserView from '@/views/point/PointUserView.vue';
import PointPurchaseHistoryTable from '@/components/pointshop/PointPurchaseHistoryTable.vue';

//식단
import MealMainView from '@/views/meal/MealMainView.vue';
import MealDetailView from '@/views/meal/MealDetailView.vue';
import MealRecordView from '@/views/meal/MealRecordView.vue';
import MealFoodSearchView from '@/views/meal/MealFoodSearchView.vue';

// 운동
import ExerciseMain from '@/views/exercise/ExerciseMain.vue';
import ExerciseRecord from '@/views/exercise/ExerciseRecord.vue';
import ExerciseRecordForm from '@/views/exercise/ExerciseRecordForm.vue';
import ExerciseRecordDetail from '@/views/exercise/ExerciseRecordDetail.vue';

// 체성분
import BodyCompositionStatics from '@/views/body_composition/BodyCompositionStatics.vue';

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
      path: '/challenge/weeklylist',
      name: 'ChallengeweeklyList',
      component: ChallengeCategoryList,
      meta: {
        headerType: 'title',
        title: '주간 챌린지 목록',
        showUserPanel: false,
      },
    },
    {
      path: '/challenge/competitionlist',
      name: 'ChallengecompetitionList',
      component: ChallengeCategoryList,
      meta: {
        headerType: 'title',
        title: '월간 경쟁챌린지 목록',
        showUserPanel: false,
      },
    },
    {
      path: '/challenge/personallist',
      name: 'ChallengepersonalList',
      component: ChallengeCategoryList,
      meta: {
        headerType: 'title',
        title: '월간 개인챌린지 목록',
        showUserPanel: false,
      },
    },
    { path: '/user/login', name: 'login', component: Login },
    {
      path: '/challenge/detail/per/:id',
      name: 'ChallengePer',
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
    {
      path: '/challenge/detail/day/:id',
      name: 'ChallengeDay',
      component: ChallengeDay,
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
      path: '/user/profile',
      name: 'profile',
      component: Profile,
    },
    {
      path: '/user/signal',
      name: 'signal',
      component: Signal,
    },
    {
      path: '/user/qna',
      name: 'QnA',
      component: QnA,
    },
    {
      path: '/user/email/munhe',
      name: 'munhe',
      component: Munhe,
    },
    {
      path: '/user/modifiProfile',
      name: 'modifiProfile',
      component: ModifiProfile,
    },
    {
      path: '/user/pointhistory',
      name: 'pointHistory',
      component: PointHistory,
    },

    {
      path: '/user/term',
      name: 'term',
      component: Term,
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
      name: 'PointShopList',
      component: PointShopListView,
    },
    {
      path: '/point/history',
      name: 'PointPurchaseHistory',
      component: PointPurchaseHistoryTable,
    },
    {
      path: '/point/user',
      name: 'PointUserView',
      component: PointUserView,
    },
    {
      path: '/meal',
      name: 'MealMainView',
      component: MealMainView,
      meta: { headerType: 'title', title: '식단', showUserPanel: false },
    },
    {
      path: '/exercise/main',
      name: 'ExerciseMain',
      component: ExerciseMain,
      meta: { headerType: 'title', title: '운동', showUserPanel: false },
    },
    {
      path: '/exercise/record',
      name: 'ExerciseRecord',
      component: ExerciseRecord,
      meta: { headerType: 'title', title: '이달의 기록', showUserPanel: false },
    },
    {
      path: '/exercise/record_form',
      name: 'ExerciseRecordForm',
      component: ExerciseRecordForm,
      meta: { headerType: 'title', title: '기록 추가', showUserPanel: false },
    },
    {
      path: '/exercise/record/:exerciseRecordId',
      name: 'ExerciseRecordDeatil',
      component: ExerciseRecordDetail,
      meta: { headerType: 'title', title: '운동 기록', showUserPanel: false },
    },
    {
      path: '/exercise/body_composition',
      name: 'BodyCompositionStatics',
      component: BodyCompositionStatics,
      meta: { headerType: 'title', title: '체성분 변화', showUserPanel: false },
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
      component: MealFoodSearchView,
      meta: { headerType: 'title', title: '식단 기록', showUserPanel: false },
    },
    {
      path: '/meal/record',
      name: 'MealRecordView',
      component: MealRecordView,
      meta: { headerType: 'title', title: '식단 기록', showUserPanel: false },
    },
    {
      path: '/admin',
      // component: () => import('@/views/admin/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: '', // /admin 진입 시 기본 페이지
          name: 'AdminDashboard',
          component: () => import('@/views/admin/AdminDashboard.vue'),
        },
        {
          path: 'users',
          name: 'AdminUsers',
          component: () => import('@/views/admin/AdminUser.vue'),
        },
        {
          path: 'challenges',
          name: 'AdminChallenges',
          component: () => import('@/views/admin/AdminChallenge.vue'),
        },
        {
          path: 'points',
          name: 'AdminPoints',
          component: () => import('@/views/admin/AdminPoint.vue'),
        },
        {
          path: 'qna',
          name: 'AdminQnA',
          component: () => import('@/views/admin/AdminQnA.vue'),
        },
        {
          path: 'statistics',
          name: 'AdminStatistics',
          component: () => import('@/views/admin/AdminStatistic.vue'),
        },
        {
          path: 'user/detail',
          name: 'AdminUserDetail',
          component: () => import('@/views/admin/AdminUserDetail.vue'),
        },
      ],
    },
  ],
});

// 로그인 하지 않아도 이용할 수 있는 Path들
const unSignedPathList = ['/user/login', '/user/join', '/fe/redirect'];

//navigation guard
router.beforeEach((to, from) => {
  const authentcationStore = useAuthenticationStore();
  const isUnsignedPath = unSignedPathList.some((path) =>
    to.path.startsWith(path)
  );
  // body 클래스 분기
  if (to.path.startsWith('/admin')) {
    document.body.classList.add('is-admin');
  } else {
    document.body.classList.remove('is-admin');
  }
  if (to.path.startsWith('/admin')) {
    const user = authentcationStore.state.signedUser;
    if (!user || user.userRole !== 'ADMIN') {
      alert('관리자만 접근 가능합니다.');
      return { path: '/' }; // 일반 유저는 홈으로 돌려보내기
    }
  }
  if (unSignedPathList.includes(to.path) && authentcationStore.state.isSigned) {
    //로그인 상태에서 /user/login, /user/join 경로로 이동하려고 하면
    return { path: '/' };
  } else if (
    !authentcationStore.state.isSigned &&
    !unSignedPathList.includes(to.path)
  ) {
    console.log('로그아웃 상태에서 접근 불가 경로');
    //로그아웃 상태에서 /user/login, /user/join 경로가 아닌 경우
    return { path: '/user/login' };
  }
});

export default router;
