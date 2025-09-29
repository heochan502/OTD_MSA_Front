<script setup>
import Layout from './views/layout/layout.vue';
import { useRoute, useRouter } from 'vue-router';
import { ref, watch, onMounted } from 'vue';
</script>

<template>
  <div class="layout">
    <Layout />
  </div>
</template>

<style>
.layout {
  width: 390px; /* 아이폰 12 기준 */
  height: 805px;
  background: #fafafa;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 60px;

  /*  오버레이 기준 + 프레임 안으로 클리핑 */
  position: relative;
  overflow: hidden;
}
</style>
