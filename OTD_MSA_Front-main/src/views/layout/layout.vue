<script setup>
import Breadcrumb from './Breadcrumb.vue'
import Content from './Content.vue'
import Footer from './Footer.vue'
</script>
<template>
    <div class="app-layout">
    <div >
        <Breadcrumb  /> <!--  상단 내용 -->
    </div>
    <router-view/>
      <!-- <Content />    컨텐츠 내용 -->
      <Footer />     <!-- 하단 네비게이션 -->
    </div>
  </template>
  

  
  <style scoped>
  .app-layout {
    display: flex;
    row-gap: 20px; /* 행 간격을 20px로 설정 */
    flex-direction: column;
    height: 805px;
  }

  
  </style>