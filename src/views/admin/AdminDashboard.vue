<script setup>
import { getTodayLogin } from '@/services/admin/adminService';
import { onMounted, ref } from 'vue';

//공통
const loginData = ref();
// 관리자용

// 매니저용

onMounted(async () => {
  const res = await getTodayLogin();
  loginData.value = res.data;
});
</script>

<template>
  <h1>대시보드엔 뭘 넣어야 할까</h1>
  <div>오늘 접속자 수 {{ loginData }}명</div>
</template>

<style lang="scss"></style>
