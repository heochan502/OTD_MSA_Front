<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const keyword = ref('');
const selected = ref([]);

// 예시 음식 데이터
const foods = [
  { name: '초코빵', amount: '80g', kcal: 120 },
  { name: '초코', amount: '10g', kcal: 40 },
  { name: '초코비 초코우유', amount: '180ml', kcal: 170 },
];

const toggleSelect = (food) => {
  const idx = selected.value.findIndex((f) => f.name === food.name);
  if (idx === -1) selected.value.push(food);
  else selected.value.splice(idx, 1);
};

// ✅ 확정 버튼 → 식단 메인으로 이동
const goRecord = () => {
  router.push({
    name: 'MealMainView', // 라우트 이름 그대로 사용
    query: {
      meal: route.query.meal || '', // 어떤 끼니에서 왔는지(옵션)
      recorded: '1', // 기록 완료 신호(옵션)
    },
    // state: { foods: selected.value }  // 필요하면 상태로 함께 전달
  });
};
</script>

<template>
  <div class="wrap">
    <span class="otd-category">무슨 음식을 먹었나요?</span>
    <input v-model="keyword" placeholder="음식명 입력" class="search-input" />

    <div class="food-list otd-top-margin">
      <div
        v-for="food in foods"
        :key="food.name"
        class="food-item"
        @click="toggleSelect(food)"
      >
        <div class="otd-body-2">{{ food.name }} {{ food.amount }}</div>
        <span>{{ food.kcal }} kcal</span>
      </div>
    </div>

    <button
      class="otd-button confirm-btn"
      :disabled="selected.length === 0"
      @click="goRecord"
    >
      {{ selected.length }} 개 담았어요
    </button>
  </div>
</template>

<style scoped>
.search-input {
  width: 100%;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid #ccc;
  margin: 12px 0;
}
.food-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.food-item {
  display: flex;
  justify-content: space-between;
  background: #fff;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  cursor: pointer;
}
.confirm-btn {
  width: 100%;
  margin-top: 20px;
  background: #ffe864;
  color: #303030;
  padding: 12px;
  border-radius: 12px;
}
</style>
