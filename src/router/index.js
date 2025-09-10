import { createRouter, createWebHistory } from 'vue-router';

import Test from '@/components/test.vue';

import Home from '@/views/HomeView.vue'

import Community from '@/views/community/CommunityView.vue';
import ChallengeHome from '@/views/challenge/ChallengeHome.vue';
import ChallengeList from '@/views/challenge/ChallengeList.vue';
import CommunityCategory from '@/components/community/CommunityCategory.vue';
import PointShop from '@/components/pointshop/PointShop.vue';


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: {headerType: 'logo', showUserPanel: true},
    },   
    {
      path: '/community',
      name: 'Commuity',
      component: Community,
      meta: {headerType: 'title', title: '커뮤니티',  showUserPanel:false},
    },
    {
      path: '/community/:category(free|diet|work|love)',
      name: 'CommnityCategory',
      component: CommunityCategory,
      meta: {headerType:'title', showUserPanel:false},
      
    },
    {
      path: '/test',
      name: 'Test',
      component: Test,
      meta: {headerType: 'title', title: '테스트',  showUserPanel:false},
    },
    {
      path: '/challenge',
      name: 'ChallengeHome',
      component: ChallengeHome,
      meta: {headerType: 'title', title: '챌린지',  showUserPanel:false},
    },
    {
      path: '/challenge/list',
      name: 'ChallengeList',
      component: ChallengeList,
      meta: {headerType: 'title', title: '챌린지 목록',  showUserPanel:false},
    },
    {
      path: '/pointshop',
      name: 'PointShop',
      component: PointShop,
      meta: {headerType: 'title', title: '포인트',  showUserPanel:false},
    },
  ],
});

export default router;
