<script setup>
import { useRouter } from 'vue-router';
import { logout } from '@/services/user/userService';
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
      await logout(); // 서버 로그아웃
      await authStore.logout(); // Pinia 상태 초기화
      console.log('로그아웃 완료');
      await router.push('/user/login');
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
    <div>
      <a>프로필사진</a>
      <a>{{ authStore.state.signedUser?.nickName || '사용자' }}</a>
      <a>이메일</a>
    </div>
    <div><a>내가 쓴 게시글</a><a>나의 좋아요</a><a>내가 쓴 댓글</a></div>
    <div>
      <a>내포인트</a><a>{{ authStore.state.signedUser.point }}P</a>
    </div>
    <div>
      <a>포인트 기록</a>
      <a>30k 러닝 챌린지</a><a>+ 30p</a><a>2025.10.20</a>
    </div>
    <div>
      <router-link to="/user/signal">알림 설정하기</router-link>
    </div>
    <div>
      <router-link to="/user/inquiry">1:1 문의하기</router-link>
      <router-link to="/user/frequently">자주 묻는 질문</router-link>
    </div>
    <div>
      <router-link to="/user/term">약관 및 보안</router-link>
      <a class="auth" @click="logoutAccount">로그아웃</a>
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
