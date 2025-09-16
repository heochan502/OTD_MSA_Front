<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import MealSummaryCard from '@/components/meal/MealSummaryCard.vue';
import MealDayCards from '@/components/meal/MealDayCards.vue';
import WaterCard from '@/components/meal/WaterCard.vue'; // ✅ 추가

const router = useRouter();
const goDetail = () =>
  router.push({ name: 'MealDetailView', query: { range: 'day' } });

// 오늘 물 섭취량 (L). 실제 연동 시 API 값으로 바인딩하세요.
const todayWater = ref(0.0);
</script>

<template>
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
</style>

