<script setup>
import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useMealSelectedStore, useMealRecordStore } from '@/stores/meal/mealStore'




import { useBodyCompositionStore } from "@/stores/body_composition/bodyCompositionStore";

import { useExerciseRecordStore } from "@/stores/exercise/exerciseRecordStore";

import dayjs from 'dayjs';

import 'dayjs/locale/ko';

dayjs.locale('ko');



const bodyComposition = useBodyCompositionStore();
const exerciseRecord = useExerciseRecordStore();

const emit = defineEmits(['more'])


// 선택 한 날짜 가져오기위한거 
 const mealSelectedDay = useMealSelectedStore();

// 먹은날 기준 데이터 가져오는거 
const store = useMealRecordStore()
const { eatenFoodList } = storeToRefs(store)

// 총합
const totalKcal = computed(() =>
  
  (eatenFoodList.value ?? []).reduce((s, f) => s + ((f?.userFoodId ? Number(f.kcal) : (f.amount * f.kcal) / 100) || 0 ), 0)
)
const totalCarb = computed(() =>
  (eatenFoodList.value ?? []).reduce((s, f) => s + ((f?.userFoodId ? Number(f.carbohydrate) : (f.amount * f.carbohydrate) / 100) || 0), 0)
)
const totalProtein = computed(() =>
  (eatenFoodList.value ?? []).reduce((s, f) => s + ((f?.protein ? Number(f.protein) : (f.amount * f.protein) / 100) || 0), 0)
)
const totalFat = computed(() =>
  (eatenFoodList.value ?? []).reduce((s, f) => s + ((f?.fat ? Number(f.fat) : (f.amount * f.fat) / 100) || 0), 0)
)



// 목표/소모(운동) - 필요시 스토어/프로프 연동

const kcalGoal = computed(() => {
  const pts = bodyComposition.series?.points ?? [];
  if (!pts.length) return 0;

  // 'YYYY-MM-DD'는 사전식 비교가 시간순과 같음
  const latest = pts.reduce((a, b) => (a.date > b.date ? a : b));
  return latest?.values?.basal_metabolic_rate ?? 0;
});

// 칼로리 소모
const burnedKcal = computed(() => {
  const today = dayjs().format("YYYY-MM-DD");
console.log("여기");
  const pts = (exerciseRecord.records ?? []).filter(
    (item) => dayjs(item.startAt).format("YYYY-MM-DD") === today
  );
  console.log("pts11 ", pts);

  if (!pts.length) return 0;


  const totalBurnKcal = pts.reduce((sum, item) => sum + (item.activityKcal ?? 0),0 );
  console.log("pts ", pts);
  console.log("토탈 번 ", totalBurnKcal);
  return totalBurnKcal ?? 0;
})

const progressPct = computed(() => {
  const g = kcalGoal.value || 1
  return Math.min(100, Math.round((totalKcal.value / g) * 100))
})

const remainKcal = computed(() =>
  Math.max(0, kcalGoal.value - totalKcal.value + burnedKcal.value)
)

const macroPct = computed(() => {
  const sum = totalCarb.value + totalProtein.value + totalFat.value
  if (!sum) return { carb: 0, protein: 0, fat: 0 }
  return {
    carb: Math.round((totalCarb.value / sum) * 100),
    protein: Math.round((totalProtein.value / sum) * 100),
    fat: Math.round((totalFat.value / sum) * 100),
  }
});

watch(
  () => mealSelectedDay.selectedDay.setDay,   // ← 감시 대상 getter
  (newDay, oldDay) => {
    console.log('선택날', newDay, mealSelectedDay.selectedDay.setDay);
  } 
);


</script>

<template>
  <div class="card">
    <div class="card-hd">
      <span class="title">나의 하루</span>
      <button class="more" @click="$emit('more')">더보기</button>
    </div>

    <div class="kcal-line">
      <span class="big">{{ totalKcal.toFixed(0) }}</span>
      <span class="otd-body-1">/{{ kcalGoal }}kcal</span>
    </div>

    <!-- 매크로 칩 -->
    <div class="chips">
      <div class="chip chip-carb"><span class="dot"> 탄</span> <b>{{ macroPct.carb }}%</b></div>
      <div class="chip chip-protein"><span class="dot"> 단</span> <b>{{ macroPct.protein }}%</b></div>
      <div class="chip chip-fat"><span class="dot"> 지</span> <b>{{ macroPct.fat }}%</b></div>
    </div>

    <!-- 총 섭취 진행바 -->
    <div class="progress">
      <div class="bar" :style="{ width: progressPct + '%' }"></div>
    </div>

    <div class="meta">
      <div class="otd-body-1"><span class="otd-subtitle-1">{{ burnedKcal.toFixed(0) }}kcal</span> 소모</div>
      <div class="otd-body-1"><span class="otd-subtitle-1">{{ remainKcal.toFixed(0) }}</span>kcal 더 먹을 수 있어요</div>
    </div>

    <!-- 하단 g 합계 -->
    <div class="grams">
      <div class="g">
        <div class="label">순탄수</div>
        <div class="val"><b>{{ totalCarb.toFixed(1) }}g/ml </b></div>
      </div>
      <div class="g">
        <div class="label">단백질</div>
        <div class="val"><b>{{ totalProtein.toFixed(1) }}g/ml</b></div>
      </div>
      <div class="g">
        <div class="label">지방</div>
        <div class="val"><b>{{ totalFat.toFixed(1) }}g/ml</b></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: #F2F2F2;
  border-radius: 14px;
  padding: 16px 16px 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, .02);
  border: none;
}

.card-hd {
  display: flex;
  justify-content: space-between;
  align-items: center
}

.title {
  font-weight: 800
}

.more {
  border: none;
  background: #f5f6f7;
  color: #686a70;
  border-radius: 10px;
  padding: 6px 10px;
  cursor: pointer
}

.kcal-line {
  margin-top: 6px;
  display: flex;
  align-items: baseline;
  justify-content: center;
}

.big {
  font-size: 28px;
  font-weight: 800;
  margin-right: 6px
}



.chips {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  margin: 10px 0 8px
}

.chip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #333
}

.chip .dot {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  display: flex;
  text-align: center;
  align-items: center;
  font-weight: 500;
  font-size: 90%;
  justify-content: center;
}

.chip-carb .dot {
  background: #7ed957
}

.chip-protein .dot {
  background: #ffd84d
}

.chip-fat .dot {
  background: #ff9b60
}

.progress {
  height: 28px;
  border-radius: 999px;
  background: #fcfcfc;
  overflow: hidden
}

.bar {
  height: 100%;
  background: #0b0c0c
}

.meta {
  margin: 10px 0 6px;
  text-align: center;
  color: #5a5a5a;
  font-size: 14px
}

.meta .remain {
  margin-top: 4px;
  color: #282828
}

.grams {
  display: flex;
  justify-content: space-between;
  margin-top: 8px
}

.g {
  width: 33%;
  text-align: center
}

.label {
  color: #6c6c6c;
  font-size: 13px
}

.val {
  font-size: 16px;
  margin-top: 2px
}
</style>