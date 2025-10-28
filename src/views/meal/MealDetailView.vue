<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import MealTabs from '@/components/meal/MealTabs.vue';
import MacroBubbles from '@/components/meal/MacroBubbles.vue';
import NutritionTable from '@/components/meal/NutritionTable.vue';

import { getSummaryDay, getSummaryWeek, getSummaryMonth } from '@/services/meal/mealService.js'

import { useMealSelectedStore, useMealRecordStore } from '@/stores/meal/mealStore.js'

import dayjs from 'dayjs';

import 'dayjs/locale/ko';

dayjs.locale('ko') // 전역 로케일을 한국어로

const selectedDay = useMealSelectedStore();

const tab = ref('day'); // 'day' | 'week' | 'month'
const title = computed(() =>
{
  if (tab.value === 'day') {
    return dayjs(selectedDay.selectedDay.setDay).format('MM.DD(ddd)')
  }
  if (tab.value === 'week') {
    const { start, end } = getWeekRange(selectedDay.selectedDay.setDay)
    return `${start.format('MM.DD')} ~ ${end.format('MM.DD')}`
  }
  // month
  return dayjs(selectedDay.selectedDay.setDay).format('MM') + '월 요약'
});

/** 월요일 시작 주 범위 계산 */
function getWeekRange(dateStr) {
  const d = dayjs(dateStr)
  const weekday = d.day()               // 0(일)~6(토)
  const start = d.subtract((weekday + 6) % 7, 'day') // 월요일로 보정
  const end = start.add(6, 'day')
  return { start, end }
}


/** 날짜 이동: 현재 탭 기준으로 이동 */
const goPrev = () => {
  const base = dayjs(selectedDay.selectedDay.setDay)
  const next =
    tab.value === 'day' ? base.subtract(1, 'day') :
      tab.value === 'week' ? base.subtract(1, 'week') :
        base.subtract(1, 'month')
  selectedDay.selectedDay.setDay = next.format('YYYY-MM-DD')
}

const goNext = () => {
  const base = dayjs(selectedDay.selectedDay.setDay)
  const next =
    tab.value === 'day' ? base.add(1, 'day') :
      tab.value === 'week' ? base.add(1, 'week') :
        base.add(1, 'month')
  // 필요하면 미래 날짜 막기
  // if (next.isAfter(dayjs(), 'day')) return
  selectedDay.selectedDay.setDay = next.format('YYYY-MM-DD')
  console.log(selectedDay.selectedDay.setDay);
}
watch(
  [() => tab.value, () => selectedDay.selectedDay.setDay],
  async ([newTab, dayStr], [oldTab, oldDay]) => {
    if (newTab === 'day') {
      totalData.value = await getSummaryDay(dayStr);
    } else if (newTab === 'week') {
      const { start, end } = getWeekRange(dayStr);    // dayjs 객체라면 .format 필요
      totalData.value = await getSummaryWeek(
        start.format('YYYY-MM-DD'),
        end.format('YYYY-MM-DD')
      );
    } else {
      const ym = dayjs(dayStr).format('YYYY-MM');
      totalData.value = await getSummaryMonth(ym);
    }
  },
);


const percent = computed(() => {
  const carb = Number(totalData.value.totalCarbohydrate ?? 0);
  const protein = Number(totalData.value.totalProtein ?? 0);
  const fat = Number(totalData.value.totalFat ?? 0);
  const sum = carb + protein + fat;
  if (!sum) return { carb: 0, protein: 0, fat: 0 };
  return {
    carb: Math.round((carb / sum) * 100),
    protein: Math.round((protein / sum) * 100),
    fat: Math.round((fat / sum) * 100),
  };
});

onMounted(async() => {
  // console.log('MealDetailView mounted:', selectedDay.selectedDay.setDay);
  totalData.value = await getSummaryDay(selectedDay.selectedDay.setDay);
  console.log('totalData', totalData.value);
})
//데이터 받아오는굿 
const totalData = ref({
  totalCarbohydrate: 0,
  totalProtein: 0,
  totalFat: 0,
  totalKcal: 0,
  totalSugar: 0,
  totalNatrium: 0,

});

/** NutritionTable용 데이터 */
const totalKcalNumber = computed(() => Number(totalData.value.totalKcal ?? 0));
const rows = computed(() => [
  { label: '탄수화물', value: Number(totalData.value.totalCarbohydrate ?? 0).toFixed(1) },
  { label: '단백질', value: Number(totalData.value.totalProtein ?? 0).toFixed(1) },
  { label: '지방', value: Number(totalData.value.totalFat ?? 0).toFixed(1) },
  { label: '당류', value: Number(totalData.value.totalSugar ?? 0).toFixed(1) },
  { label: '나트륨', value: Number(totalData.value.totalNatrium ?? 0).toFixed(0) },
]);

</script>

<template>
  <div class="wrap">
    <div class="header-row">
      <span class="otd-category">음식 상세</span>
      <MealTabs v-model="tab" />
    </div>

    <div class="otd-top-margin">
      <MacroBubbles :percent="percent" :grams="totalData" :date-range="title" @prev="goPrev" @next="goNext" />
    </div>

    <div class="otd-top-margin">
      <NutritionTable :totalKcal="totalKcalNumber" :rows="rows" />

    </div>
  </div>
</template>

<style scoped>
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
