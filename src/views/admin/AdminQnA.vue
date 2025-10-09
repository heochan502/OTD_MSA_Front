<script setup>
import { getQnA } from '@/services/admin/adminService';
import { ref, onMounted } from 'vue';

onMounted(async () => {
  const res = await getQnA();
  console.log('qna', res.data);
});
</script>

<template>
  <div>
    <h1>Q&A</h1>
  </div>
</template>

<style scoped>
h1 {
  font-size: 24px;
  margin-bottom: 10px;
}
</style>
