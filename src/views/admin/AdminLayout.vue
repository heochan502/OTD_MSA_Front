<script setup>
import { logout } from '@/services/user/userService';
import { RouterView } from 'vue-router';
import { useAuthenticationStore } from '@/stores/user/authentication';
import { useRouter, useRoute } from 'vue-router';
import { computed } from 'vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthenticationStore();
const isActive = computed(() => route.path === '/admin');

const logoutAccount = async () => {
  if (!confirm('로그아웃 하시겠습니까?')) return;
  const res = await logout();
  if (res === undefined || res.status !== 200) return;
  authStore.logout();
  router.push('/user/login');
};
</script>
<template>
  <div class="admin-layout">
    <!-- 공통 사이드바 -->
    <aside class="sidebar">
      <div class="menu">
        <h2 class="sidebar-title otd-title">관리자 메뉴</h2>
        <router-link to="/" class="home">사이트 바로가기</router-link>
        <router-link
          to="/admin"
          class="menu-item otd-subtitle-1 d-flex"
          active-class="active"
          exact-active-class="active"
        >
          <img
            class="icon"
            :src="
              isActive
                ? '/otd/image/admin_page/dashboard-s.png'
                : '/otd/image/admin_page/dashboard.png'
            "
          />
          <span>대시보드</span>
        </router-link>
        <router-link
          to="/admin/user"
          class="menu-item otd-subtitle-1 d-flex"
          active-class="active"
          :class="{ active: route.path.startsWith('/admin/user') }"
        >
          <img
            class="icon"
            :src="
              route.path.startsWith('/admin/user')
                ? '/otd/image/admin_page/user-s.png'
                : '/otd/image/admin_page/user.png'
            "
          />
          <span>사용자 관리</span>
        </router-link>
        <router-link
          to="/admin/challenge"
          class="menu-item otd-subtitle-1 d-flex"
          active-class="active"
          :class="{ active: route.path.startsWith('/admin/challenge') }"
        >
          <img
            class="icon"
            :src="
              route.path.startsWith('/admin/challenge')
                ? '/otd/image/admin_page/challenge-s.png'
                : '/otd/image/admin_page/challenge.png'
            "
          />
          <span>챌린지 관리</span>
        </router-link>
        <router-link
          to="/admin/point"
          class="menu-item otd-subtitle-1 d-flex"
          active-class="active"
          :class="{ active: route.path.startsWith('/admin/point') }"
        >
          <img
            class="icon"
            :src="
              route.path.startsWith('/admin/point')
                ? '/otd/image/admin_page/point-s.png'
                : '/otd/image/admin_page/point.png'
            "
          />
          <span>포인트 관리</span>
        </router-link>
        <router-link
          to="/admin/community"
          class="menu-item otd-subtitle-1 d-flex"
          active-class="active"
          :class="{ active: route.path.startsWith('/admin/community') }"
        >
          <img
            class="icon"
            :src="
              route.path.startsWith('/admin/community')
                ? '/otd/image/admin_page/community-s.png'
                : '/otd/image/admin_page/community.png'
            "
          />
          <span>게시글 관리</span>
        </router-link>
        <router-link
          to="/admin/statistics"
          class="menu-item otd-subtitle-1 d-flex"
          active-class="active"
          :class="{ active: route.path.startsWith('/admin/statistics') }"
        >
          <img
            class="icon"
            :src="
              route.path.startsWith('/admin/statistics')
                ? '/otd/image/admin_page/graph-s.png'
                : '/otd/image/admin_page/graph.png'
            "
          />
          <span>통계</span>
        </router-link>
        <router-link
          to="/admin/qna"
          class="menu-item otd-subtitle-1 d-flex"
          active-class="active"
          :class="{ active: route.path.startsWith('/admin/qna') }"
        >
          <img
            class="icon"
            :src="
              route.path.startsWith('/admin/qna')
                ? '/otd/image/admin_page/qna-s.png'
                : '/otd/image/admin_page/qna.png'
            "
          />
          <span>문의</span>
        </router-link>
      </div>

      <!-- 항상 하단에 고정 -->
      <div class="sidebar-footer">
        <button class="logout-btn" @click="logoutAccount">
          <img
            src="/public/image/admin_page/logout.png"
            alt="logout"
            class="logout-icon"
          />로그아웃
        </button>
      </div>
    </aside>

    <!-- 콘텐츠 영역 -->
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<style lang="scss" scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}
.sidebar {
  display: flex;
  flex-direction: column;
  width: 250px;
  background: #e6e6e6;
  color: #393e46;
  padding: 20px;
  flex-shrink: 0; // 고정

  .sidebar-title {
    padding: 15px;
    border-bottom: 1px solid #393e46;
  }
  .menu {
    flex: 1;
    display: flex;
    flex-direction: column;
    // margin: 10px 0;
    .icon {
      width: 30px;
    }
    .home {
      display: flex;
      padding-top: 15px;
      padding-bottom: 20px;
      align-items: center;
      justify-content: center;
      color: #393e46;
      text-decoration: none;
      border-bottom: 1px solid #393e46;
    }
    .menu-item {
      gap: 15px;
      align-items: center;
      padding: 12px 20px;
      color: #393e46;
      text-decoration: none;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        padding: 12px;
      }
      &.active {
        background: #393e46;
        color: #fff;
        font-weight: bold;
      }
    }
  }
}
.sidebar-footer {
  border-top: 1px solid #393e46;
  padding: 15px 20px;

  .logout-btn {
    display: flex;
    gap: 15px;
    width: 100%;

    border: none;
    background: transparent;
    color: #393e46;
    text-align: left;
    cursor: pointer;

    .logout-icon {
      width: 30px;
    }
  }
}

.content {
  flex: 1;
  padding: 20px;
  background: #f9f9f9;
  overflow-y: auto;
  height: 100vh;
  box-sizing: border-box;
}
</style>
