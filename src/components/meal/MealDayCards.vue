<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const mealInfo = ref([
  {
    meal_day: '아침',
    kcal: 0,
    check: false,
    recorded: false,
    img: '/image/main/breakfast.png',
  },
  {
    meal_day: '점심',
    kcal: 0,
    check: false,
    recorded: false,
    img: '/image/main/lunch.png',
  },
  {
    meal_day: '저녁',
    kcal: 0,
    check: false,
    recorded: false,
    img: '/image/main/dinner.png',
  },
  {
    meal_day: '간식',
    kcal: 0,
    check: false,
    recorded: false,
    img: '/image/main/snack.png',
  },
]);

// 단식/참았어요 클릭 → 토글 처리 (recorded는 항상 false로)
const mealClick = (i) => {
  mealInfo.value[i].check = !mealInfo.value[i].check;
  mealInfo.value[i].recorded = false;
};

// + 이미지 눌렀을 때 → 식단 기록 페이지로 이동 & 기록 상태 true
const goRecord = (i) => {
  mealInfo.value[i].recorded = true;
  router.push({
    name: 'MealFoodSearchView',
    query: { meal: mealInfo.value[i].meal_day },
  });
};
</script>

<template>
  <span class="title-text">오늘의 식단</span>
  <div class="meal-cards">
    <div
      class="meal-card"
      v-for="(item, index) in mealInfo"
      :key="item.meal_day"
    >
      <!-- 상단 -->
      <button class="meal-card-top d-flex justify-content-between">
        <div class="d-flex flex-column">
          <img class="meal-top-img" :src="item.img" :alt="item.meal_day" />
          <span class="d-flex align-self-center otd-subtitle-1">
            {{ item.meal_day }}
          </span>
        </div>
        <div class="d-flex align-items-right">
          <img
            class="meal-check-img"
            v-if="item.recorded || item.check"
            src="/image/main/check.png"
            alt="체크"
          />
          <img
            class="meal-check-img"
            v-else
            src="/image/main/cross.png"
            alt="미체크"
          />
        </div>
      </button>

      <!-- 하단 -->
      <button class="meal-card-bottom">
        <div v-if="item.kcal > 0">{{ item.kcal }} kcal</div>

        <!-- 식사(아침/점심/저녁) 영역: recorded가 아니면 체크/미체크 모두 토글 가능 -->
        <img
          v-else-if="!item.recorded && item.meal_day !== '간식' && !item.check"
          src="/image/main/meal_default.png"
          alt="단식 미체크"
          @click="mealClick(index)"
        />
        <img
          v-else-if="!item.recorded && item.meal_day !== '간식' && item.check"
          src="/image/main/meal_check.png"
          alt="단식 체크"
          @click="mealClick(index)"
        />

        <!-- 간식 영역: recorded가 아니면 체크/미체크 모두 토글 가능 -->
        <img
          class="snack"
          v-else-if="!item.recorded && item.meal_day === '간식' && !item.check"
          src="/image/main/snack_default.png"
          alt="간식 미체크"
          @click="mealClick(index)"
        />
        <img
          class="snack"
          v-else-if="!item.recorded && item.meal_day === '간식' && item.check"
          src="/image/main/snack_check.png"
          alt="간식 체크"
          @click="mealClick(index)"
        />

        <!-- 위 모든 조건이 아니면: 기록 완료된 상태 → 체크 이미지 고정 -->
        <img
          class="snack"
          v-else-if="item.meal_day === '간식'"
          src="/image/main/snack_check.png"
          alt="간식 체크(기록됨)"
        />
        <img v-else src="/image/main/meal_check.png" alt="식사 체크(기록됨)" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.title-text {
  display: flex;
  font-weight: bold;
  font-size: 20px;
  margin-bottom: 15px;
  color: #303030;
}
.meal-cards {
  width: 350px;
  height: 265px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  border-radius: 12px;
}
.meal-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 170px;
  height: 125px;
  background: #fff;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  font-weight: 500;
  font-size: 14px;
  color: #303030;
}
.meal-top-img {
  width: 50px;
  height: 50px;
}
.meal-check-img {
  width: 27px;
  height: 22px;
}
.meal-card-bottom {
  display: flex;
  justify-content: start;
  margin-top: 5px;
}
.meal-card-bottom img {
  width: 91px;
  height: 17px;
}
.meal-card-bottom img.snack {
  width: 70px;
  height: 17px;
}
</style>
