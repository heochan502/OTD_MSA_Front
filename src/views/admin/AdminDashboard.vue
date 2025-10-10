<script setup>
import {
  getUserCount,
  getPointCount,
  getRecentJoin,
} from '@/services/admin/adminService';
import { onMounted } from 'vue';

onMounted(async () => {
  const res1 = await getUserCount();
  console.log('res1', res1.data);
  const res2 = await getPointCount();
  console.log('res2', res2.data);
  const res3 = await getRecentJoin();
  console.log('res3', res3.data);
});
</script>

<template>
  <h1>대시보드엔 뭘 넣어야 할까</h1>
</template>

<style lang="scss"></style>
