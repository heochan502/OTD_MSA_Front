import { createRouter, createWebHistory } from 'vue-router'

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
      name: 'Commuity',
      component: Community
    },   
    {
      path: '/test',
      name: 'Test',
      component: Test,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/user/Login.vue')
    },
    {
      path: '/join',
      name: 'join',
      component: () => import('../views/user/Login.vue')
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

export default router
