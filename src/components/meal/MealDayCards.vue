<script setup>
import { onMounted, ref, watch, reactive } from 'vue';
import { useRouter } from 'vue-router';

import { getMealRecord } from '@/services/meal/mealService.js';

import { useMealSelectedStore, useMealRecordStore } from '@/stores/meal/mealStore.js'
import { storeToRefs } from 'pinia';

const router = useRouter();


const selectedDay  = useMealSelectedStore();

const  eatenFood = useMealRecordStore();

const {eatenFoodList } = storeToRefs(eatenFood);

// 배포 베이스(/ 또는 /otd/ 등)에 안전한 public 자산 경로 생성
const BASE = import.meta.env.BASE_URL || '/';
// 예: '/image/meal/breakfast.png' → `${BASE}image/meal/breakfast.png`
const mealImg = (name) => `${BASE}image/meal/${name}.png`;

const mealInfo = ref([
  {
    mealDay: '아침',
    kcal: 0,
    check: false,
    recorded: false,
    img: mealImg('breakfast'),
  },
  {
    mealDay: '점심',
    kcal: 0,
    check: false,
    recorded: false,
    img: mealImg('lunch'),
  },
  {
    mealDay: '저녁',
    kcal: 0,
    check: false,
    recorded: false,
    img: mealImg('dinner'),
  },
  {
    mealDay: '간식',
    kcal: 0,
    check: false,
    recorded: false,
    img: mealImg('snack'),
  },
]);


const addToDefaultList = (res)=>{
   eatenFoodList.value = [ ];
  const list = Array.isArray(res) ? res : res.data;

    

  list.forEach((mealRecord,idx ) => {
    // foodDb가 있으면 그걸, 없으면 userFood를 사용
    const food = mealRecord?.foodDb ?? mealRecord?.userFood ?? {};

    // 출처별 id를 분리(시스템이면 makeFoodId=null, 사용자면 systemFoodId=null)
    const mealId = mealRecord?.foodDb?.foodDbId ?? null;
    const userFoodId = mealRecord?.userFood?.userFoodId ?? null;

    const payload = {
      mealId,                     // MealFoodDb.foodDbId or null
      userFoodId,                       // MealFoodMakeDb.userFoodId or null
      foodName: food?.foodName ?? "",
      // amount는 음식 엔티티가 아니라 MealRecord의 foodAmount임
      amount: Number(mealRecord?.foodAmount) || 0,
      kcal: food?.kcal || 0,
      flag: food?.flag ?? "",
      protein: Number(food?.protein) || 0,
      carbohydrate: Number(food?.carbohydrate) || 0,
      fat: Number(food?.fat) || 0,
      sugar: Number(food?.sugar) || 0,
      natrium: Number(food?.natrium) || 0,
      // 필요하면 음식 기준량(없으면 1)
      foodCapacity: Number(food?.foodCapacity ?? 1),
      mealTime: mealRecord.mealRecordIds.mealTime,
    };
    console.log("먹은 시점 : ", mealRecord.mealRecordIds.mealTime)

    const mealTimming = mealRecord.mealRecordIds.mealTime;

    // 카드 4개중에 먹은 시점 있는거 판별
    const target = mealInfo.value.find(idx => idx.mealDay === mealTimming);
    if(target ){
      // 체크/기록 표시
      // target.check = true;
      console.log("추가 칼로리 : ", payload.kcal);
      target.kcal += payload.kcal;
      target.recorded = true;
      console.log("체크 : ", mealInfo.check);
    }
    // if (mealRecord.mealRecordIds.mealTime === mealInfo.mealDay)
    //   {
    //     mealInfo.check  =  true ; 
    //     console.log("체크 : ", mealInfo.check )
    //   }
    
    eatenFoodList.value = [...eatenFoodList.value, payload];
    console.log("페이로드 ", eatenFood.eatenFoodList);
  });
 
};




const toggleFasting = (i) => {
  mealInfo.value[i].check = !mealInfo.value[i].check;
  if (mealInfo.value[i].check) mealInfo.value[i].recorded = false;
};

const onTopIconClick = (i) => {
  const item = mealInfo.value[i];
  if (item.recorded) {
    
    router.push({ name: 'MealRecordView', query: { meal: item.mealDay0 } });
  } else if (!item.check) {
    item.recorded = true;
    router.push({ name: 'MealFoodSearchView', query: { meal: item.mealDay0 } });
  }
};

watch( () => selectedDay.selectedDay.setDay, async () => {
  const res = await getMealRecord(selectedDay.selectedDay.setDay);
  mealInfo.value = mealInfo.value.map(item => ({
    ...item,
    check: false,
    recorded: false,
    kcal: 0,
  }));

  addToDefaultList(res);
});


onMounted(async() => {
  // 여기서 API 호출하여 mealInfo 초기화 가능
  const res = await getMealRecord(selectedDay.selectedDay.setDay);
  console.log("mealRecord", res);
  console.log("mealRecordIds", res[0]?.mealRecordIds);
  console.log("userFood", res[0]?.userFood);
  console.log("foodDb", res[0]?.foodDb);
  addToDefaultList(res);

});
</script>

<template>
  <div class="meal-cards">
    <div class="meal-card otd-shadow" v-for="(item, index) in mealInfo" :key="item.mealDay0">
      <button class="meal-card-top d-flex justify-content-between">
        <div class="d-flex flex-column">
          <!-- BASE_URL을 반영한 상단 아이콘 경로 -->
          <img class="meal-top-img" :src="item.img" :alt="item.mealDay" />
          <span class="d-flex align-self-center otd-subtitle-1">{{
            item.mealDay
            }}</span>
        </div>
        <div class="d-flex align-items-right">
          <img v-if="item.recorded" class="meal-check-img" src="/image/meal/check.png" alt="기록됨"
            @click="onTopIconClick(index)" />
          <img v-else-if="item.check" class="meal-check-img" src="/image/meal/check.png" alt="단식 체크" />
          <img v-else class="meal-check-img" src="/image/meal/cross.png" alt="미기록" @click="onTopIconClick(index)" />
        </div>
      </button>

      <button class="meal-card-bottom otd-body-3 ">
        <div class="bottom-text" v-if="item.kcal > 0">{{ item.kcal }} kcal</div>

        <img v-else-if="item.mealDay !== '간식' && !item.check" src="/image/meal/meal_default.png" alt="단식 미체크"
          @click="toggleFasting(index)" />
        <img v-else-if="item.mealDay !== '간식' && item.check" src="/image/meal/meal_check.png" alt="단식 체크"
          @click="toggleFasting(index)" />

        <img v-else-if="item.mealDay === '간식' && !item.check" class="snack" src="/image/meal/snack_default.png"
          alt="간식 미체크" @click="toggleFasting(index)" />
        <img v-else class="snack" src="/image/meal/snack_check.png" alt="간식 체크" @click="toggleFasting(index)" />
      </button>
    </div>
  </div>
</template>

<style scoped>
/* .meal-cards {
  width: 350px;
  height: 265px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  border-radius: 12px;
} */
 .meal-cards {
   display: grid;
   grid-template-columns: repeat(2, minmax(0, 1fr));
   /* 부모폭에 맞춰 자동 */
   gap: 12px;
   width: 100%;
   /* 고정폭 제거 */
   
   /* height: auto;        기본값이라 생략 가능 */
   
 }
/* .meal-card {
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
} */

.meal-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  /* 고정폭 → 100% */
  min-height: 125px;
  /* 필요 시 최소높이만 */
  background: #fff;
  padding: 15px;
  border-radius: 12px;
  font-weight: 500;
  font-size: 14px;
  color: #303030;
  box-sizing: border-box;
  /* 넘침 방지 */
  
}
.meal-top-img {
  width: 50px;
  height: 50px;
}
.meal-check-img {
  width: 27px;
  height: 25px;
}

/* .meal-card-bottom {
  display: flex;
  justify-content: start;
  margin-top: 5px;
} */


.meal-card-top,
.meal-card-bottom {
  width: 100%;
  background: transparent;
  border: 0;
  padding-top: 0px;

  
}
.meal-card-bottom{
  justify-items: left;
  align-self: center;
}
.bottom-text
{
  font-weight: 500;
  display: flex;
  align-self: end;
  justify-self: end;
}


.meal-card-top {
  display: flex;
  justify-content: space-between;
  align-items: top;
}

.meal-card-bottom img {
  width: 91px;
  height: 17px;
  padding-left: 5px;
  margin-top: 2px;
  display: flex;
  justify-content: space-between;
}
.meal-card-bottom img.snack {
  width: 80px;
  height: 17px;
}
</style>
