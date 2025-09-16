<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 기본 0.80L, 0.05L 단위 증감
const step = 0.05;
const amount = ref(0.8);
const target = 2.0;

const minus = () => {
  amount.value = Math.max(0, +(amount.value - step).toFixed(2));
};
const plus = () => {
  amount.value = +(amount.value + step).toFixed(2);
};

const submit = () => {
  // TODO: API 연동하여 오늘 섭취량 저장
  // await api.post('/api/meal/water', { amount: amount.value })
  router.back();
};
</script>

<template>
  <div class="wrap">
    <section class="log">
      <header class="center">
        <div class="otd-category">물 섭취량</div>
      </header>

      <div class="panel">
        <div class="q otd-subtitle-1">오늘 물을 얼마나 마셨나요?</div>
        <div class="target otd-body-2">{{ target }}L 마시기 도전!</div>

        <div class="counter">
          <button class="circle" aria-label="minus" @click="minus">−</button>
          <div class="value">
            <span class="num otd-title">{{ amount.toFixed(2) }}</span>
            <span class="unit otd-subtitle-2">L</span>
          </div>
          <button class="circle" aria-label="plus" @click="plus">＋</button>
        </div>
      </div>

      <button class="submit" @click="submit">
        <span class="otd-button">기록완료</span>
      </button>
    </section>
  </div>
</template>

<style scoped>
.center {
  display: flex;
  justify-content: center;
}
.panel {
  margin-top: 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  padding: 20px 16px;
}
.q {
  color: #4b4b4b;
}
.target {
  color: #888;
  margin-top: 10px;
  text-align: center;
}

.counter {
  margin-top: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
}
.circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid #e5e5e5;
  background: #fff;
  cursor: pointer;
  font-size: 22px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}
.value {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.num {
  font-weight: 800;
}

.submit {
  margin-top: 24px;
  width: 100%;
  background: #ffe864;
  border: none;
  border-radius: 12px;
  padding: 14px 12px;
  cursor: pointer;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
}
</style>
