<script setup>
import { ref, computed } from 'vue';
import MealTabs from '@/components/meal/MealTabs.vue';
import MacroBubbles from '@/components/meal/MacroBubbles.vue';
import NutritionTable from '@/components/meal/NutritionTable.vue';

const tab = ref('day'); // 'day' | 'week' | 'month'
const title = computed(() =>
  tab.value === 'day'
    ? '09.03(수)'
    : tab.value === 'week'
    ? '08.30 ~ 09.05'
    : '09월 요약'
);

const percent = ref({ carb: 56, protein: 29, fat: 15 });
const grams = ref({ carb: 28.5, protein: 53.2, fat: 45.9 });
</script>

<template>
  <div class="wrap">
    <div class="header-row">
      <span class="otd-category">음식 상세</span>
      <MealTabs v-model="tab" />
    </div>

    <div class="otd-top-margin">
      <MacroBubbles :percent="percent" :grams="grams" :date-range="title" />
    </div>

    <div class="otd-top-margin">
      <NutritionTable :totalKcal="757" />
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
