<script setup>
import { ref, computed, reactive, watch, onMounted  } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { debounce, flatMapDepth } from 'lodash';
import { getFood } from '@/services/meal/mealService';

import { storeToRefs } from 'pinia';

import {useMealSelectedStore} from '@/stores/meal/mealStore.js'

import MealCustomFood from '@/components/meal/MealCustomFood.vue'

import checkOn from '@/assets/img/meal/meal_search_check.png'
import checkOff from '@/assets/img/meal/meal_search_default.png'



const selectedDay = useMealSelectedStore();

const { selectedFoods } = storeToRefs(selectedDay);

const router = useRouter();
const route = useRoute();
const keyword = ref(null);
// const selected = selectedDay.selectedFoods;



onMounted (()=>{
  const meal = String(route.query.meal ?? '');
  if (selectedDay.selectedDay.setTime !== meal || !selectedDay.selectedDay.setTime) {
    selectedFoods.value = [];        // 끼니 바뀌면 선택 초기화
    selectedDay.selectedDay.setTime = meal;
    // console.log('끼니 변경:', meal);
    // console.log('끼니 변경:', selectedDay.selectedDay.setDay);
  }
});

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

const changeText = debounce((keyword) => {
  // const searchFood = value;
  // console.log('foodName change:', searchFood);
  searchFoodName(keyword);
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
  console.log('시간:', selectedDay.selectedDay.setTime);
  const res = await getFood(keyword);

  // console.log(" 이름 : ", res);
  // 데이터 넣는곳
  if (Array.isArray(res)) {
    // null이 아닐떄만 아래 실행
    if (keyword) {
      // console.log('널확인 ', searchFood.foodName);
      

      items.foodList = Array.from(
        new Map(
          res.map((item) => {
            const isDb = item.foodDbId != null;

            // DB 음식: per100 * (capacity/100)
            // 커스텀 음식: kcal 그대로, amount는 1회
            const kcal = isDb
              ? Math.floor((Number(item.kcal) || 0) * ((Number(item.foodCapacity) || 0) / 100))
              : Math.round(Number(item.kcal) || 0);

            const amount = isDb
              ? Number(item.foodCapacity) || 0
              : 1;

            // 매크로도 동일 규칙로 스케일(커스텀은 그대로)
            const scale = (v) => Number(v) || 0;
            const scaled = (v) => isDb ? scale(v) * (amount / 100) : scale(v);

            return [
              item.foodName.trim(),
              {
                foodDbId: item.foodDbId,
                foodName: item.foodName.trim(),
                kcal,
                amount,
                flag: item.flag,                 // 커스텀이라면 '회' 등으로 바꾸고 싶으면 여기서 변경
                protein: scaled(item.protein),
                carbohydrate: scaled(item.carbohydrate),
                fat: scaled(item.fat),
                sugar: scaled(item.sugar),
                natrium: scaled(item.natrium),
                checked: false,
              },
            ];
          })
        ).values() // 중복제거 
      );

      // console.log('음식확인 ', items.foodList);
    } else {
      return null;
    }
    // console.log('아이템', items);
  }
};


// 체크여부 & 표시값 헬퍼 함수
//역할은 해당 키(key)가 Map 안에 존재하는지 확인하는 것.
// 1) 동일 음식 비교(공용)
const sameFood = (a, b) => {
  // DB 음식: id로 비교
  if (a?.foodDbId != null && b?.foodDbId != null) {
    return a.foodDbId === b.foodDbId;
  }
  // 커스텀 음식: 이름(+옵션으로 flag)로 비교
  if (a?.foodDbId == null && b?.foodDbId == null) {
    const an = (a?.foodName ?? '').trim().toLowerCase();
    const bn = (b?.foodName ?? '').trim().toLowerCase();
    const af = (a?.flag ?? '').trim().toLowerCase();
    const bf = (b?.flag ?? '').trim().toLowerCase();
    // 이름만 쓰면 동명이인 충돌 가능 → flag까지 붙여 충돌 완화
    return an === bn && af === bf;
  }
  // 한쪽만 null인 경우는 다른 출처로 간주
  return false;
};

// 2) 선택 여부
const isSelectedItem = (item) =>
  (selectedFoods.value ?? []).some(f => sameFood(f, item));

const displayAmount = (item) => {
  const sel = (selectedFoods.value ?? []).find(f => sameFood(f, item));
  return Number(sel?.amount ?? item?.amount ?? 0);
};

const displayKcal = (item) => {
  const sel = (selectedFoods.value ?? []).find(f => sameFood(f, item));
  return Number(sel?.kcal ?? item?.kcal ?? 0);
};

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
// const openSheet = (food) => {
//   const kcalPer100 = food.amount ? Math.round(food.kcal / (food.amount / 100)) : 0
  
//   clickFood.value = {
//     ...food,
//     _kcalPer100: kcalPer100,
//   }
//   // 이미 담아둔 값이 있으면 그 값으로 customFood 채우기
//   const saved = selectedValue.foodDbId
//   if (saved) {
//     customFood.value = {
//       ...saved,
//       _kcalPer100: kcalPer100, // 계산용 per100은 최신으로 유지
//     }
//   } else {
//     // 없으면 원본 food로 채우기
//     customFood.value = {
//       ...food,
//       _kcalPer100: kcalPer100,
//     }
//   }
//   sheetOpen.value = true
// }

// 유틸: 커스텀(유저) 음식인지
const isCustomFood = (f) => f?.foodDbId == null;

// openSheet에서 per100은 DB 음식에만 셋업
const openSheet = (food) => {
  const dbItem = !isCustomFood(food);

  // DB 음식이면 per100 역산 저장
  const kcalPer100 = dbItem && food.amount
    ? Math.round((food.kcal * 100) / food.amount)
    : 0;

  // 커스텀이면 perServing 저장(선택)
  const perServing = isCustomFood(food) ? {
    kcal: Number(food.kcal) || 0,
    protein: Number(food.protein) || 0,
    carbohydrate: Number(food.carbohydrate) || 0,
    fat: Number(food.fat) || 0,
    sugar: Number(food.sugar) || 0,
    natrium: Number(food.natrium) || 0,
  } : null;

  clickFood.value = {
    ...food,
    _kcalPer100: dbItem ? kcalPer100 : 0,
    _perServing: perServing,
  };
  const saved = (selectedFoods.value ?? []).find(f =>
    (f.foodDbId ?? null) === (food.foodDbId ?? null) && f.foodName === food.foodName
  );

  customFood.value = saved
    ? { ...saved, _kcalPer100: kcalPer100, _perServing: perServing }
    : { ...food, _kcalPer100: kcalPer100, _perServing: perServing };

  // 커스텀 음식은 기본 1회로 고정(또는 서빙 개수 입력 허용 시 1로 초기화)
  if (isCustomFood(customFood.value)) {
    customFood.value.amount = customFood.value.amount || 1;
  }

  sheetOpen.value = true;
};
// 양 변경 시 kcal 재계산
const recalc = () => {
  if (isCustomFood(clickFood.value)) {
    //  유저 음식: 1회 제공량 기준
    // - "고정 1회"라면 그대로 출력
    // - "서빙 개수"로 허용하고 싶다면 amount(서빙수)만큼 곱하기
    const servings = Number(customFood.value.amount) || 1; // 고정 1이면 1로 둠
    const ps = clickFood.value._perServing || {};

    // 고정 1회 출력만 원하면 아래를 모두 ps.xxx로 그대로 대입
    customFood.value.kcal = Math.round((ps.kcal || 0) * 100);
    customFood.value.protein = Math.round((ps.protein || 0) * servings);
    customFood.value.carbohydrate = Math.round((ps.carbohydrate || 0) * servings);
    customFood.value.fat = Math.round((ps.fat || 0) * servings);
    customFood.value.sugar = Math.round((ps.sugar || 0) * servings);
    customFood.value.natrium = Math.round((ps.natrium || 0) * servings);

  } else {
    //  DB 음식: 100g 기준
    const factor = (customFood.value.amount || 0) / 100;
    customFood.value.kcal = Math.round((clickFood.value._kcalPer100 || 0) * factor);
    customFood.value.protein = Math.round((clickFood.value.protein || 0) * factor);
    customFood.value.carbohydrate = Math.round((clickFood.value.carbohydrate || 0) * factor);
    customFood.value.fat = Math.round((clickFood.value.fat || 0) * factor);
    customFood.value.sugar = Math.round((clickFood.value.sugar || 0) * factor);
    customFood.value.natrium = Math.round((clickFood.value.natrium || 0) * factor);
  }
};
// + / - 버튼
const changeAmount = (delta) => {
  const next = Math.max(0, (Number(customFood.value.amount) || 0) + delta)
  customFood.value.amount = next;
  recalc();
}

//  [목록에 담기]
const addToList = () => {
  const modiFood = customFood.value;
  selectedFoods.value ??= []; // 배열 보정

  const payload = {
    foodDbId: modiFood.foodDbId,
    foodName: modiFood.foodName,
    amount: Number(modiFood.amount) || 0,
    kcal: Number(modiFood.kcal) || 0,
    flag: modiFood.flag,
    protein: Number(modiFood.protein) || 0,
    carbohydrate: Number(modiFood.carbohydrate) || 0,
    fat: Number(modiFood.fat) || 0,
    sugar: Number(modiFood.sugar) || 0,
    natrium: Number(modiFood.natrium) || 0,
  };

  const idx = (selectedFoods.value ?? []).findIndex(v => sameFood(v, modiFood));
  if (idx === -1) selectedFoods.value.push(payload);
  else selectedFoods.value[idx] = payload;

  sheetOpen.value = false;
};


// 체크 아이콘 전용 토글
// toggleSelect
const toggleSelect = (food) => {
  if (isSelectedItem(food)) {
    cancelFood(food);
  } else {
    openSheet(food);
  }
};

// cancelFood
const cancelFood = (food) => {
  const idx = (selectedFoods.value ?? []).findIndex(v => sameFood(v, food));
  if (idx > -1) selectedFoods.value.splice(idx, 1);
  sheetOpen.value = false;
};


//  확정 버튼 → 식단 저장 화면으로 이동
const goRecord = () => {

// const merged = [...selectedDay.selectedFoods.value, ...selectedFoods.value];
// const dedup = Array.from(
//   new Map(merged.map(f => [String(f.foodDbId ?? f.foodName), f])).values()
// );
// selectedDay.selectedFoods.value = dedup;


  router.push({
    name: 'MealRecordView', // 라우트 이름 그대로 사용
    query: {
      meal: route.query.meal || '', // 어떤 끼니에서 왔는지(옵션)
      recorded: '1', // 기록 완료 신호(옵션)
    },
  
  });
};


//직접입력 페이지


//커스텀 입력 클릭시 
const customSheet = ref(false);

const customAddToList = (payload) => {
  // payload: { name, unit, kcal, carb, protein, fat, sugar, na }
  selectedFoods.value.push({
    foodDbId: payload.foodDbId,
    foodName: payload.foodName,
    kcal: payload.kcal,
    flag: payload.flag,
    protein: payload.protein,
    carbohydrate: payload.carbohydrate,
    fat: payload.fat,
    sugar: payload.sugar,
    natrium: payload.natrium,
    amount: payload.amount,
    
  });
  console.log('자유입력 결과', payload);
};

const frameEl = ref(null); // 모달을 붙일 프레임
</script>

<template>
  <div class="wrap wrap-top" ref="frameEl">

    <div class="d-flex flex-column">
      <span class="otd-title">무슨 음식을 <br />먹었나요?</span>
      <!-- <input v-model="keyword" placeholder="음식명 입력" class="search-input otd-border " /> -->
      <img class="custom-add align-self-end mt-2" src="/image/meal/custom_add.png" alt="직접 등록"
        @click="customSheet=true">
    </div>
    <v-text-field placeholder="음식명 입력" class="search-input otd-top-margin" v-model="keyword" :items="items.foodList"
      item-title="foodName" item-value="foodDbId" variant="outlined" rounded="xl" density="comfortable" clearable
      @update:model-value="onFoodNameInput" @keyup.enter.prevent="searchFoodName(keyword)">
      <template #append-inner>
        <v-icon class="mr-2" @click="searchFoodName(keyword)">mdi-magnify</v-icon>
      </template>
    </v-text-field>

    <!-- 리스트 -->
    <div class="food-list otd-top-margin">
      <div v-for="food in items.foodList" :key="food.foodDbId" class="food-item" @click="openSheet(food)">
        <div class="otd-body-2 d-flex flex-column">
          <span>{{ food.foodName }}</span>
          <span>{{ displayAmount(food) }}</span> <!-- 선택되면 selected.amount -->
        </div>
        <div class="d-flex align-center">
          <span class="mr-2">{{ displayKcal(food) }} kcal</span>
          <img class="check" :src="isSelectedItem(food) ? checkOn : checkOff"
            :alt="isSelectedItem(food) ? 'Checked' : 'Default'" @click.stop="toggleSelect(food)" />
        </div>
      </div>
    </div>
    <v-dialog v-model="sheetOpen" transition="dialog-bottom-transition" :scrim="true" :persistent="true"
      :contained="false" content-class="otd-sheet" @click:outside="sheetOpen = false">
      <div class="sheet-card">
        <!-- 핸들바 -->
        <div class="sheet-handle" @click="sheetOpen = false" />

        <!-- 제목 -->
        <div class="sheet-title">
          {{ customFood.foodName }}
        </div>

        <!-- 영양 간단 피ills (필요 없으면 v-if 지우기) -->
        <div class="pill-row">
          <div class="pill pill-carb"><span class="badge">탄</span> {{ Math.ceil((customFood.carbohydrate )) }} {{
            customFood.flag }}</div>
          <div class="pill pill-protein"><span class="badge">단</span> {{ Math.ceil((customFood.protein)) }} {{
            customFood.flag }}</div>
          <div class="pill pill-fat"><span class="badge">지</span> {{ Math.ceil((customFood.fat)) }} {{ customFood.flag
            }}</div>
        </div>

        <!-- kcal 카드 -->
        <div class="kcal-card">
          <span class="kcal-label"></span>
          <div class="kcal-value "><strong>{{ customFood.kcal }}</strong> kcal</div>
        </div>

        <!-- 수량 스텝퍼 -->
        <div class="stepper">
          <v-btn icon variant="flat" class="step-btn" @click="changeAmount(-10)">
            <v-icon>mdi-minus</v-icon>
          </v-btn>

          <v-text-field v-model.number="customFood.amount" type="number" :min="isCustomFood(customFood) ? 1 : 0"
            variant="outlined" density="comfortable" class="amount-field" hide-details
            
            :suffix="isCustomFood(customFood) ? '회' : 'g'"
            @update:model-value="recalc"
            />

            <v-btn icon variant="flat" class="step-btn" @click="changeAmount(10)">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
        </div>

        <!-- 액션 버튼 -->
        <div class="actions">
          <v-btn variant="outlined" class="btn-outline" @click="sheetOpen = false">음식 상세</v-btn>
          <v-btn class="btn-primary" @click="addToList">목록에 담기</v-btn>
        </div>

        <!-- 
        <div class="layout-frame" >
          <MealCustomFood v-model:open="customSheet"  @submit="customAddToList" />
        </div> -->
      </div>
    </v-dialog>

    <!-- 커스텀 데이터 입력 부분 -->
    <div class="layout-frame" ref="modal-root">
      <MealCustomFood v-model:open="customSheet" @submit="customAddToList" />
    </div>
    <!-- 하단 확정 버튼(선택개수 표시용) -->
    <button class="otd-button confirm-btn" :disabled="(selectedFoods?.length ?? 0) === 0" @click="goRecord">
      {{ selectedFoods?.length ?? 0 }} 개 담았어요
    </button>
  </div>
</template>

<style scoped>

.layout-frame {
  position: static;
  width: 100%;
  max-width: none;
  overflow: visible;
}
.layout-frame :deep(.otd-sheet){ position:absolute !important; bottom:-24px !important; }
.layout-frame :deep(.backdrop){ position:absolute !important; }



.custom-add
{width: 88px;
height: 22px;}

.wrap-top
{
  margin-top: 30px !important;
}

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
  position: fixed !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  top: auto !important;
  margin: 0 !important;
  width: 100vw !important;
  max-width: none !important;
  transform: none !important;
  /* 가운데 정렬 변환 제거 */
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}

/* 스크림도 프레임 안에서만 */
:deep(.otd-scrim) {
   width: 100% !important;
  backdrop-filter: blur(1px);
  background: rgba(0, 0, 0, .35);
}

/* 카드 크기는 그대로 */
.sheet-card {
  background-color: #ffffff;
  width: 100%;
  margin: 0;
  padding: 24px;
  
  justify-items: center;
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
/* 고정폭 지우기 */
.kcal-card {
  width: 100%;
  min-width: 0;
  
  /* 기존 min-width:390px 제거 */
}

.kcal-label {
  
  color: #7a7a7a;
  font-size: 14px;
 
}

.kcal-value {
   justify-self: center;
  font-size: 22px;
  color: #222;
}
/* 리스트 카드도 화면에 맞게 */
.food-item {
  width: 100% !important;
  /* 기존 350px 제거 */
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
  margin-bottom: 15px;
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
