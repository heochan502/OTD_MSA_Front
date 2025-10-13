<script setup>
import { onMounted } from 'vue';
import { getMeal } from '@/services/admin/adminService';

onMounted(async () => {
  const res = await getMeal();
  console.log('meal', res.data);
});
</script>

<template></template>

<style scoped></style>
