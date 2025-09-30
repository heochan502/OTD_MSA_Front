<script setup>
import { ref, computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const BASE = import.meta.env.BASE_URL || '/';
const route = useRoute();
const router = useRouter();

// 전달된 음식 목록
const foods = ref(history.state?.foods || []);

// 합계 kcal & 개수
const totalKcal = computed(() => foods.value.reduce((sum, food) => sum + (foof.kcal || 0), 0));
const foodCount = computed(() => foods.value.length);

// 식사 아이콘 (아침/점심/저녁 매핑)
// 만약 값이 없으면 기본값은 점시으로 들어간다 
const mealKey = (route.query.meal || '점심').toString();
const mealIconMap = { 아침: 'breakfast', 점심: 'lunch', 저녁: 'dinner' };
const mealImg = (name) => `${BASE}image/meal/${name}.png`;
const mealIcon = computed(() => mealImg(mealIconMap[mealKey] || 'lunch'));

// 삭제
const removeFood = (i) => foods.value.splice(i, 1);

// 매크로 g
const grams = reactive({ carb: 28.5, protein: 53.2, fat: 45.9 });

// g → % (막대 폭)
const macroPct = computed(() => {
  const sum = grams.carb + grams.protein + grams.fat || 1;
  return {
    carb: Math.round((grams.carb / sum) * 100),
    protein: Math.round((grams.protein / sum) * 100),
    fat: Math.round((grams.fat / sum) * 100),
  };
});


const clickAddFood = ()=>{
  router.push({ name: 'MealFoodSearchView', query: { meal: route.query.meal  } });
}
</script>

<template>
  <div class="page ">
    <div class="wrap warp-top">
      <!-- 상단 카테고리 -->
      <span class="otd-category d-flex align-center justify-center">
        <img class="meal-img" :src="mealIcon" alt="먹은 시간" />
        <span class="title">{{ mealKey }} 기록</span>
        <span class="count-badge">{{ foodCount }}개</span>
      </span>

      <!-- 총 칼로리 -->
      <div class="total-kcal">총 {{ totalKcal }}kcal</div>

      <!-- 매크로 바 -->
      <div class="bar-container d-flex align-center flex-row">
        <div class="bar">
          <div class="seg carb" :style="{ width: macroPct.carb + '%' }"></div>
        </div>
        <div class="bar">
          <div class="seg protein" :style="{ width: macroPct.protein + '%' }"></div>
        </div>
        <div class="bar">
          <div class="seg fat" :style="{ width: macroPct.fat + '%' }"></div>
        </div>
      </div>

      <!-- g 표기 -->
      <div class="grams">
        <div class="g"><span class="dot carb"></span>순탄수 {{ grams.carb }}g</div>
        <div class="g"><span class="dot protein"></span>단백질 {{ grams.protein }}g</div>
        <div class="g"><span class="dot fat"></span>지방 {{ grams.fat }}g</div>
      </div>

      <!-- 음식 리스트 -->
      <div class="food-list otd-top-margin">
        <div v-for="(food, idx) in foods" :key="food.name" class="food-item">
          <div class="fi-left">
            <div class="fi-name">{{ food.name }}</div>
            <div class="fi-amount">{{ food.amount }}</div>
          </div>
          <div class="fi-right">
            <span class="fi-kcal">{{ food.kcal }} kcal</span>
            <button class="remove-btn" @click="removeFood(idx)">✕</button>
          </div>
        </div>
      </div>

      <!-- 버튼 -->
      <div class="btn-group otd-top-margin">
        <button class="otd-button add-btn" @click="clickAddFood">음식 추가</button>
        <button class="otd-button complete-btn">식단 기록 완료</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 페이지 배경 */
.page {

}

.meal-img { height: 32px; width: 32px; margin-right: 6px; }
.warp-top { margin-top: 20px !important; }

.otd-category {
  display: flex;
  align-items: center;
  gap: 6px;
}
.otd-category .title {
  font-size: 18px;
  font-weight: 700;
}
.count-badge {
  margin-left: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px; height: 22px;
  border-radius: 999px;
  background: #efefef;
  font-weight: 700;
  font-size: 12px;
}

/* 총 칼로리 */
.total-kcal {
  margin-top: 16px;
  font-size: 24px;
  font-weight: 800;
}

/* 매크로 바 */
.bar-container {
  gap: 12px;
  margin-top: 12px;
}
.bar {
  flex: 1;
  height: 14px;
  border-radius: 999px;
  background: #eee;
  overflow: hidden;
}
.seg { height: 100%; }
.carb { background: #ffb44d; }
.protein { background: #a4db67; }
.fat { background: #7fb8ff; }

/* g 표기 */
.grams {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  color: #444;
  font-size: 14px;
}
.g { display: flex; align-items: center; gap: 6px; }
.dot {
  display: inline-block;
  width: 6px; height: 6px;
  border-radius: 50%;
}
.dot.carb { background: #ffb44d; }
.dot.protein { background: #a4db67; }
.dot.fat { background: #7fb8ff; }

/* 음식 리스트: 구분선 스타일 */
.food-list { margin-top: 16px; background: #fff; border-radius: 16px; overflow: hidden; }
.food-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
}
.food-item:last-child { border-bottom: none; }
.fi-left { display: flex; flex-direction: column; }
.fi-name { font-weight: 700; }
.fi-amount { font-size: 12px; color: #777; margin-top: 2px; }
.fi-right { display: flex; align-items: center; gap: 8px; }
.fi-kcal { font-weight: 700; }
.remove-btn {
  border: none; background: none; cursor: pointer;
  color: #999; font-size: 16px; line-height: 1;
}

/* 버튼들 */
.btn-group { display: flex; gap: 12px; margin-top: 18px; }
.otd-button {
  flex: 1; padding: 12px 16px; border: none; border-radius: 999px;
  font-weight: 700; cursor: pointer;
}
.add-btn { background: #ffe864; color: #303030; }
.complete-btn { background: #3b3b3b; color: #fff; }
</style>