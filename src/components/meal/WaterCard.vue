<script setup>
import { useRouter } from 'vue-router';

const props = defineProps({
  todayAmount: {  }, // L 단위 (예: 0.8)
});
const router = useRouter();
const goLog = () => router.push({ name: 'WaterLog', query: { amount: Number(props.todayAmount.amountLiter),
  dailyWaterIntakeId: props.todayAmount.dailyWaterIntakeId
 } });
</script>

<template>
  <div class="water-card">
    <div class="head otd-caption">물 섭취</div>
    <div class="content">
      <img
        class="icon"
        src="/image/meal/water.png"
        alt="water"
        width="64"
        height="64"
      />

      <div class="right">
        <div class="q otd-body-3">오늘 물 섭취량은?</div>
        <div class="amount">
          <span class="num otd-title">{{ todayAmount.amountLiter }}</span>
          <span class="unit otd-subtitle-2">L</span>
        </div>

        <button class="log-btn otd-button" @click="goLog">기록하기</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.water-card {
  width: 100%;
  background: #79a7ff; /* 스샷에 맞춘 파랑 */
  color: #fff;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  padding: 12px;
}
.head {
  margin-bottom: 6px;
  opacity: 0.95;
}
.content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
}
.icon {
  width: 72px;
  height: 72px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 0.2);
}
.right {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.q {
  opacity: 0.95;
}
.amount {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.num {
  font-weight: 800;
}
.unit {
  font-weight: 700;
}
.log-btn {
  align-self: flex-start;
  background: #2e4f7f;
  border: none;
  padding: 8px 16px;
  border-radius: 10px;
  color: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}
</style>
