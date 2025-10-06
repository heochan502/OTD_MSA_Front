<script setup>
import { ref, onMounted } from 'vue';

const targetValue = ref(68);

const animatedWidth = ref(0);

onMounted(() => {
  animateProgress(targetValue.value);
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
    animatedWidth.value = current;
  }, stepTime);
};
</script>

<template>
  <div class="progress">
    <div class="progress-bar" :style="{ width: animatedWidth + '%' }">
{{ Math.round(animatedWidth) }}%
    </div>
  </div>
</template>

<style lang="scss" scoped>
.progress {
  height: 30px;
  background: #FAFAFA;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1);;
  border: #E6E6E6 solid 1px ;
  .progress-bar {
    height: 100%;
    background: #FFE864;
    color: #fff;
    text-align: center;
    line-height: 30px;
    font-size: 13px;
    font-weight: bold;
    border-radius: 20px;
    transition: width 0.1s linear;
  }
}
</style>
