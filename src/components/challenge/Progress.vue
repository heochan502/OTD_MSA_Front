<script setup>
import { ref, onMounted } from 'vue';

const targetValue = ref(0);

const displayValue = ref(0);

onMounted(() => {
  setTimeout(() => {
    targetValue.value = 68 // 통게치 받아왔다 가정
    animateProgress(targetValue.value)
  }, 50) // DOM 렌더링 직후 약간의 지연을 줘야 transition이 발동
});

const animateProgress = (target) => {
  let current = 0;
  const duration = 1000; // 1초
  const stepTime = 10; // 0.01초

  const increment = target / (duration / stepTime);

  const interval = setInterval(() => {
    current += increment;
    if (target <= current) {
      current = target;
      clearInterval(interval);
    }
    displayValue.value = Math.round(current);
  }, stepTime);
};
</script>

<template>
  <div class="progress">
    <div class="progress-bar" :style="{ width : targetValue + '%'}"></div>
    <div class="progress-num">
      <span>{{ displayValue }}%</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.progress {
  position: relative;
  height: 30px;
  background: #fafafa;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1);
  border: #e6e6e6 solid 1px;

  .progress-bar {
    height: 100%;
    background: #ffe864;
    border-radius: 20px;
    width: 0%;
    transition: width 1s linear;
  }
  .progress-num {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    justify-content: center;
    text-align: center;
    line-height: 30px;
    font-size: 13px;
    font-weight: bold;
    color: #989898;
  }
}
</style>
