<script setup>
import { logout } from '@/services/user/userService';
import { RouterView } from 'vue-router';
import { useAuthenticationStore } from '@/stores/user/authentication';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthenticationStore();
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
        <h2 class="sidebar-title otd-titl">관리자 메뉴</h2>
        <router-link to="/" class="home">사이트 바로가기</router-link>
        <router-link
          to="/admin"
          class="menu-item otd-subtitle-1"
          active-class="active"
          exact-active-class="active"
        >
          대시보드
        </router-link>
        <router-link
          to="/admin/users"
          class="menu-item otd-subtitle-1"
          active-class="active"
        >
          사용자 관리
        </router-link>
        <router-link
          to="/admin/challenges"
          class="menu-item otd-subtitle-1"
          active-class="active"
        >
          챌린지 관리
        </router-link>
      </div>

      <!-- 항상 하단에 고정 -->
      <div class="sidebar-footer">
        <button class="logout-btn" @click="logoutAccount">로그아웃</button>
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
  // height: 100vh;
}

.sidebar {
  display: flex;
  flex-direction: column;
  width: 250px;
  background: #e6e6e6;
  color: #393e46;
  padding: 20px;

  .sidebar-title {
    padding: 15px;
    border-bottom: 1px solid #393e46;
  }
  .menu {
    flex: 1;
    display: flex;
    flex-direction: column;
    // margin: 10px 0;

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
      padding: 12px 20px;
      color: #393e46;
      text-decoration: none;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        padding: 6px;
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
    width: 100%;
    padding: 10px;
    border: none;
    background: transparent;
    color: #393e46;
    text-align: left;
    cursor: pointer;

    &:hover {
      color: #e74c3c;
    }
  }
}

.content {
  flex: 1;
  padding: 20px;
  background: #f9f9f9;
}
</style>
