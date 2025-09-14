<script setup>
import { ref, onMounted } from 'vue';
import Progress from '@/components/challenge/Progress.vue';
import ProgressJs from '@/components/challenge/ProgressJs.vue';

const mealInfo = ref([
  { meal_day: '아침', kcal: 150, check: true, img: '/image/main/breakfast.png' },
  { meal_day: '점심', kcal: 0, check: false, img: '/image/main/lunch.png' },
  { meal_day: '저녁', kcal: 0, check: true, img: '/image/main/dinner.png' },
  { meal_day: '간식', kcal: 0, check: true, img: '/image/main/snack.png' },
]);
const challengeInfo = ref([
  { challenge_name: '달리기 30km', progress: 62 },
  { challenge_name: '운동시간 60시간', progress: 82 },
  { challenge_name: '팔굽혀 펴기 100개', progress: 22 },
  { challenge_name: '운동시간 50시간', progress: 72 },
  { challenge_name: '일간 미션 ', progress: 100 },
]);

const healthInfo = ref([
  {text: '체중(kg)', value: 70.5 },
  {text: '체지방률(%)', value: 15.3 },
  {text: '골격근량(kg)', value: 30.2 },
]);

// 단식했어요 누르면 바로 참았어요로 변경됨
const handleClick = (index) => {
  mealInfo.value[index].check = !mealInfo.value[index].check;
  // console.log("클릭 : ",mealInfo.value );
};

// TODO: 실제 데이터 연동 시
// onMounted(async () => {
//   const { data } = await api.get('/diet/today'); // 예시
//   mealInfo.value = data;
// }); 



</script>

<template>
  <div class="wrap">



    <section class="meal">
      <span class="title-text">오늘의 식단</span>
      <div class="meal-cards">
        <div class="meal-card" v-for="(item, index) in mealInfo" :key="item.meal_day">
          <!-- 상단 -->
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

          <!-- 하단 -->
          <button class="meal-card-bottom">
            <div v-if="item.kcal > 0">{{ item.kcal }} kcal</div>
            <img v-else-if="item.kcal === 0 && item.check && item.meal_day !='간식'" src="/image/main/meal_check.png"
              alt="단식 체크" @click="handleClick(index)" />
            <img v-else-if="item.kcal === 0 && !item.check && item.meal_day !='간식'" src="/image/main/meal_default.png"
              alt="단식 미체크" @click="handleClick(index)" />
            <img class="snack" v-else-if="item.kcal === 0 && !item.check && item.meal_day ==='간식'"
              src="/image/main/snack_default.png" alt="간식" />
            <img class="snack" v-else="item.meal_day === '간식'" src="/image/main/snack_check.png" alt="간식" />

          </button>

        </div>
      </div>
    </section>

    <section class="challenge-progress otd-top-margin">
      <span class="otd-subtitle-1">챌린지 달성률</span>
      <div class="challenge-progress-card otd-top-margin">
        <div class=" ">
          <div v-for="value in challengeInfo"
            class="d-flex justify-content-around align-items-center  challenge-progress-container">
            <span class="otd-body-3 space-span-start">{{ value.challenge_name }} </span>
            <!-- 차트에 해당하는 데이터를 불러와서 그값을 뿌림-->
            <Progress
              :class="{ 'progress-chart': true, 'progress-chart-high': value.progress > 70, 'progress-chart-middle': value.progress > 30 && value.progress <= 70, 'progress-chart-low': value.progress <= 30 }"
              :indata-progress="value.progress" />
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
      <div class="otd-top-margin d-flex justify-content-between ">
        <div v-for="(value, index) in healthInfo" :key="index" class="health-button">
          <div class="otd-top-margin">
            <div class="d-flex flex-column align-items-center">
              <span class="otd-body-3">{{ value.text }}</span>
              <span class="otd-subtitle-1">{{ value.value }}</span>
            </div>
          </div>
        </div>
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
}
.challenge-progress-container{
  margin-bottom: 4px;
}

.challenge-progress {

  flex-direction: row;
}
.challenge-progress-card
{
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
  box-shadow: none ;
}
 

/* Progress.vue 커스텀 */

.progress-chart-low :deep( .progress-bar) {
  background: #FF8282;
}

.progress-chart-middle :deep( .progress-bar) {
  background: #FFB996;
}

.progress-chart-high :deep( .progress-bar) {
  background: #00D5DF;
}

.space-span-start {  
  width: 30%;
}
.space-span-end {
  width: 10%;
}


.health-card{
  width: 350px;
  height: 87px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  
}

.health-button
{
  width: 110px;
  height: 75px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  
}
</style>
  