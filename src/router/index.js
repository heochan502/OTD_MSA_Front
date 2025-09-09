import { createRouter, createWebHistory } from 'vue-router'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/Home.vue'),
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
