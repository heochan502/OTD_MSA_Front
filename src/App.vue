<script setup>
import Layout from './views/layout/layout.vue';




</script>

<template>
  <div class="layout">
    <Layout />
  </div>
</template>


<style>
/* 브라우저 전체 영역 중앙 정렬 */
html, body, #app {
  height: 100%;
  margin: 0;
  display: flex;
  justify-content: center; /* 가로 중앙 */
  align-items: center;     /* 세로 중앙 */
  background: #ffffff;     /* (선택) 바깥 배경색 */
  /* 폰트 설정하고 예비로 쓸것 지정해둔거 */
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI',
  Roboto, 'Helvetica Neue', Arial, 'Noto Sans KR', sans-serif;
}

.layout {
  width: 390px; /* 아이폰 12 기준 */ 
  height: 805px;
  background: #FAFAFA;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  border-radius: 20px;
}
</style>