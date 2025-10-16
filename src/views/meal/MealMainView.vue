<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import MealSummaryCard from '@/components/meal/MealSummaryCard.vue';
import MealDayCards from '@/components/meal/MealDayCards.vue';
import WaterCard from '@/components/meal/WaterCard.vue';
import MealDateStrip from '@/components/meal/MealDateStrip.vue';

import {
  getWaterIntake,
  postWaterIntake,
} from '@/services/meal/waterIntake.js';

import { useMealSelectedStore } from '@/stores/meal/mealStore.js';

const selectedDay = useMealSelectedStore();

const router = useRouter();
const route = useRoute();
const goDetail = () =>
  router.push({ name: 'MealDetailView', query: { range: 'day' } });

// 오늘 물 섭취량 (L). 실제 연동 시 API 값으로 바인딩하세요.
const todayWater = ref(0.0);

const getTodayWater = async () => {
  todayWater.value = await getWaterIntake(selectedDay.selectedDay.setDay); // 0~2L 사이 랜덤 값
  console.log('오늘물', todayWater.value);
};

// 쿼리(meal)로 초기화 (예: /meal-food-search?meal=2025-09-26)
// const initial = route.query.meal ? new Date(route.query.meal) : new Date()
const selectedDate = ref(new Date());

// 날짜 바뀔 때 라우터 쿼리 싱크 (선택)
watch(selectedDate, async (day) => {
  const yyyy = day.getFullYear();
  const mm = String(day.getMonth() + 1).padStart(2, '0');
  const dd = String(day.getDate()).padStart(2, '0');
  selectedDay.selectedDay.setDay = `${yyyy}-${mm}-${dd}`;
  console.log('선택날', selectedDay.selectedDay.setDay);
  router.replace({ query: { ...route.query }, day: `${yyyy}-${mm}-${dd}` });
  getTodayWater();
});

onMounted(async () => {
  if (!selectedDay.selectedDay.setDay ?? true) {
    const day = new Date();
    const yyyy = day.getFullYear();
    const mm = String(day.getMonth() + 1).padStart(2, '0');
    const dd = String(day.getDate()).padStart(2, '0');
    selectedDay.selectedDay.setDay = `${yyyy}-${mm}-${dd}`;
  }
  console.log('선택날', selectedDay.selectedDay.setDay);

  getTodayWater();
});
</script>

<template>
  <MealDateStrip v-model="selectedDate" :before="365" :after="365" />
  <div class="wrap wrap-top d-flex flex-column justify-center">
    <!-- 나의 하루 -->
    <MealSummaryCard @more="goDetail" />

    <!-- 식단 -->
    <div class="section-panel otd-top-margin">
      <span class="otd-subtitle-1 section-span">식단</span>
      <div class="panel-tight mt-2">
        <MealDayCards />
      </div>
    </div>

    <!-- 물 섭취 카드는 그대로 -->
    <div class="otd-top-margin">
      <WaterCard :todayAmount="todayWater" />
    </div>
  </div>
</template>

<style setup scoped>
/* 이 뷰는 공통 유틸(main.css) + 각 카드 내부 스타일을 사용
   */
.wrap {
  margin-top: 30px;
  justify-self: center;
}

/* // 화면이 391px 이상일 때만 max-width + 중앙정렬 적용 */
@media (min-width: 391px) {
  .wrap {
    width: 100%;
    max-width: 391px;
    margin: 0 auto;
    margin-top: 30px;
  }
}

/* 뷰 스타일에 추가 */
.section-panel {
  background: #f2f2f2;
  /* 연한 회색 배경 */
  border-radius: 16px;
  /* 둥글게 */
  padding: 10px;
  /* 안쪽 여백 */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  /* 아주 은은한 그림자 */
  margin-top: 12px;
  /* 섹션 간 간격 */
  display: flow-root;
  /* overflow: hidden; */
}
.section-span {
  margin-bottom: 15px;
}

/* 카드 박스가 패널 너비에 맞춰 자동으로 줄도록 */
.panel-tight :deep(.meal-cards) {
  width: 100%;
  max-width: 100%;
  margin: 0;
  /* 바깥 여백 제거(패널이 감싸지게) */
  box-sizing: border-box;
}
/* 혹시 카드 안에 고정폭이 있다면 해제 */
.panel-tight :deep(.meal-cards[style*='width']) {
  width: 100% !important;
}
/* 페이지 전체 여백 유지 */
.wrap-top {
  margin-top: 20px !important;
}
</style>
