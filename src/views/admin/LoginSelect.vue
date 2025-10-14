<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();

const goUser = () => {
  router.push('/');
};
const goAdmin = () => {
  router.push('/admin'); // 어드민 전용 라우트로 이동
};
</script>

<template>
  <div class="select-wrap">
    <h2>어디로 이동할까요?</h2>
    <div class="btns">
      <button @click="goUser">유저 화면</button>
      <button @click="goAdmin">관리자 화면</button>
    </div>
  </div>
</template>

<style scoped>
.select-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
}
.btns {
  display: flex;
  gap: 1rem;
}
button {
  min-width: 180px;
  min-height: 60px;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: 600;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
button:first-child {
  background: #00d5df;
  color: white;
}
button:last-child {
  background: #ffe864;
  color: black;
}
</style>
