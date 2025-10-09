<script setup>
import { computed } from 'vue'

const props = defineProps({
  percent: { type: Object, default: () => ({ carb: 30, protein: 52, fat: 25 }) },
  grams: { type: Object, default: () => ({ totalCarbohydrate: 28.5, totalProtein: 53.2, totalFat: 45.9 }) },
  dateRange: { type: String, default: '09.03(수)' },
})
const emit = defineEmits(['prev', 'next'])

// 원 크기 계산 (가장 큰 퍼센트를 기준으로 스케일)
const MAX = 140, MIN = 50
const sizes = computed(() => {
  const p = props.percent
  const maxP = Math.max(p.carb || 0, p.protein || 0, p.fat || 0, 1)
  const scale = n => Math.max(MIN, (Number(n) / maxP) * MAX)
  return {
    carb: scale(p.carb),
    protein: scale(p.protein),
    fat: scale(p.fat),
  }
})
</script>

<template>
  <div class="card">
    <div class="date-bar">
      <button class="nav" @click="$emit('prev')">&lt;</button>
      <div class="label">{{ dateRange }}</div>
      <button class="nav" @click="$emit('next')">&gt;</button>
    </div>

    <!-- 겹치지 않는 가로 배치 -->
    <div class="bubbles">
      <div class="bubble bubble--carb" :style="{ width: sizes.carb + 'px', height: sizes.carb + 'px' }">
        {{ Number(percent.carb || 0).toFixed(0) }}%
      </div>
      <div class="bubble bubble--protein" :style="{ width: sizes.protein + 'px', height: sizes.protein + 'px' }">
        {{ Number(percent.protein || 0).toFixed(0) }}%
      </div>
      <div class="bubble bubble--fat" :style="{ width: sizes.fat + 'px', height: sizes.fat + 'px' }">
        {{ Number(percent.fat || 0).toFixed(0) }}%
      </div>
    </div>

    <div class="legend">
      <div class="col">
        <div class="pill pill--carb"></div>
        <div class="name">순탄수</div>
        <div class="val"><b>{{ Number(grams.totalCarbohydrate || 0).toFixed(1) }}</b><small> g/ml</small></div>
      </div>
      <div class="col">
        <div class="pill pill--protein"></div>
        <div class="name">단백질</div>
        <div class="val"><b>{{ Number(grams.totalProtein || 0).toFixed(1) }}</b><small> g/ml</small></div>
      </div>
      <div class="col last">
        <div class="pill pill--fat"></div>
        <div class="name">지방</div>
        <div class="val"><b>{{ Number(grams.totalFat || 0).toFixed(1) }}</b><small> g/ml </small></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: #F2F2F2;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, .06);
  padding: 14px
}

.date-bar {
  display: flex;
  justify-content:center;
  align-items: center;
  color: #222;
}

.label {
  font-weight: 800
}

.nav {
display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  background: #f1f3f5;
  color: #444;
  /* font-weight: 700; */
  transition: transform .06s ease, background .12s ease;
}
.nav:active {
  transform: scale(.96);
}

.nav:focus-visible {
  outline: 2px solid #8fb8ff;
  outline-offset: 2px;
}

/* === 겹치지 않게: flex 정렬 + absolute 금지 === */
.bubbles {
  height: 200px;
  /* 레전드와 간섭 안 나게 여유 */
  display: flex;
  justify-content: center;
  /* 가로 중앙 */
  align-items: flex-end;
  /* 바닥선 맞추기 */
  gap: 0px;
  /* 원 사이 간격 */
}

.bubble {
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: #fff;
  /* 겹침 효과 제거 */
  mix-blend-mode: normal;
}

/* 색상 */
.bubble--carb {
  background: #ffa865
}

.bubble--protein {
  background: #cfe97a;
  color: #2d3a00
}

.bubble--fat {
  background: #8fb8ff
}

/* 레전드 */
.legend {
  margin-top: 6px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  text-align: center
}

.col {
  padding: 10px 6px;
  border-right: 1px solid #edf1f5
}

.col.last {
  border-right: none
}

.pill {
  width: 26px;
  height: 10px;
  border-radius: 999px;
  margin: 0 auto 6px
}

.pill--carb {
  background: #ffa865
}

.pill--protein {
  background: #cfe97a
}

.pill--fat {
  background: #8fb8ff
}

.name {
  color: #768094;
  font-size: 12px;
  margin-bottom: 3px
}

.val {
  font-size: 18px;
  color: #111
}

.val small {
  font-size: 12px;
  color: #6b7280;
  margin-left: 2px
}
</style>