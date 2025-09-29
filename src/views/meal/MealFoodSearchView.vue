<script setup>
import { ref, computed, reactive, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { debounce, flatMapDepth } from 'lodash';
import { getFood } from '@/services/meal/mealService';
import { checkDuplicateUser } from '@/services/user/userService';

import {useMealSelectedDayStore} from '@/stores/meal/mealStore.js'


import checkOn from '@/assets/img/meal/meal_search_check.png'
import checkOff from '@/assets/img/meal/meal_search_default.png'


const selectedDay = useMealSelectedDayStore();


const router = useRouter();
const route = useRoute();
const keyword = ref(null);
const selected = ref([]);

// 선택된 음식
const clickFood = ref({
  foodDbId: null,
  foodName: '',
  amount: 0,          // 사용자가 조절하는 값(ml/g)
  kcal: 0,           // amount 기준 kcal
  _kcalPer100: 0,     // 계산용(100g/ml 당 kcal)
  protein: 0,       // amount 기준 단백질
  carbohydrate: 0, // amount 기준 탄수화물  
  fat: 0,          // amount 기준 지방
  sugar: 0,        // amount 기준 당
  natrium: 0,      // amount 기준 나트륨
  flag: '',
  // 필요하면 protein/carbohydrate/fat 등도 _per100로 보관
});


// 음식 검색 결과 담는곳
const items = reactive({
  foodList: [],
});

const changeText = debounce(() => {
  // const searchFood = value;
  // console.log('foodName change:', searchFood);
  searchFoodName(keyword.value);
}, 50);

// 검색어 입력/선택 처리
const onFoodNameInput = async (value) => {
  // value가 string이면 검색 입력
  if (typeof value === 'string') {
    changeText(value);   
  }
 
};


const searchFoodName = async (keyword) => {
  console.log('이게왜', keyword);
  console.log('시간:', selectedDay.selectedDay.setDay);
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
              natrium: item.natrium,
              checked: false
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

//출력할때 선택 한거는 내가 선택한 값으로 표시
// 선택 빠른 조회용 맵
const selectedValue = computed(() => {
  const values = new Map()
  for (const item of selected.value) values.set(item.foodDbId, item)
  return values
})

// 체크여부 & 표시값 헬퍼 함수
//역할은 해당 키(key)가 Map 안에 존재하는지 확인하는 것.
const isSelected = (id) => selectedValue.value.has(id);
const displayAmount = (food) => selectedValue.value.get(food.foodDbId)?.amount ?? food.amount;
const displayKcal = (food) => selectedValue.value.get(food.foodDbId)?.kcal ?? food.kcal;




//  바텀시트 상태 + 편집 대상(상세에서 조절)
const sheetOpen = ref(false)
const customFood = ref ({
  foodDbId: null,
  foodName: '',
  amount: 0,          // 사용자가 조절하는 값(ml/g)
  kcal: 0,           // amount 기준 kcal
  _kcalPer100: 0,     // 계산용(100g/ml 당 kcal)
  protein: 0,       // amount 기준 단백질
  carbohydrate: 0, // amount 기준 탄수화물  
  fat: 0,          // amount 기준 지방
  sugar: 0,        // amount 기준 당
  natrium: 0,      // amount 기준 나트륨
  flag: '',
  // 필요하면 protein/carbohydrate/fat 등도 _per100로 보관
});

// 리스트 아이템 클릭 → 바텀시트 오픈

const openSheet = (food) => {
  const kcalPer100 = food.amount ? Math.round(food.kcal / (food.amount / 100)) : 0
  
  clickFood.value = {
    ...food,
    _kcalPer100: kcalPer100,
  }
  // 이미 담아둔 값이 있으면 그 값으로 customFood 채우기
  const saved = selectedValue.value.get(food.foodDbId)
  if (saved) {
    customFood.value = {
      ...saved,
      _kcalPer100: kcalPer100, // 계산용 per100은 최신으로 유지
    }
  } else {
    // 없으면 원본 food로 채우기
    customFood.value = {
      ...food,
      _kcalPer100: kcalPer100,
    }
  }
  sheetOpen.value = true
}

// 양 변경 시 kcal 재계산
const recalc = () => {
  const result = (customFood.value.amount || 0) / 100;
  customFood.value.kcal = Math.round((clickFood.value._kcalPer100 || 0) * result);
  customFood.value.protein = Math.round((clickFood.value.protein || 0) * result);
  customFood.value.carbohydrate = Math.round((clickFood.value.carbohydrate || 0) * result);
  customFood.value.fat = Math.round((clickFood.value.fat || 0) * result);
  customFood.value.sugar = Math.round((clickFood.value.sugar || 0) * result);
  customFood.value.natrium = Math.round((clickFood.value.natrium || 0) * result);
}
// + / - 버튼
const changeAmount = (delta) => {
  const next = Math.max(0, (Number(custom_food.value.amount) || 0) + delta)
  custom_food.value.amount = next;
  recalc();
}

//  [목록에 담기]
const addToList = () => {
  const modiFood = customFood.value
  const idx = selected.value.findIndex(value => value.foodDbId === modiFood.foodDbId)

  const payload = {
    foodDbId: modiFood.foodDbId,
    foodName: modiFood.foodName,
    amount: modiFood.amount,
    kcal: modiFood.kcal,
    flag: modiFood.flag,
    protein: modiFood.protein,
    carbohydrate: modiFood.carbohydrate,
    fat: modiFood.fat,
    sugar: modiFood.sugar,
    natrium: modiFood.natrium,
  }

  if (idx === -1) selected.value.push(payload)
  else selected.value[idx] = payload

  // (선택) 리스트 표시값도 덮어쓰고 싶으면:
  const target = items.foodList.find(f => f.foodDbId === modiFood.foodDbId)
  if (target) {
    // target.checked = true   // 이제 체크는 selected 기반이므로 불필요
    // target.amount  = e.amount
    // target.kcal    = e.kcal
  }

  sheetOpen.value = false
}


// 음식 선택/해제
const toggleSelect = (food) => {


  console.log("클릭중" , food);

  const foodInfo = food;

// console.log('드롭다운에서 클릭된 항목:', foodInfo);
if (!selected.value.some((item) => item.foodDbId === foodInfo.foodDbId)) {
  selected.value.push({
    foodDbId: foodInfo.foodDbId,
    foodName: foodInfo.foodName,
    kcal: foodInfo.kcal*(foodInfo.amount/100),
    flag: foodInfo.flag,
    protein: foodInfo.protein(foodInfo.amount / 100),
    carbohydrate: foodInfo.carbohydrate(foodInfo.amount / 100),
    fat: foodInfo.fat(foodInfo.amount / 100),
    sugar: foodInfo.sugar(foodInfo.amount / 100),
    natrium: foodInfo.natrium(foodInfo.amount / 100),
    amount: foodInfo.amount,
    
  });
  foodInfo.checked = true;
}
// 음식id가 이미 선택된 상태라면 선택 해제
else
{
  const idx = selected.value.findIndex((f) => f.foodDbId === food.foodDbId);
  food.checked = false;
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

//  확정 버튼 → 식단 메인으로 이동
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


</script>

<template>
  <div class="wrap">
    <span class="otd-title">무슨 음식을 먹었나요?</span>
    <!-- <input v-model="keyword" placeholder="음식명 입력" class="search-input otd-border " /> -->

    <v-text-field placeholder="음식명 입력" class="search-input otd-top-margin" v-model="keyword" :items="items.foodList"
      item-title="foodName" item-value="foodDbId" variant="outlined" rounded="xl" density="comfortable" clearable
      @update:model-value="onFoodNameInput" @keyup.enter.prevent="searchFoodName(keyword)">
      <template #append-inner>
        <v-icon class="mr-2" @click="searchFoodName(keyword)">mdi-magnify</v-icon>
      </template>
    </v-text-field>


    <!-- <div class="food-list otd-top-margin">
      <div v-for="food in items.foodList" :key="food.foodDbId" class="food-item" @click="toggleSelect(food)">
        <div class="otd-body-2 d-flex flex-column ">
          <span>{{ food.foodName }}</span>
          <span> {{ food.amount }}</span>
        </div>
        <div>
          <span>{{ food.kcal }} kcal</span>
          <img class="check" :src="food.checked ? checkOn : checkOff" :alt="food.checked ? 'Checked' : 'Default'" />
        </div>
      </div>
    </div>

    <button class="otd-button confirm-btn" :disabled="selected.length === 0" @click="goRecord">
      {{ selected.length }} 개 담았어요
    </button> -->
    <!-- 리스트 -->
    <div class="food-list otd-top-margin">
      <div v-for="food in items.foodList" :key="food.foodDbId" class="food-item" @click="openSheet(food)">
        <div class="otd-body-2 d-flex flex-column">
          <span>{{ food.foodName }}</span>
          <span>{{ displayAmount(food) }}</span> <!-- 선택되면 selected.amount -->
        </div>
        <div class="d-flex align-center">
          <span class="mr-2">{{ displayKcal(food) }} kcal</span> <!-- 선택되면 selected.kcal -->
          <img class="check" :src="isSelected(food.foodDbId) ? checkOn : checkOff"
            :alt="isSelected(food.foodDbId) ? 'Checked' : 'Default'" />
        </div>
      </div>
    </div>
    <!--  바텀시트 v-dialog -->
    <!-- <v-dialog v-model="sheetOpen" transition="dialog-bottom-transition" :scrim="true" :persistent="true" width="500"
      class="bottom-sheet otd-sheet" :contained="false" :z-index="5000" >
      <template #default>
        <div class="sheet-card">
          <div class="sheet-handle" />
          <div class="sheet-title otd-title">{{ custom_food.foodName }}</div>

          <div class="kcal-card">
            <div class="otd-body-2">kcal</div>
            <div class="otd-title">{{ custom_food.kcal }} kcal</div>
          </div>

          <div class="amount-row">
            <v-btn icon="mdi-minus" variant="tonal" @click="changeAmount(-10)" />
            <v-text-field v-model.number="custom_food.amount" type="number" min="0" density="comfortable" variant="outlined"
              class="mx-3" suffix="g" @update:model-value="recalc" />
            <v-btn icon="mdi-plus" variant="tonal" @click="changeAmount(10)" />
          </div>

          <div class="actions">
            <v-btn variant="outlined" class="mr-2" @click="sheetOpen = false">닫기</v-btn>
            <v-btn color="yellow-darken-2" class="text-black" @click="addToList">
              목록에 담기
            </v-btn>
          </div>
        </div>
      </template>
    </v-dialog> -->
    <v-dialog v-model="sheetOpen" transition="dialog-bottom-transition" :scrim="true" :persistent="true"
      :contained="true" content-class="otd-sheet" scrim-class="otd-scrim" @click:outside="sheetOpen = false">
      <div class="sheet-card">
        <!-- 핸들바 -->
        <div class="sheet-handle" />

        <!-- 제목 -->
        <div class="sheet-title">
          {{ custom_food.foodName }}
        </div>

        <!-- 영양 간단 피ills (필요 없으면 v-if 지우기) -->
        <div class="pill-row">
          <div class="pill pill-carb"><span class="badge">탄</span> {{ Math.ceil((custom_food.carbohydrate )) }} {{ custom_food.flag }}</div>
          <div class="pill pill-protein"><span class="badge">단</span> {{ Math.ceil((custom_food.protein)) }} {{ custom_food.flag }}</div>
          <div class="pill pill-fat"><span class="badge">지</span> {{ Math.ceil((custom_food.fat)) }} {{ custom_food.flag }}</div>
        </div>

        <!-- kcal 카드 -->
        <div class="kcal-card">
          <span class="kcal-label">kcal</span>
          <div class="kcal-value"><strong>{{ custom_food.kcal }}</strong> kcal</div>
        </div>

        <!-- 단위/슬라이더 영역 (슬라이더가 없으면 이 블록은 빼도 됨) -->
        <!--
    <div class="unit-row">
      <div class="unit-chip">ml</div>
      <div class="unit-track"><div class="unit-thumb" :style="{ left: '40%' }"></div></div>
    </div>
    -->

        <!-- 수량 스텝퍼 -->
        <div class="stepper">
          <v-btn icon variant="flat" class="step-btn" @click="changeAmount(-10)">
            <v-icon>mdi-minus</v-icon>
          </v-btn>

          <v-text-field v-model.number="custom_food.amount" type="number" min="0" variant="outlined" density="comfortable"
            class="amount-field" hide-details suffix="g" @update:model-value="recalc" />

          <v-btn icon variant="flat" class="step-btn" @click="changeAmount(10)">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </div>

        <!-- 액션 버튼 -->
        <div class="actions">
          <v-btn variant="outlined" class="btn-outline" @click="sheetOpen = false">음식 상세</v-btn>
          <v-btn class="btn-primary" @click="addToList">목록에 담기</v-btn>
        </div>
      </div>
    </v-dialog>
    <!-- 하단 확정 버튼(선택개수 표시용) -->
    <button class="otd-button confirm-btn" :disabled="selected.length === 0" @click="goRecord">
      {{ selected.length }} 개 담았어요
    </button>
  </div>
</template>

<style scoped>
.check {
  width: 30px;
  height: 32px;
  padding-bottom: 1px;
  margin-left: 8px;
}
.food-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.food-item {
  display: flex;
  justify-content: space-between;
  height: 81px;
  width: 350px !important;
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

/*  노치 제거: 왼쪽에 서있는 세로선 원인 */
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


/* 바텀시트 */
:deep(.otd-sheet) {
  position: absolute !important;
  /* .layout 기준 */
 
  display: flex !important;
  align-items: center !important;
  /* 아래에서 올라오기 */
  justify-content: end !important;
  bottom: -24px !important;
  
}

/* 스크림도 프레임 안에서만 */
:deep(.otd-scrim) {
  backdrop-filter: blur(1px);
  background: rgba(0, 0, 0, .35);
}

/* 카드 크기는 그대로 */
.sheet-card {
  width: 391px;
  margin: 0 0 0px 0;
  background: #fff;
  border-radius: 0 0 60px 60px;
  padding: 30px 20px;
  box-shadow: 0 -10px 28px rgba(0, 0, 0, .2);
  display: flex;
  flex-direction: column;
  align-items: center;
  
}

/* 핸들바 */
.sheet-handle {
  width: 134px;
  height: 5px;
  border-radius: 999px;
  background: #000000;
  margin: 6px auto 12px;
}

/* 타이틀 */
.sheet-title {
  font-size: 20px;
  font-weight: 800;
  color: #222;
  letter-spacing: -0.2px;
  margin-bottom: 10px;
}

/* 영양 피ill들 */
.pill-row {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 12px;
  background: #f5f6f7;
  color: #333;
  font-size: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, .06);
}

.pill .badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-weight: 700;
  color: #fff;
  font-size: 12px;
}

.pill-carb .badge {
  background: #7ecf4a;
}

/* 초록 */
.pill-protein .badge {
  background: #f5c84c;
}

/* 노랑 */
.pill-fat .badge {
  background: #ff9b60;
}

/* 주황 */

/* kcal 카드 */
.kcal-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-radius: 14px;
  padding: 14px 20px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, .08);
  margin: 10px 0 16px;
  width: 100%;
}

.kcal-label {
  color: #7a7a7a;
  font-size: 14px;
 
}

.kcal-value {
  font-size: 22px;
  color: #222;
}

/* 단위/슬라이더 (옵션) */
.unit-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.unit-chip {
  padding: 6px 10px;
  border-radius: 999px;
  background: #f0f2f5;
  font-size: 12px;
  color: #666;
}

.unit-track {
  position: relative;
  flex: 1;
  height: 6px;
  border-radius: 999px;
  background: #eee;
}

.unit-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .2);
}

/* 수량 스텝퍼 */
.stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 6px 0 16px;
}

.step-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #f2f3f5 !important;
  box-shadow: none !important;
}

.amount-field {
  width: 200px;
}

.amount-field :deep(.v-field) {
  border-radius: 12px;
}

.amount-field :deep(.v-field__input) {
  text-align: center;
}

/* 액션 버튼 */
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-outline {
  border-color: #cfd3d9 !important;
  color: #2f2f2f !important;
  background: #fff !important;
}

.btn-primary {
  background: #ffe564 !important;
  color: #1f1f1f !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, .12);
  font-weight: 700;
  border-radius: 10px;
}

</style>
