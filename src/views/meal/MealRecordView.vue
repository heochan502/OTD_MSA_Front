<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {storeToRefs} from 'pinia';

import{ postMealRecord }from '@/services/meal/mealService.js';

import { useMealSelectedStore } from '@/stores/meal/mealStore.js';

//모달창
import Modal from '@/components/user/Modal.vue'
import { result } from 'lodash';

// const selectedFoods = useMealSelectedStore();
const store = useMealSelectedStore();
const { selectedFoods } = storeToRefs(store);   // Ref<Food[]>


const BASE = import.meta.env.BASE_URL || '/';
const route = useRoute();
const router = useRouter();

// 전달된 음식 목록
// const foods = selectedFoods.selectedFoods.value ;
// ✅ 합계들
const foods = computed(() => selectedFoods.value ?? []); // null 방어
// const foods =
//   Array.isArray(selectedFoods?.selectedFoods?.value)
//     ? selectedFoods.selectedFoods.value
//     : Object.values(selectedFoods?.selectedFoods?.value ?? {}); // ✅ null/undefined 방어

// 합계 kcal & 개수
// const totalKcal = computed(() => foods.selectedFood.value.reduce((sum, food) => sum + (foof.kcal || 0), 0));
// const foodCount = computed(() => foods.value.length);

// const totalKcal = foods.reduce((sum, food) => sum + (Number(food.kcal) || 0), 0);
const foodCount = foods.value?.length || 0;

const totalKcal = computed(() =>
  foods.value.reduce((sum, food) => sum + (Number(food.kcal) || 0), 0)
);
const totalCarb = computed(() =>
  foods.value.reduce((sum, food) => sum + (Number(food.carbohydrate) || 0), 0)
);
const totalFat = computed(() =>
  foods.value.reduce((sum, food) => sum + (Number(food.fat) || 0), 0)
);
const totalProtein = computed(() =>
  foods.value.reduce((sum, food) => sum + (Number(food.protein) || 0), 0)
);

// const foodCount =0;
// const totalKcal =0;
// const totalCarb=0;
// const totalFat=0;
// const totalProtein=0;

// 식사 아이콘 (아침/점심/저녁 매핑)
// 만약 값이 없으면 기본값은 점시으로 들어간다
const mealKey = (route.query.meal || '점심').toString();
const mealIconMap = { 아침: 'breakfast', 점심: 'lunch', 저녁: 'dinner' };
const mealImg = (name) => `${BASE}image/meal/${name}.png`;
const mealIcon = computed(() => mealImg(mealIconMap[mealKey] || 'lunch'));

// 삭제
const removeFood = (index) => foods.value.splice(index, 1);

// 매크로 g
const grams = reactive({ carb: 28.5, protein: 53.2, fat: 45.9 });

// g → % (막대 폭)
const macroPct = computed(() => {
  const carb = Number(totalCarb.value) * 4 || 0;
  const protein = Number(totalProtein.value) * 4 || 0;
  const fat = Number(totalFat.value) * 9 || 0;

  const sum = carb + protein + fat || 0;

  if (sum <= 0) return { carb: 0, protein: 0, fat: 0 };

  const modiCarb = Math.round((carb / sum) * 100);
  const modiProtein = Math.round((protein / sum) * 100);
  const modiFat = Math.max(0, 100 - modiCarb - modiProtein); // 반올림 오차 보정

  return { carb: modiCarb, protein: modiProtein, fat: modiFat };
});

onMounted(async () => {
  // console.log('피니아 데이터',foods.value);
//   console.log('토탕', selectedFoods);
//   console.log('isArray?', Array.isArray(selectedFoods.value))     // true여야 함
// console.log('has reduce?', typeof selectedFoods.value?.reduce)  // 'function'이어야 함
});

const clickAddFood = () => {
  router.push({
    name: 'MealFoodSearchView',
    query: { meal: route.query.meal },
  });
};

const inputdata=(async() => {
//   console.log('입력 데이터', foods.value);
//   console.log('입력 데이터 시간대 ', store.selectedDay.setTime);
//   console.log('입력 데이터 날짜 ', store.selectedDay.setDay);
  
const res = await postMealRecord({
    mealTime : store.selectedDay.setTime,   // 끼니
    mealDay : store.selectedDay.setDay,    // 날짜
    foods : foods.value                     // 음식들
  });
  // console.log('입력 데이터', res);
  if (res.savedCount > 0) {
    openResultModal(true);
  } 
  else if (res.savedCount === -1)
  {
    resultModal.modify= true;
    openResultModal(true);

  }
  else {
    openResultModal(false);
  }
  // if (res.savedCount > 0) {
  //   alert('식단이 성공적으로 기록되었습니다.');
  //   // 기록 후 초기화
  //   selectedFoods.value = [];
  //   router.push({ name: 'MealMainView' });
  // } else {
  //   alert('식단 기록에 실패했습니다. 다시 시도해주세요.');
  // }
});

// 모달 상태


const resultModal = ref({
  open: false,
  success: false,
  title: '',
  message: '',
  modify: false,     // 수정 플래그 유지
})

//  모달 열기



const openResultModal = (success, opts = { modify: resultModal.modify }) => {
  // 기존 객체를 유지한 채 필요한 필드만 갱신(reactivity 안전)
  resultModal.value.modify = !!opts.modify
  resultModal.value.success = !!success
  resultModal.value.title = success
    ? (resultModal.value.modify ? '수정 성공' : '기록 성공')
    : '기록 실패'
  resultModal.value.message = success
    ? (resultModal.value.modify ? '식단이 성공적으로 수정되었어요.' : '식단이 성공적으로 기록되었어요.')
    : '식단 기록에 실패했어요. 다시 시도해주세요.'
  resultModal.value.open = true
}

// 모달 닫기(성공 시 초기화 + 이동)
function closeResultModal() {
  const wasSuccess = resultModal.value.success
  resultModal.value.open = false

  if (wasSuccess) {
    selectedFoods.value = []
    router.push({ name: 'MealMainView' })
  }
}


// const resultModal = ref({
//   open: false,
//   success: false,
//   title: '',
//   message: '',
//   modify : false,
// });

// // 모달 열기
// function openResultModal(success) {
//   resultModal.value = {
//     open: true,
//     success,
//     title: success ? (resultModal.modify ? '수정 성공': '기록 성공' ) : '기록 실패',
//     message: success
//       ? (resultModal.modify ? '식단이 성공적으로 수정되었어요.' : '식단이 성공적으로 기록되었어요.')
//       : '식단 기록에 실패했어요. 다시 시도해주세요.',
//   };
// }

// // 모달 닫기(성공 시 초기화 + 이동)
// function closeResultModal() {
//   resultModal.value.open = false;
//   if (resultModal.value.success) {
//     selectedFoods.value = [];
//     router.push({ name: 'MealMainView' });
//   }
// }


</script>

<template>
  <div class="page">
    <div class="wrap warp-top">
      <!-- 상단 카테고리 -->
      <span class="otd-category d-flex align-center justify-center">
        <img class="meal-img" :src="mealIcon" alt="먹은 시간" />
        <span class="title">{{ mealKey }} 기록</span>
        <span class="count-badge">{{ foodCount }}개</span>
      </span>

      <!-- 총 칼로리 -->
      <div class="total-kcal">총 {{ totalKcal }}kcal</div>

      <!-- 매크로 바 -->
      <div class="bars">
        <div class="bar" :style="{ width: macroPct.carb + '%' }">
          <div class="fill carb"></div>
        </div>
        <div class="bar" :style="{ width: macroPct.protein + '%' }">
          <div class="fill protein"></div>
        </div>
        <div class="bar" :style="{ width: macroPct.fat + '%' }">
          <div class="fill fat"></div>
        </div>
      </div>

      <!-- % 표기 -->
      <div class="grams">
        <div class="g">
          <span class="dot carb"></span>순탄수 {{ macroPct.carb }}%
        </div>
        <div class="g">
          <span class="dot protein"></span>단백질 {{ macroPct.protein }}%
        </div>
        <div class="g"><span class="dot fat"></span>지방 {{ macroPct.fat }}%</div>
      </div>

      <!-- 음식 리스트 -->
      <div class="food-list otd-top-margin">
        <div v-for="(food, idx) in foods" :key="food.name" class="food-item">
          <div class="fi-left">
            <div class="fi-name">{{ food.foodName }}</div>
            <div class="fi-amount">{{ food.amount }}</div>
          </div>
          <div class="fi-right">
            <span class="fi-kcal">{{ food.kcal }} kcal</span>
            <button class="remove-btn" @click="removeFood(idx)">✕</button>
          </div>
        </div>
      </div>

      <!-- 버튼 -->
      <div class="btn-group otd-top-margin">
        <button class="otd-button add-btn" @click="clickAddFood">
          음식 추가
        </button>
        <button class="otd-button complete-btn" @click="inputdata">식단 기록 완료</button>
      </div>
    </div>
  </div>
  <!-- 모달창  -->
  <Modal :show="resultModal.open" :title="resultModal.title" :message="resultModal.message"
    :type="resultModal.success ? 'success' : 'error'" 
    confirm-text="확인"
    @confirm="closeResultModal"
    @close="closeResultModal"
    />
    <!-- <v-dialog v-model="resultModal.open" width="320" :scrim="true">
    <v-card class="pa-4 rounded-xl">
      <div class="d-flex align-center mb-2">
        <v-icon :color="resultModal.success ? 'teal' : 'red'">
          {{ resultModal.success ? 'mdi-check-circle' : 'mdi-alert-circle' }}
        </v-icon>
        <div class="ml-2 text-subtitle-1 font-weight-bold">
          {{ resultModal.title }}
        </div>
      </div>

      <div class="text-body-2 mb-4">
        {{ resultModal.message }}
      </div>

      <div class="d-flex justify-end">
        <v-btn  class="btn-confirm" @click="closeResultModal">
          확인
        </v-btn>
      </div>
    </v-card>
  </v-dialog> -->


</template>

<style scoped>
/* 페이지 배경 */
.page {
}

.meal-img {
  height: 32px;
  width: 32px;
  margin-right: 6px;
}
.warp-top {
  margin-top: 20px !important;
}

.otd-category {
  display: flex;
  align-items: center;
  gap: 6px;
}
.otd-category .title {
  font-size: 18px;
  font-weight: 700;
}
.count-badge {
  margin-left: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: #efefef;
  font-weight: 700;
  font-size: 12px;
}

/* 총 칼로리 */
.total-kcal {
  margin-top: 16px;
  font-size: 24px;
  font-weight: 800;
}

/* 매크로 바 */
.bars {
  display: flex;
  gap: 8px;
  align-items: center;
}

.bar {
  height: 14px;
  max-width: 100%;
  background: transparent;
  /* 회색 트랙 제거 */
  border-radius: 999px;
  overflow: hidden;
}

.fill {
  width: 100%;
  /* 바 내부는 항상 꽉 채움 */
  height: 100%;
  border-radius: inherit;
}
.carb {
  background: #ffb44d;
}
.protein {
  background: #a4db67;
}
.fat {
  background: #7fb8ff;
}

/* g 표기 */
.grams {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  color: #444;
  font-size: 14px;
  justify-content: space-between;
}
.g {
  display: flex;
  align-items: center;
  gap: 6px;
}
.dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.dot.carb {
  background: #ffb44d;
}
.dot.protein {
  background: #a4db67;
}
.dot.fat {
  background: #7fb8ff;
}

/* 음식 리스트: 구분선 스타일 */
.food-list {
  margin-top: 16px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
}
.food-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
}
.food-item:last-child {
  border-bottom: none;
}
.fi-left {
  display: flex;
  flex-direction: column;
}
.fi-name {
  font-weight: 700;
}
.fi-amount {
  font-size: 12px;
  color: #777;
  margin-top: 2px;
}
.fi-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.fi-kcal {
  font-weight: 700;
}
.remove-btn {
  border: none;
  background: none;
  cursor: pointer;
  color: #999;
  font-size: 16px;
  line-height: 1;
}

/* 버튼들 */
.btn-group {
  display: flex;
  gap: 12px;
  margin-top: 18px;
}
.otd-button {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
}
.add-btn {
  background: #ffe864;
  color: #303030;
}
.complete-btn {
  background: #3b3b3b;
  color: #fff;
}

/* 모달 버튼 */
.btn-confirm {
  background: #00D5DF !important;
  /* 원하는 색으로 바꿔도 됨 */
  color: #fff !important;
  border-radius: 12px;
  box-shadow: none;
}

.btn-confirm:hover {
  filter: brightness(0.95);
}

.btn-confirm:active {
  transform: translateY(1px);
}
</style>
