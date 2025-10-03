<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 배포 베이스(/ 또는 /otd/ 등)에 안전한 public 자산 경로 생성
const BASE = import.meta.env.BASE_URL || '/';
// 예: '/image/meal/breakfast.png' → `${BASE}image/meal/breakfast.png`
const mealImg = (name) => `${BASE}image/meal/${name}.png`;

const mealInfo = ref([
  {
    meal_day: '아침',
    kcal: 0,
    check: false,
    recorded: false,
    img: mealImg('breakfast'),
  },
  {
    meal_day: '점심',
    kcal: 0,
    check: false,
    recorded: false,
    img: mealImg('lunch'),
  },
  {
    meal_day: '저녁',
    kcal: 0,
    check: false,
    recorded: false,
    img: mealImg('dinner'),
  },
  {
    meal_day: '간식',
    kcal: 0,
    check: false,
    recorded: false,
    img: mealImg('snack'),
  },
]);

const toggleFasting = (i) => {
  mealInfo.value[i].check = !mealInfo.value[i].check;
  if (mealInfo.value[i].check) mealInfo.value[i].recorded = false;
};

const onTopIconClick = (i) => {
  const item = mealInfo.value[i];
  if (item.recorded) {
    
    router.push({ name: 'MealRecordView', query: { meal: item.meal_day } });
  } else if (!item.check) {
    item.recorded = true;
    router.push({ name: 'MealFoodSearchView', query: { meal: item.meal_day } });
  }
};
</script>

<template>
  <div class="meal-cards">
    <div
      class="meal-card otd-shadow"
      v-for="(item, index) in mealInfo"
      :key="item.meal_day"
    >
      <button class="meal-card-top d-flex justify-content-between">
        <div class="d-flex flex-column">
          <!-- BASE_URL을 반영한 상단 아이콘 경로 -->
          <img class="meal-top-img" :src="item.img" :alt="item.meal_day" />
          <span class="d-flex align-self-center otd-subtitle-1">{{
            item.meal_day
          }}</span>
        </div>
        <div class="d-flex align-items-right">
          <img
            v-if="item.recorded"
            class="meal-check-img"
            src="/image/meal/check.png"
            alt="기록됨"
            @click="onTopIconClick(index)"
          />
          <img
            v-else-if="item.check"
            class="meal-check-img"
            src="/image/meal/check.png"
            alt="단식 체크"
          />
          <img
            v-else
            class="meal-check-img"
            src="/image/meal/cross.png"
            alt="미기록"
            @click="onTopIconClick(index)"
          />
        </div>
      </button>

      <button class="meal-card-bottom">
        <div v-if="item.kcal > 0">{{ item.kcal }} kcal</div>

        <img
          v-else-if="item.meal_day !== '간식' && !item.check"
          src="/image/meal/meal_default.png"
          alt="단식 미체크"
          @click="toggleFasting(index)"
        />
        <img
          v-else-if="item.meal_day !== '간식' && item.check"
          src="/image/meal/meal_check.png"
          alt="단식 체크"
          @click="toggleFasting(index)"
        />

        <img
          v-else-if="item.meal_day === '간식' && !item.check"
          class="snack"
          src="/image/meal/snack_default.png"
          alt="간식 미체크"
          @click="toggleFasting(index)"
        />
        <img
          v-else
          class="snack"
          src="/image/meal/snack_check.png"
          alt="간식 체크"
          @click="toggleFasting(index)"
        />
      </button>
    </div>
  </div>
</template>

<style scoped>
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
  width: 168px;
  height: 125px;
  background: #fff;
  padding: 15px;
  border-radius: 12px;
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
