<script setup>
import { ref } from 'vue';

const mealInfo = ref([
  { meal_day: '아침', kcal: 150, check: true },
  { meal_day: '점심', kcal: 450, check: true },
  { meal_day: '저녁', kcal: 0,   check: true },
  { meal_day: '간식', kcal: 0,   check: false },
]);

// 단식했어요 누르면 바로 참았어요로 변경됨
const handleClick = (index)=>{
  mealInfo.value[index].check = !mealInfo.value[index].check;
  // console.log("클릭 : ",mealInfo.value );
}


// TODO: 실제 데이터 연동 시
// onMounted(async () => {
//   const { data } = await api.get('/diet/today'); // 예시
//   mealInfo.value = data;
// });
</script>

<template>
  <section class="progress-section">
    <div class="weather_container">
      <span class="title_text">날씨</span>
      <div class="cards">
        <div class="card">날씨 표출 !</div>
      </div>
    </div>

    <div class="progress_container">
      <span class="title_text">진행중</span>
      <div class="cards">
        <div class="card">+ 추가 목표</div>
      </div>
    </div>
  </section>

  <section class="meal">
    <span class="title_text">오늘의 식단</span>
    <div class="meal_cards">
      <div class="meal_card" v-for="(item, index) in mealInfo" :key="item.meal_day">
        <div class="meal_card_top">          
          <button class="meal_card_top" >{{ item.meal_day }}
          <img v-if="item.check" src="/image/main/check.png" alt="체크" />
          <img v-else src="/image/main/cross.png" alt="미체크" />
          </button>
        </div>
        <button class="meal_card_bottom">
        <div  v-if="item.kcal > 0">{{ item.kcal }} kcal</div>        
        <img
          v-else-if="item.kcal === 0 && item.check"
          src="/image/main/check_not_meal.png"
          alt="단식 체크"
          @click="handleClick(index)"
        />
        <img v-else src="/image/main/not_meal.png" alt="단식 미체크"  @click="handleClick(index)" />
      </button>
      </div>
    </div>
  </section>
</template>

<style scoped>

.progress-section {
  display: flex;
margin-bottom: 20px;
  gap: 15px;
  flex-direction: row;
}

.title_text {
  display: flex;
  font-weight: bold;
  font-size: 20px;
  margin-bottom: 20px;
  color: #303030;
}

.cards { display: flex; gap: 12px; }
.card {
  width: 168px;
  height: 121px;
  background: #fff;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 3px 5px rgba(0,0,0,0.1);
}


.meal_cards {
  width: 350px;
  height: 223px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  background: #ffe864;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 3px 5px rgba(0,0,0,0.1);
}

.meal_card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 152px;
  height: 90px;
  background: #fff;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 3px 5px rgba(0,0,0,0.1);
  font-weight: 500;
  font-size: 14px;
  color: #303030;
}

.meal_card_top {
  display: flex;
  justify-content: space-between;
  font-size: 18px;
  color: #303030;
  font-weight: bold;
}

.meal_card img { width: 60%; }
.meal_card_top img { width: 15%; }
.meal_card_bottom {
  display: flex;
  justify-content: start;
}
</style>
