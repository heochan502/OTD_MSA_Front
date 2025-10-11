<script setup>
import { ref, onMounted } from 'vue';
import AdminLayout from "./views/admin/AdminLayout.vue";
import Layout from "./views/layout/layout.vue";
import SocialOnboardingModal from '@/components/user/SocialOnboardingModal.vue';
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const needsOnboarding = ref(false);

onMounted(() => {
  console.log('=== 온보딩 모달 확인 시작 ===');
  console.log('전체 쿠키:', document.cookie);
  
  // 쿠키에서 needsOnboarding 확인
  const cookies = document.cookie.split(';');
  console.log('쿠키 배열:', cookies);
  
  const onboardingCookie = cookies.find(c => c.trim().startsWith('needsOnboarding='));
  console.log('찾은 온보딩 쿠키:', onboardingCookie);
  
  if (onboardingCookie && onboardingCookie.split('=')[1] === 'true') {
    needsOnboarding.value = true;
    console.log('✅ 온보딩 모달 표시');
  } else {
    console.log('❌ 온보딩 모달 표시 안함');
  }
});

const handleOnboardingComplete = () => {
  needsOnboarding.value = false;
  console.log('온보딩 완료');
};
</script>

<template>
  <!-- 소셜 로그인 온보딩 모달 -->
  <SocialOnboardingModal 
    v-if="needsOnboarding" 
    @complete="handleOnboardingComplete" 
  />
  
  <div v-if="route.path.startsWith('/admin')" class="admin-layout">
    <AdminLayout />
  </div>
  <div v-else class="layout">
    <Layout id="modal-root" />
  </div>
</template>

<style scoped>
.admin-layout {
  width: 100vw;
  height: 100vh;
  background: #fafafa;
}
.layout {
  width: 100vw;
  height: 100vh;
  /* height: 805px; */
  min-width: 320px;
  background: #fafafa;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

  /*  오버레이 기준 + 프레임 안으로 클리핑 */
  position: relative;
  overflow: hidden;
}
</style>