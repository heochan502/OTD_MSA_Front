<script setup>
import { ref, onMounted, computed } from "vue";
import Progress from "@/components/challenge/Progress.vue";
import ProgressJs from "@/components/challenge/ProgressJs.vue";

import LineChart from "@/components/excercise/lineChart.vue";

import MealCard from "@/components/meal/MealDayCards.vue";
// bmi 프로그레스바 컴포넌트
import BmiProg from "@/components/exercise/BmiProg.vue";

const mealInfo = ref([
  {
    meal_day: '아침',
    kcal: 150,
    check: true,
    img: '/image/main/breakfast.png',
  },
  { meal_day: '점심', kcal: 0, check: false, img: '/image/main/lunch.png' },
  { meal_day: '저녁', kcal: 0, check: true, img: '/image/main/dinner.png' },
  { meal_day: '간식', kcal: 0, check: true, img: '/image/main/snack.png' },
]);

const challengeInfo = ref([
  { challenge_name: "달리기 30km", progress: 62 },
  { challenge_name: "운동시간 60시간", progress: 82 },
  { challenge_name: "팔굽혀 펴기 100개", progress: 22 },
  { challenge_name: "운동시간 50시간", progress: 72 },
  { challenge_name: "일간 미션 ", progress: 100 },
]);

const healthInfo = ref([
  { text: "체중(kg)", value: 70.5, check: true },
  { text: "체지방률(%)", value: 15.3, check: false },
  { text: "골격근량(kg)", value: 30.2, check: false },
]);

const fields = [
  { key: "weight", label: "체중", unit: "kg" },
  { key: "BFP", label: "체지방률", unit: "%" },
  { key: "SMM", label: "골격근량", unit: "kg" },
];
const selectedField = ref(fields[0].key);

const inbodyData = ref([
  { dataTime: "2025-09-15", weight: "62.4", BFP: "20", SMM: "23" },
  { dataTime: "2025-09-16", weight: "62.1", BFP: "20.2", SMM: "22.9" },
  { dataTime: "2025-09-17", weight: "61.9", BFP: "20.1", SMM: "23.1" },
  { dataTime: "2025-09-18", weight: "62.5", BFP: "20.5", SMM: "22.8" },
  { dataTime: "2025-09-19", weight: "62.2", BFP: "20.3", SMM: "22.9" },
  { dataTime: "2025-09-20", weight: "61.8", BFP: "19.9", SMM: "23.2" },
  { dataTime: "2025-09-21", weight: "62.0", BFP: "20.0", SMM: "23.0" },
]);

const today = new Date().toISOString().slice(0, 10);
const todayData = computed(() => {
  return inbodyData.value.find((item) => item.dataTime === today);
});
// TODO: 실제 데이터 연동 시
// onMounted(async () => {
//   const { data } = await api.get('/diet/today'); // 예시
//   mealInfo.value = data;
// });

const healthToggle = (index) => {
  for (let i = 0; i < healthInfo.value.length; i++) {
    if (i !== index) {
      healthInfo.value[i].check = false;
    } else {
      healthInfo.value[index].check = !healthInfo.value[index].check;
    }
  }
};
</script>

<template>
  <div class="wrap">
    <section class="meal">
      <MealCard />
      <!-- 
      <span class="title-text">오늘의 식단</span>
      <div class="meal-cards">
        <div class="meal-card" v-for="(item, index) in mealInfo" :key="item.meal_day">
          상단
          <button class="meal-card-top d-flex justify-content-between">
            <div class="d-flex flex-column">
              <img class="meal-top-img" :src="item.img" :alt="item.meal_day" />
              <span class="d-flex align-self-center otd-subtitle-1">{{ item.meal_day }}</span>
            </div>
            <div class="d-flex align-items-right">
              <img class="meal-check-img" v-if="item.check" src="/image/main/check.png" alt="체크" />
              <img class="meal-check-img" v-else src="/image/main/cross.png" alt="미체크" />
            </div>
          </button>

          하단
          <button class="meal-card-bottom">
            <div v-if="item.kcal > 0">{{ item.kcal }} kcal</div>
            <img v-else-if="item.kcal === 0 && item.check && item.meal_day !='간식'" src="/image/main/meal_check.png"
              alt="단식 체크" @click="handleClick(index)" />
            <img v-else-if="item.kcal === 0 && !item.check && item.meal_day !='간식'" src="/image/main/meal_default.png"
              alt="단식 미체크" @click="handleClick(index)" />
            <img class="snack" v-else-if="item.kcal === 0 && !item.check && item.meal_day ==='간식'"
              src="/image/main/snack_default.png" @click="handleClick(index)" alt="간식" />
            <img class="snack" v-else="item.meal_day === '간식'"  src="/image/main/snack_check.png"  @click="handleClick(index)" alt="간식" />

          </button>

        </div>
      </div> -->
    </section>

    <section class="challenge-progress otd-top-margin">
      <span class="otd-subtitle-1">챌린지 달성률</span>
      <div class="challenge-progress-card otd-top-margin">
        <div class=" ">
          <div
            v-for="value in challengeInfo"
            class="d-flex justify-content-around align-items-center challenge-progress-container"
          >
            <span class="otd-body-3 space-span-start"
              >{{ value.challenge_name }}
            </span>
            <!-- 차트에 해당하는 데이터를 불러와서 그값을 뿌림-->
            <Progress
              :class="{
                'progress-chart': true,
                'progress-chart-high': value.progress > 70,
                'progress-chart-middle':
                  value.progress > 30 && value.progress <= 70,
                'progress-chart-low': value.progress <= 30,
              }"
              :indata-progress="value.progress"
            />
            <span class="otd-body-3 space-span-end">{{ value.progress }}%</span>
          </div>
        </div>
      </div>
    </section>

    <section class="health-progress otd-top-margin">
      <span class="otd-subtitle-1 otd-top-margin">건강</span>
      <div class="health-card">
        <div class="otd-top-margin">
          <div>
            <span class="otd-body-3">BMI</span>
          </div>
        </div>
      </div>
      <v-item-group v-model="selectedField" >
        <div class="otd-top-margin item-group ">
          <div v-for="(field, idx) in fields" :key="idx" class="card-wrapper ">
            <v-item v-slot="{selectedClass, toggle}" :value="field.key">
              <v-card :class="['health-button d-flex flex-column justify-center align-center text-center', selectedClass, ,]"
              @click="toggle">
              <div>
                <span class="otd-body-3">
                  {{ field.label }}({{ field.unit}}) </span>
              </div>
              <div class="otd-subtitle-1 text-center ">
                {{ todayData?.[field.key] }}
              </div>
              </v-card>
            </v-item>
          </div>
        </div>
      </v-item-group>

      <!-- <div class="otd-top-margin d-flex justify-content-between ">
        <button v-for="(value, index) in healthInfo" :key="index" :class="{ 'health-button': true, 'health-button-active': value.check }" @click="healthToggle(index)">

          <div class="d-flex flex-column align-items-center">
            <span class="otd-body-3">{{ value.text }}</span>
            <span class="otd-subtitle-1">{{ value.value }}</span>
          </div>
        </button>
      </div> -->

      <div class = otd-top-margin >
        <LineChart
        :selected-date="today"
        :selectedField="selectedField"
        :fields="fields"
        :logs="inbodyData"
      />
      </div>
    </section>
  </div>
</template>

<style scoped>
.progress-section {
  display: flex;
  margin-top: 30px;
  margin-bottom: 20px;
  flex-direction: row;
}

.title-text {
  display: flex;
  font-weight: bold;
  font-size: 20px;
  margin-bottom: 15px;
  color: #303030;
}

/* 
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
  overflow: visible;
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
  img{
    width: 91px;
    height: 17px;
  }
  .snack{
    width: 70px;
    height: 17px;
  }
} */
.challenge-progress-container {
  margin-bottom: 4px;
}

.challenge-progress {
  flex-direction: row;
}
.challenge-progress-card {
  width: 350px;
  height: 125px;
  padding: 10px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}

.progress-chart {
  width: 176px;
  height: 15px;
  box-shadow: none;
}

/* Progress.vue 커스텀 */

.progress-chart-low :deep(.progress-bar) {
  background: #ff8282;
}

.progress-chart-middle :deep(.progress-bar) {
  background: #ffb996;
}

.progress-chart-high :deep(.progress-bar) {
  background: #00d5df;
}

.space-span-start {
  width: 30%;
}
.space-span-end {
  width: 10%;
}

.health-card {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 350px;
  height: 87px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}

.bmi-prog
{
  padding: 10px;
}

.item-group {
  display: flex;
  flex-wrap: nowrap;
  
  gap: 10px;
}
.health-button {
  width: 110px;
  height: 75px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}
.health-button-active {
  background: #ffe864;
}
</style>
