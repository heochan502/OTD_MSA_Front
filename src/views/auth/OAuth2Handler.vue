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

  // console.log('error:', error);
  // console.log('userId:', userId);

  if (error || !userId) {
    if (error) {
      alert(error);
    }
    await router.push('/user/login');
    return;
  }

  const nickName = route.query.nick_name;
  const pic = route.query.pic;
  const email = route.query.email;
  const providerType = route.query.provider_type;         
  //const onboardingCompleted = route.query.onboarding_completed === 'true'; 
  const onboardingCompleted = parseInt(route.query.onboarding_completed); 
  const challengeRole = route.query.challenge_role;       
  const userRole = route.query.user_role;                

  const signedUser = { 
    userId, 
    nickName, 
    pic,
    email,
    providerType,          
    onboardingCompleted,   
    challengeRole,         
    userRole               
  };

  //console.log('signedUser:', signedUser);


  authentication.setSignedUser(signedUser);


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