<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const foods = ref(history.state?.foods || []);
const totalKcal = computed(() =>
  foods.value.reduce((sum, f) => sum + f.kcal, 0)
);

const removeFood = (i) => foods.value.splice(i, 1);
</script>

<template>
  <div class="wrap">
    <span class="otd-category">{{ route.query.meal }} 기록</span>
    <div class="otd-subtitle-1 otd-top-margin">총 {{ totalKcal }} kcal</div>

    <div class="food-list otd-top-margin">
      <div v-for="(food, i) in foods" :key="food.name" class="food-item">
        <div>{{ food.name }} {{ food.amount }}</div>
        <div>
          {{ food.kcal }} kcal
          <button class="remove-btn" @click="removeFood(i)">✕</button>
        </div>
      </div>
    </div>

    <div class="btn-group otd-top-margin">
      <button class="otd-button">음식 추가</button>
      <button class="otd-button complete-btn">식단 기록 완료</button>
    </div>
  </div>
</template>

<style scoped>
.food-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.food-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}
.remove-btn {
  border: none;
  background: none;
  cursor: pointer;
  color: #ff595e;
}
.btn-group {
  display: flex;
  gap: 12px;
}
.complete-btn {
  background: #ffe864;
  color: #303030;
}
</style>
