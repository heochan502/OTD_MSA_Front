<script setup>
const props = defineProps({
  percent: {
    type: Object,
    default: () => ({ carb: 56, protein: 29, fat: 15 }),
  },
  grams: {
    type: Object,
    default: () => ({ carb: 28.5, protein: 53.2, fat: 45.9 }),
  },
  dateRange: { type: String, default: '09.03(수)' },
});
</script>

<template>
  <div class="card">
    <div class="date-bar">
      <button class="nav">&lt;</button>
      <div class="label">{{ dateRange }}</div>
      <button class="nav">&gt;</button>
    </div>

    <div class="bubbles">
      <div class="bubble carb">{{ percent.carb }}%</div>
      <div class="bubble protein">{{ percent.protein }}%</div>
      <div class="bubble fat">{{ percent.fat }}%</div>
    </div>

    <div class="legend">
      <div class="item">
        <span class="dot carb"></span>순탄수 {{ grams.carb }}g
      </div>
      <div class="item">
        <span class="dot protein"></span>단백질 {{ grams.protein }}g
      </div>
      <div class="item"><span class="dot fat"></span>지방 {{ grams.fat }}g</div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: #fff;
  border-radius: 14px;
  box-shadow: var(--shadow-md);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.date-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #666;
}
.nav {
  border: none;
  background: #f2f2f2;
  border-radius: 8px;
  width: 28px;
  height: 28px;
  cursor: pointer;
}
.bubbles {
  position: relative;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bubble {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 800;
  border-radius: 50%;
  opacity: 0.95;
}
.carb {
  width: 120px;
  height: 120px;
  background: #ffb44d;
  z-index: 3;
}
.protein {
  width: 80px;
  height: 80px;
  background: #a4db67;
  margin-left: -20px;
  z-index: 2;
}
.fat {
  width: 60px;
  height: 60px;
  background: #7fb8ff;
  margin-left: -10px;
  z-index: 1;
}
.legend {
  display: flex;
  gap: 14px;
  color: #666;
  font-size: 12px;
  justify-content: center;
}
.dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 6px;
}
.dot.carb {
  background: #ffb44d;
}
.dot.protein {
  background: #a4db67;
}
.dot.fat {
  background: #7fb8ff;
}
</style>
