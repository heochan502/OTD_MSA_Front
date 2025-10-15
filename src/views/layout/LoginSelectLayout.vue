<template>
  <div class="login-select-layout">
    <!-- 여기서는 header/footer 없이, 전용 디자인 -->
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.login-select-layout {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f5f5;
}
.content {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
