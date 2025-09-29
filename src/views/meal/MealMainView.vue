<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter ,useRoute} from 'vue-router';
import MealSummaryCard from '@/components/meal/MealSummaryCard.vue';
import MealDayCards from '@/components/meal/MealDayCards.vue';
import WaterCard from '@/components/meal/WaterCard.vue'; // ✅ 추가
import MealDateStrip from '@/components/meal/MealDateStrip.vue';

import {useMealSelectedDayStore} from '@/stores/meal/mealStore.js'


const selectedDay = useMealSelectedDayStore();

const router = useRouter();
const route = useRoute()
const goDetail = () =>
  router.push({ name: 'MealDetailView', query: { range: 'day' } });

// 오늘 물 섭취량 (L). 실제 연동 시 API 값으로 바인딩하세요.
const todayWater = ref(0.0);



// 쿼리(meal)로 초기화 (예: /meal-food-search?meal=2025-09-26)
// const initial = route.query.meal ? new Date(route.query.meal) : new Date()
const selectedDate = ref(new Date()) ;

// 날짜 바뀔 때 라우터 쿼리 싱크 (선택)
watch(selectedDate, (day) => {
  const yyyy = day.getFullYear();
  const mm = String(day.getMonth() + 1).padStart(2, '0');
  const dd = String(day.getDate()).padStart(2, '0');
  selectedDay.selectedDay.setDay = `${yyyy}-${mm}-${dd}`;
  console.log(selectedDay.selectedDay.setDay);
  router.replace({ query: { ...route.query}, day: `${yyyy}-${mm}-${dd}` });
});


onMounted (async () => {
 
});
</script>

<template>
   
<MealDateStrip
    v-model="selectedDate"
    :before="365"
    :after="365"
    @change="(d) => { /* d로 데이터 로드 등 */ }"
  />


  <div class="wrap">
    <!-- 상단 요약 카드 -->
    <div class="otd-top-margin">
      <div
        class="d-flex"
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
        "
      ></div>
      <MealSummaryCard @more="goDetail" />
    </div>

    <!-- 아침/점심/저녁/간식 카드 -->
    <div class="otd-top-margin">
      <MealDayCards />
    </div>

    <!-- 물 섭취 카드 -->
    <div class="otd-top-margin">
      <WaterCard :todayAmount="todayWater" />
    </div>
  </div>
</template>

<style setup >
/* 이 뷰는 공통 유틸(main.css) + 각 카드 내부 스타일을 사용
   */
.wrap{
  margin-top: 0px !important;
}
</style>

