<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthenticationStore } from '@/stores/user/authentication';

const route = useRoute();
const router = useRouter();
const authentication = useAuthenticationStore();

onMounted(async () => {
  const error = route.query.error;
  const userId = route.query.user_id;

  console.log('error:', error);
  console.log('userId:', userId);

  if (error || !userId) {
    if (error) {
      alert(error);
    }
    await router.push('/user/login');
    return;
  }

  // ⭐ 사용자 정보 추출
  const nickName = route.query.nick_name;
  const pic = route.query.pic;
  const email = route.query.email;
  const providerType = route.query.provider_type;         // ⭐ KAKAO, NAVER, GOOGLE
  const onboardingCompleted = route.query.onboarding_completed === 'true'; // ⭐ true/false
  const challengeRole = route.query.challenge_role;       // ⭐ BRONZE, SILVER, GOLD, DIAMOND
  const userRole = route.query.user_role;                 // ⭐ USER_2

  const signedUser = { 
    userId, 
    nickName, 
    pic,
    email,
    providerType,           // ⭐ 추가
    onboardingCompleted,    // ⭐ 추가
    challengeRole,          // ⭐ 추가
    userRole                // ⭐ 추가
  };

  console.log('signedUser:', signedUser);

  // 로그인 처리
  authentication.setSignedUser(signedUser);

  // ⭐ 온보딩 필요 여부 확인
  if (authentication.needsOnboarding()) {
    console.log('온보딩 필요 - 온보딩 페이지로 이동');
    await router.push('/user/onboarding');
  } else {
    console.log('온보딩 완료 - 메인 페이지로 이동');
    await router.push('/');
  }
});
</script>

<template>
  <div class="oauth-loading">
    <h1>소셜 로그인 처리 중...</h1>
    <p>잠시만 기다려주세요.</p>
  </div>
</template>

<style scoped>
.oauth-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
}

.oauth-loading h1 {
  font-size: 24px;
  margin-bottom: 16px;
}

.oauth-loading p {
  font-size: 16px;
  color: #666;
}
</style>