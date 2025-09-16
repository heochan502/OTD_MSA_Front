<script setup>
const props = defineProps({
  dateLabel: { type: String, default: '오늘' },
  kcalNow: { type: Number, default: 451 },
  kcalGoal: { type: Number, default: 1587 },
  macros: {
    type: Object,
    default: () => ({ carb: 35, protein: 15, fat: 15 }), // %
  },
  grams: {
    type: Object,
    default: () => ({ carb: 28.5, protein: 53.2, fat: 45.9 }), // g
  },
});
const emit = defineEmits(['more']);
</script>

<template>
  <div class="card">
    <div class="head">
      <div class="title">나의 하루</div>
      <button class="link" @click="$emit('more')">더보기</button>
    </div>

    <div class="kcal">
      <div class="now">{{ kcalNow }}</div>
      <div class="goal">/{{ kcalGoal }}kcal</div>
    </div>

    <div class="ratio-row">
      <span class="dot carb"></span><span>{{ macros.carb }}%</span>
      <span class="dot protein"></span><span>{{ macros.protein }}%</span>
      <span class="dot fat"></span><span>{{ macros.fat }}%</span>
    </div>

    <div class="bar">
      <div class="seg carb" :style="{ width: macros.carb + '%' }"></div>
      <div class="seg protein" :style="{ width: macros.protein + '%' }"></div>
      <div class="seg fat" :style="{ width: macros.fat + '%' }"></div>
    </div>

    <div class="grams">
      <div class="g">
        <span class="dot carb"></span>순탄수 {{ grams.carb }}g
      </div>
      <div class="g">
        <span class="dot protein"></span>단백질 {{ grams.protein }}g
      </div>
      <div class="g"><span class="dot fat"></span>지방 {{ grams.fat }}g</div>
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
  gap: 12px;
}
.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.title {
  font-weight: 800;
  color: #333;
}
.link {
  border: none;
  background: none;
  color: #6a6a6a;
  font-weight: 700;
  cursor: pointer;
}
.kcal {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.kcal .now {
  font-size: 28px;
  font-weight: 800;
}
.kcal .goal {
  color: #888;
}
.ratio-row {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #666;
  font-weight: 600;
}
.bar {
  height: 14px;
  border-radius: 999px;
  background: #eee;
  overflow: hidden;
  display: flex;
}
.seg {
  height: 100%;
}
.carb {
  background: #ffb44d;
}
.protein {
  background: #a4db67;
}
.fat {
  background: #7fb8ff;
}
.dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 4px;
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
.grams {
  display: flex;
  gap: 12px;
  color: #666;
  font-size: 12px;
}
.g {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
