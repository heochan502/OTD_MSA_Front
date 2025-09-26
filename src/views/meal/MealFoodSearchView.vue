<script setup>
import { ref, computed, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { debounce } from 'lodash';
import { getFood } from '@/services/meal/mealService';

const router = useRouter();
const route = useRoute();
const keyword = ref(null);
const selected = ref([]);



// // 바로 접근 가능
// console.log(route.query.meal) 

// // 카테고리용 드랍박스용
// const foodNameBox = ref({
//   isMenuActive: false,
// });

// 음식 검색 결과 담는곳
const items = reactive({
  foodList: [],
});

const changeText = debounce(() => {
  // const searchFood = value;
  // console.log('foodName change:', searchFood);
  searchFoodName(keyword.value);
}, 50);
// 무조건 박스 표출하기위한 forceopendropdown
const onFoodNameInput = async (value) => {
  // value가 string이면 검색 입력
  if (typeof value === 'string') {
    changeText(value);
    // forceOpenDropdown();
  }

  // value가 객체면 (리스트에서 선택) → selected에 추가
  else if (typeof value === 'object' && value !== null) {
    selected.value.push(value); //  음식 객체 저장
    keyword.value = ''; //  검색창 비우기
  }
};
// 다시 카테고리 눌렀을때 name 쪽 비워서 검색에 무리없게 만들기

// const forceOpenDropdown = () => {
//   setTimeout(() => {
//     foodNameBox.value.isMenuActive = true;
//   }, 50);
// };

const searchFoodName = async (keyword) => {
  console.log('이게왜', keyword);

  const res = await getFood(keyword);

  // console.log(" 이름 : ", res);
  // 데이터 넣는곳
  if (Array.isArray(res)) {
    // null이 아닐떄만 아래 실행
    if (keyword) {
      // console.log('널확인 ', searchFood.foodName);
  

      items.foodList = Array.from(
        new Map(
          res.map((item) => [
            item.foodName.trim(),
            {
              foodDbId: item.foodDbId,
              foodName: item.foodName.trim(),
              kcal:  Math.floor(item.kcal *(item.foodCapacity/100)),
               // 처음 가져오는건 식품기준 용량 이지만 이후는 사용자가 섭취량으로 인식하기 떄문에 amount로 설정
              amount: item.foodCapacity,
              flag: item.flag,
              protein : item.protein,
              carbohydrate : item.carbohydrate,
              fat : item.fat,
              sugar : item.sugar,
              natrium: item.natrium
            },
          ])
        ).values() // foodName 기준으로 중복 제거 공백까지 포함
      );
      console.log('음식확인 ', items.foodList);
    } else {
      return null;
    }
    // console.log('아이템', items);
  }
};

// // 목록 추가
// const onItemClick = (item) => {
//   // console.log('드롭다운에서 클릭된 시점 아이템:', items);
//   const foodInfo = item[0];

//   // console.log('드롭다운에서 클릭된 항목:', foodInfo);
//   if (!selected.value.some((item) => item.foodDbId === foodInfo.foodDbId)) {
//     selected.value.push({
//       foodDbId: foodInfo.foodDbId,
//       foodName: foodInfo.foodName,
//       kcal: foodInfo.kcal,
//       amount: foodInfo.foodCapacity,
//       flag: foodInfo.flag,
//       protein : foodInfo.protein,
//       carbohydrate : foodInfo.carbohydrate,
//       fat : foodInfo.fat,
//       sugar : foodInfo.sugar,
//       natrium: foodInfo.natrium,
//       amount: foodInfo.amount,
//     });
//   }
//   console.log('배열에 넣는데:', selected.value);
// };

const toggleSelect = (food) => {
  console.log("클릭중" , food);

  const foodInfo = food;

// console.log('드롭다운에서 클릭된 항목:', foodInfo);
if (!selected.value.some((item) => item.foodDbId === foodInfo.foodDbId)) {
  selected.value.push({
    foodDbId: foodInfo.foodDbId,
    foodName: foodInfo.foodName,
    kcal: foodInfo.kcal,
    amount: foodInfo.foodCapacity,
    flag: foodInfo.flag,
    protein : foodInfo.protein,
    carbohydrate : foodInfo.carbohydrate,
    fat : foodInfo.fat,
    sugar : foodInfo.sugar,
    natrium: foodInfo.natrium,
    amount: foodInfo.amount,
  });
}
else
{
  const idx = selected.value.findIndex((f) => f.foodDbId === food.foodDbId);
  selected.value.splice(idx, 1);
  console.log("같은거 클릭", idx);
}
console.log('배열에 넣는데:', selected.value);
  // const idx = selected.value.findIndex((f) => f.name === food.name);
  // if (idx === -1) selected.value.push(food);
  // else selected.value.splice(idx, 1);  
};

const menuOpen = ref(false);
//데이터 입력 받고 정리 하는곳
const itemList = ref([]);

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

// 예시 음식 데이터
const foods = [
  { name: '초코빵', amount: '80g', kcal: 120 },
  { name: '초코', amount: '10g', kcal: 40 },
  { name: '초코비 초코우유', amount: '180ml', kcal: 170 },
];
</script>

<template>
  <div class="wrap">
    <span class="otd-title">무슨 음식을 먹었나요?</span>
    <!-- <input v-model="keyword" placeholder="음식명 입력" class="search-input otd-border " /> -->

    <v-text-field placeholder="음식명 입력" class="search-input otd-top-margin"
     v-model="keyword" 
      :items="items.foodList" item-title="foodName" 
      item-value="foodDbId" variant="outlined" rounded="xl"
      density="comfortable" clearable
       @update:model-value="onFoodNameInput"
      @keyup.enter.prevent="searchFoodName(keyword)" >
      <template #append-inner>
        <v-icon class="mr-2" @click="searchFoodName(keyword)">mdi-magnify</v-icon>
      </template>
    </v-text-field>
    

    <div class="food-list otd-top-margin">
      <div
        v-for="food in items.foodList"
        :key="food.foodDbId"
        class="food-item"
        @click="toggleSelect(food)"
      >
        <div class="otd-body-2 d-flex flex-column ">
          <span>{{ food.foodName }}</span> 
          <span> {{ food.amount }}</span>
        </div>
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
.food-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.food-item {
  display: flex;
  justify-content: space-between;
  height: 81px;
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

/* 콤보 박스 설정 */
/* 둥근 필 & 연한 테두리 */
/* 기본 모양: 둥근 + 흰 배경, 이중 테두리 금지(여기서 border 주지 않음!) */
.search-input :deep(.v-field) {
  border-radius: 9999px !important;
  background: #fff !important;
  height: 56px;
  align-items: center;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1);
}

/* 🔸 노치 제거: 왼쪽에 서있는 세로선 원인 */
.search-input :deep(.v-field__outline__notch) {
  width: 0 !important;
  border: 0 !important;
}

/* 외곽선 색/두께 */
.search-input :deep(.v-field--variant-outlined .v-field__outline__start),
.search-input :deep(.v-field--variant-outlined .v-field__outline__end) {
  border-color: #e0e0e0 !important;
}

/* 포커스 시 */
.search-input :deep(.v-field--focused .v-field__outline__start),
.search-input :deep(.v-field--focused .v-field__outline__end) {
  border-color: #bdbdbd !important;
}

/* 높이/패딩 & 플레이스홀더 */
.search-input :deep(.v-field__input) {
  min-height: 44px;
  padding: 0 12px;
}

.search-input :deep(input::placeholder) {
  color: #9e9e9e !important;
  opacity: 1;
}

/* 아이콘 은은하게 */
.search-input :deep(.v-field__append-inner .v-icon) {
  opacity: 0.7;
}
</style>
