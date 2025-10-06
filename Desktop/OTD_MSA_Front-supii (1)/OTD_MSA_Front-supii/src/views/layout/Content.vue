<script setup>
/**
 * 컨텐츠 영역은 라우팅 결과만 보여줍니다.
 * 각 화면은 /src/views 아래의 뷰 컴포넌트가 담당합니다.
 */
</script>

<template>
  <main class="content">
    <!-- 탭 전환 시 상태 유지가 필요한 경우 keep-alive 사용 -->
    <keep-alive include="HomeView">
      <router-view />
    </keep-alive>
  </main>
</template>

<style scoped>


</style>
