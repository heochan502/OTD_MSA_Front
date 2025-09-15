import { createRouter, createWebHistory } from 'vue-router';
import { useAuthenticationStore } from '@/stores/user/authentication'


// 공통 뷰
import Test from '@/components/test.vue';
import Home from '@/views/HomeView.vue';

// 커뮤니티
import Community from '@/views/community/CommunityView.vue';
import CategoryFeedView from '@/views/community/categories/CategoryFeedView.vue';

// 챌린지
import ChallengeHome from '@/views/challenge/ChallengeHome.vue';
import ChallengeList from '@/views/challenge/ChallengeList.vue';
import CommunityCategory from '@/components/community/CommunityCategory.vue';
import Login from '@/views/user/Login.vue'
import Join from '@/views/user/Join.vue'
import PassCallback from '@/views/auth/PassCallback.vue' 
import Oauth2 from '@/views/auth/OAuth2Handler.vue'
import PayApproval from '@/views/pay/PayApproval.vue';
import PayCancel from '@/views/pay/PayCancel.vue';
import PayCompleted from '@/views/pay/PayCompleted.vue';
import PayFail from '@/views/pay/PayFail.vue';

// 포인트샵
import PointShop from '@/components/pointshop/PointShop.vue'



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
      path: '/user/login',
      name: 'login',
      component: Login
    },
    {
      path: '/user/join',
      name: 'join',
      component: Join
    },
    {
    path: '/auth/pass/callback', 
    name: 'PassCallback',
    component: PassCallback
    },
    {
      path: '/fe/redirect',
      name: 'oauth2',
      component: Oauth2
    },
    {
      path: '/pay/approval',
      name: 'pay-approval',
      component: PayApproval
    },
    {
      path: '/pay/cancel',
      name: 'pay-cancel',
      component: PayCancel
    },
    {
      path: '/pay/completed',
      name: 'pay-completed',
      component: PayCompleted
    },
    {
      path: '/pay/fail',
      name: 'pay-fail',
      component: PayFail
    },
    {
      path: '/pointshop',
      name: 'PointShop',
      component: PointShop,
      meta: { headerType: 'title', title: '포인트샵', showUserPanel: false },
    },
  ],
});

//로그인 하지 않아도 이용할 수 있는 Path들
const unSignedPathList = [ '/user/login', '/user/join', '/fe/redirect' ]

//navigation guard
router.beforeEach((to, from) => {
  console.log('to.path:', `"${to.path}"`)
  const authentcationStore = useAuthenticationStore();  
  const isUnsignedPath = unSignedPathList.some(path => to.path.startsWith(path))
  
  if(unSignedPathList.includes(to.path) && authentcationStore.state.isSigned) {
    //로그인 상태에서 /user/login, /user/join 경로로 이동하려고 하면
    return { path: '/' }
  } else if(!authentcationStore.state.isSigned && !unSignedPathList.includes(to.path)) {
    console.log('로그아웃 상태에서 접근 불가 경로')
    //로그아웃 상태에서 /user/login, /user/join 경로가 아닌 경우
    return { path: '/user/login' }
  }  
});

export default router
