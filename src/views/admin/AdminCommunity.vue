<script setup>
import { getCommunity } from '@/services/admin/adminService';
import { onMounted, ref } from 'vue';

onMounted(async () => {
  const res = await getCommunity();
  console.log(res.data);
});
</script>

<template>zjabs</template>

<style scoped></style>
