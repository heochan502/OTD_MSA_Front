<script setup>
import { useScroll } from '@vueuse/core';
import Breadcrumb from './Breadcrumb.vue';
import Content from './Content.vue';
import Footer from './Footer.vue';
</script>
<template>
  <div class="app-layout">
    <div>
      <Breadcrumb />
      <!--  상단 내용 -->
    </div>
    <div class="main-wrap">
      <router-view />
    </div>
    <!-- <Content />    컨텐츠 내용 -->
    <Footer class="nav-footer" />
    <!-- 하단 네비게이션 -->
  </div>
</template>

<style lang="scss" scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  // height: 805px;
  height: 100vh;
  user-select: none;
  padding-bottom: 80px;

  overflow: hidden;
}
/* 공통 화면 좌우 여백 */
.main-wrap {
  // margin-top: 20px;
  // position: relative;
  /* ✅ v-dialog 기준 */
  flex: 1;
  overflow: auto;
  /* 내부 스크롤 */
  &::-webkit-scrollbar {
    display: none;
  }
  min-height: 0;
}
.nav-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  margin-top: auto;
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
