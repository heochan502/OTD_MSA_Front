<script setup>
import { ref, computed, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import { getFood } from '@/services/meal/mealService';

const router = useRouter();
const route = useRoute();
const keyword = ref(null);
const selected = ref([]);

const items = reactive({
  foodList: [],
});

const searchFoodName = async (keyword) => {
  console.log('이게왜', keyword);

  const res = await getFood(keyword);

  // console.log(" 이름 : ", res);
  // 데이터 넣는곳
  if (Array.isArray(res)) {
    // null이 아닐떄만 아래 실행
    if (keyword) {
      // console.log('널확인 ', searchFood.foodName);

      items.foodList = res.map((item) => ({
        foodDbId: item.foodDbId,
        foodName: item.foodName,
        calorie: item.kcal,
      }  ));
      console.log('음식확인 ', items.foodList);
    } else {
      return null;
    }
    // console.log('아이템', items);
  }
};

// 예시 음식 데이터
const foods = [
  { name: '초코빵', amount: '80g', kcal: 120 },
  { name: '초코', amount: '10g', kcal: 40 },
  { name: '초코비 초코우유', amount: '180ml', kcal: 170 },
];

const toggleSelect = (food) => {
  const idx = selected.value.findIndex((f) => f.name === food.name);
  if (idx === -1) selected.value.push(food);
  else selected.value.splice(idx, 1);
};


const menuOpen = ref(false);
//데이터 입력 받고 정리 하는곳
const itemList = ref([]);
// 음식이름 드랍박스용
const foodNameBox = ref(null);

const onFoodNameInput = async () => {
  searchFood.foodName = '';
  // items.foodList = [];
  await forceOpenDropdown();
};

const forceOpenDropdown = () => {
  setTimeout(() => {
    nameBox.value.isMenuActive = true;
  }, 50);
};


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
</script>

<template>
  <div class="wrap">
    <span class="otd-title">무슨 음식을 먹었나요?</span>
    <!-- <input v-model="keyword" placeholder="음식명 입력" class="search-input otd-border " /> -->

    <v-combobox
      placeholder="음식명 입력"
      class="search-input otd-top-margin"
      v-model="keyword"
      v-model:menu="menuOpen"
      :items="items.foodList"
      item-title="foodName"      
      variant="outlined"
      rounded="xl"
      density="comfortable"
      clearable
      @keyup.enter.prevent="searchFoodName(keyword)"
    >
      <template #append-inner>
        <v-icon class="mr-2" @click="searchFoodName(keyword)">mdi-magnify</v-icon>
      </template>
    </v-combobox>

    <div class="food-list otd-top-margin">
      <div
        v-for="food in foods"
        :key="food.name"
        class="food-item"
        @click="toggleSelect(food)"
      >
        <div class="otd-body-2">{{ food.name }} {{ food.amount }}</div>
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
/* 둥근 필 & 연한 테두리 */ /* 기본 모양: 둥근 + 흰 배경, 이중 테두리 금지(여기서 border 주지 않음!) */
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
