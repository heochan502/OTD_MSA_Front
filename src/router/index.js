import { createRouter, createWebHistory } from 'vue-router'
import { useAuthenticationStore } from '@/stores/user/authentication'
import Test from '@/components/test.vue'
import Community from '@/views/community/CommunityView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/HomeView.vue'),
    },   
    {
      path: '/community',
      name: 'Community',
      component: Community
    },   
    {
      path: '/test',
      name: 'Test',
      component: Test,
    },
    {
      path: '/user/login',
      name: 'login',
      component: () => import('../views/user/Login.vue')
    },
    {
      path: '/user/join',
      name: 'join',
      component: () => import('../views/user/Join.vue')
    },
    {
      path: '/fe/redirect',
      name: 'oauth2',
      component: () => import('../views/OAuth2Handler.vue')
    },
    {
      path: '/pay/approval',
      name: 'pay-approval',
      component: () => import('../views/pay/PayApproval.vue')
    },
    {
      path: '/pay/cancel',
      name: 'pay-cancel',
      component: () => import('../views/pay/PayCancel.vue')
    },
    {
      path: '/pay/completed',
      name: 'pay-completed',
      component: () => import('../views/pay/PayCompleted.vue')
    },
    {
      path: '/pay/fail',
      name: 'pay-fail',
      component: () => import('../views/pay/PayFail.vue')
    },
  ],
})

//로그인 하지 않아도 이용할 수 있는 Path들
const unSignedPathList = [ '/user/login', '/user/join', '/fe/redirect' ]

//navigation guard
router.beforeEach((to, from) => {
  const authentcationStore = useAuthenticationStore();  
  
  if(unSignedPathList.includes(to.path) && authentcationStore.state.isSigned) {
    //로그인 상태에서 /user/login, /user/join 경로로 이동하려고 하면
    return { path: '/' }
  } else if(!authentcationStore.state.isSigned && !unSignedPathList.includes(to.path)) {
    console.log('로그아웃 상태에서 /user/login, /user/join, /fe/redirect 경로가 아닌 경우')
    //로그아웃 상태에서 /user/login, /user/join 경로가 아닌 경우
    return { path: '/user/login' }
  }  
});

export default router