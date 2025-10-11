<script setup>
import AdminLayout from "./views/admin/AdminLayout.vue";
import Layout from "./views/layout/layout.vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
</script>

<template>
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
