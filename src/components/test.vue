<script setup>
import { useRouter } from 'vue-router';
import { logout  } from '@/services/user/userService';
import { useAuthenticationStore } from '@/stores/user/authentication';

const router = useRouter();
const authStore = useAuthenticationStore();

// 로그아웃 버튼 클릭 시
const logoutAccount = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    console.log('토큰 상태:', token ? '존재' : '없음');
    
    if (!token) {
      // 토큰이 없으면 바로 로컬 로그아웃만
      await authStore.logout();
      return;
    }
    if (authStore.state.isSigned) {
      await logout();     // 서버 로그아웃
      await authStore.logout(); // Pinia 상태 초기화
      console.log('로그아웃 완료');
    }
  } catch (error) {
    console.error('로그아웃 중 오류:', error);
    alert('로그아웃 실패. 서버 상태를 확인하세요.');
    // 서버 오류가 발생해도 로컬 상태는 초기화
    await authStore.logout();
  }
};
</script>

<template>
  <div>
    <h1>테스트 페이지</h1>

    <!-- 로그인 상태에 따라 버튼 표시 -->
    <div v-if="authStore.state.isSigned">
      <p>안녕하세요, {{ authStore.state.signedUser?.nickName || '사용자' }}님</p>
      <a class="auth" @click="logoutAccount">로그아웃</a>
    </div>
    <div v-else>
      <p>로그인되어 있지 않습니다.</p>
      <router-link to="/user/login">로그인</router-link>
    </div>
  </div>
</template>

<style scoped lang="scss">
.auth {
  cursor: pointer;
  color: blue;
  text-decoration: underline;
  font-weight: bold;
  margin-top: 10px;
  display: inline-block;
}
</style>