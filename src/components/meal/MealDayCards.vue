<script setup>
import { ref } from 'vue';
import homeSImg from '/public/image/navigator_img/home-s.png';
import breakfastImg from '/public/image/main/breakfast.png';
import lunchImg from '/public/image/main/lunch.png';
import dinnerImg from '/public/image/main/dinner.png';
import snackImg from '/public/image/main/snack.png';

const mealInfo = ref([
  {
    meal_day: '아침',
    kcal: 150,
    check: true,
    img: '/otd/image/main/breakfast.png',
  },
  { meal_day: '점심', kcal: 0, check: false, img: '/otd/image/main/lunch.png' },
  { meal_day: '저녁', kcal: 0, check: true, img: '/otd/image/main/dinner.png' },
  { meal_day: '간식', kcal: 0, check: true, img: '/otd/image/main/snack.png' },
]);
const mealClick = (i) => {
  mealInfo.value[i].check = !mealInfo.value[i].check;
};
</script>

<template>
  <span class="title-text">오늘의 식단</span>
  <div class="meal-cards">
    <div class="meal-card" v-for="(item, index) in mealInfo" :key="item.meal_day">
      <button class="meal-card-top d-flex justify-content-between">
        <div class="d-flex flex-column">
          <img class="meal-top-img" :src="item.img" :alt="item.meal_day" />
          <span class="d-flex align-self-center otd-subtitle-1">{{
            item.meal_day
            }}</span>
        </div>
        <div class="d-flex align-items-right">
          <img class="meal-check-img" v-if="item.check" src="/otd/image/main/check.png" alt="체크" />
          <img class="meal-check-img" v-else src="/otd/image/main/cross.png" alt="미체크" />
        </div>
      </button>

      <button class="meal-card-bottom">
        <div v-if="item.kcal > 0">{{ item.kcal }} kcal</div>
        <img v-else-if="item.kcal === 0 && item.check && item.meal_day != '간식'" src="/image/main/meal_check.png"
          alt="단식 체크" @click="mealClick(index)" />
        <img v-else-if="item.kcal === 0 && !item.check && item.meal_day != '간식'" src="/image/main/meal_default.png"
          alt="단식 미체크" @click="mealClick(index)" />
        <img class="snack" v-else-if="item.kcal === 0 && !item.check && item.meal_day === '간식'"
          src="/otd/image/main/snack_default.png" @click="mealClick(index)" alt="간식" />
        <img class="snack" v-else src="/otd/image/main/snack_check.png" @click="mealClick(index)" alt="간식" />
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
