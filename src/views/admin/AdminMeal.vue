<script setup>
import { ref, onMounted } from 'vue';
import {
  getMeals,
  postMeal,
  putMeal,
  deleteMeal,
  deleteMealMake,
} from '@/services/admin/adminService';

const mealFoodDbs = ref([]);
const mealFoodMakeDbs = ref([]);

const totalPages = ref(0);
const currentPage = ref(0);
const keyword = ref('');
const size = 10;

// 추가/수정 모달 상태
const editDialog = ref(false);
const isEdit = ref(false);
const editMeal = ref({
  foodDbId: null,
  foodName: '',
  flag: '',
  kcal: 0,
  protein: 0,
  carbohydrate: 0,
  fat: 0,
  sugar: 0,
  natrium: 0,
  foodCapacity: 0,
});

// 삭제 모달
const deleteDialog = ref(false);
const deleteTarget = ref(null);
const deleteType = ref('db'); // "db" (공식) / "make" (사용자)

// 공식 DB 헤더
const headersDb = [
  { title: 'ID', key: 'foodDbId' },
  { title: '이름', key: 'foodName' },
  { title: 'FLAG', key: 'flag' },
  { title: '칼로리', key: 'kcal' },
  { title: '탄수화물', key: 'carbohydrate' },
  { title: '단백질', key: 'protein' },
  { title: '지방', key: 'fat' },
  { title: '당', key: 'sugar' },
  { title: '나트륨', key: 'natrium' },
  { title: '용량', key: 'foodCapacity' },
  { title: '관리', key: 'setting', sortable: false },
];

// 사용자 커스텀 DB 헤더
const headersMake = [
  { title: 'ID', key: 'userFoodId' },
  { title: '유저ID', key: 'userId' },
  { title: '이름', key: 'foodName' },
  { title: '칼로리', key: 'kcal' },
  { title: '탄수화물', key: 'carbohydrate' },
  { title: '단백질', key: 'protein' },
  { title: '지방', key: 'fat' },
  { title: '당', key: 'sugar' },
  { title: '나트륨', key: 'natrium' },
  { title: '단위', key: 'flag' },
  { title: '관리', key: 'setting', sortable: false },
];

// 데이터 불러오기
const loadMeals = async (page = 0) => {
  try {
    const res = await getMeals(page, size, keyword.value);
    mealFoodDbs.value = res.data.mealFoodDbs.content;
    totalPages.value = res.data.mealFoodDbs.totalPages;
    currentPage.value = res.data.mealFoodDbs.number;
    mealFoodMakeDbs.value = res.data.mealFoodMakeDbs;
  } catch (e) {
    console.error('식단 데이터 불러오기 실패:', e);
  }
};

// 검색
const searchMeals = () => {
  loadMeals(0);
};

// 추가/수정 모달 열기
const openForm = (meal = null) => {
  if (meal) {
    isEdit.value = true;
    editMeal.value = { ...meal };
  } else {
    isEdit.value = false;
    editMeal.value = {
      foodDbId: null,
      foodName: '',
      flag: '',
      kcal: 0,
      protein: 0,
      carbohydrate: 0,
      fat: 0,
      sugar: 0,
      natrium: 0,
      foodCapacity: 0,
    };
  }
  editDialog.value = true;
};

// 저장 (추가 or 수정)
const saveMeal = async () => {
  try {
    if (isEdit.value) {
      await putMeal(editMeal.value.foodDbId, editMeal.value);
    } else {
      await postMeal(editMeal.value);
    }
    editDialog.value = false;
    loadMeals(currentPage.value);
  } catch (e) {
    console.error('저장 실패:', e);
    alert('저장 중 오류 발생');
  }
};

// 삭제 모달 열기
const openDelete = (meal, type = 'db') => {
  deleteTarget.value = meal;
  deleteType.value = type;
  deleteDialog.value = true;
};

// 삭제 실행
const removeMeal = async () => {
  try {
    if (deleteType.value === 'db') {
      await deleteMeal(deleteTarget.value.foodDbId);
    } else {
      await deleteMealMake(deleteTarget.value.userFoodId);
    }
    loadMeals(currentPage.value);
  } catch (e) {
    console.error('삭제 실패:', e);
    alert('삭제 중 오류 발생');
  }
  deleteDialog.value = false;
};

onMounted(() => {
  loadMeals();
});
</script>

<template>
  <div class="meal-admin">
    <!-- 공식 DB -->
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="title">공식 식품</span>
        <div class="d-flex align-center search" style="gap: 12px">
          <v-text-field
            v-model="keyword"
            label="검색 (음식명)"
            prepend-inner-icon="mdi-magnify"
            density="compact"
            hide-details
            single-line
            variant="outlined"
            style="max-width: 450px"
            @keyup.enter="searchMeals"
          />
          <v-btn @click="searchMeals">검색</v-btn>
          <v-btn @click="openForm()">➕ 음식 추가</v-btn>
        </div>
      </v-card-title>

      <v-data-table
        :headers="headersDb"
        :items="mealFoodDbs"
        :items-per-page="size"
        :page="currentPage + 1"
        class="styled-table"
      >
        <template #item.flag="{ item }">
          <v-chip
            small
            :color="
              item.flag === 'g'
                ? 'green'
                : item.flag === 'ml'
                ? 'orange'
                : 'blue'
            "
            text-color="white"
          >
            {{ item.flag }}
          </v-chip>
        </template>
        <template #item.setting="{ item }">
          <v-btn @click="openForm(item)">수정</v-btn>
          <v-btn @click="openDelete(item, 'db')">삭제</v-btn>
        </template>
      </v-data-table>

      <div class="pagination">
        <v-btn
          :disabled="currentPage === 0"
          @click="loadMeals(currentPage - 1)"
        >
          이전
        </v-btn>
        <span>{{ currentPage + 1 }} / {{ totalPages }}</span>
        <v-btn
          :disabled="currentPage + 1 >= totalPages"
          @click="loadMeals(currentPage + 1)"
        >
          다음
        </v-btn>
      </div>
    </v-card>
    <br />
    <!-- 사용자 커스텀 DB -->
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="title">사용자 커스텀 식품</span>
      </v-card-title>
      <v-data-table
        :headers="headersMake"
        :items="mealFoodMakeDbs"
        :items-per-page="10"
        class="styled-table"
        fixed-header
      >
        <template #item.flag="{ item }">
          <v-chip
            small
            :color="
              item.flag === 'g'
                ? 'green'
                : item.flag === 'ml'
                ? 'orange'
                : 'blue'
            "
            text-color="white"
          >
            {{ item.flag }}
          </v-chip>
        </template>
        <template #item.setting="{ item }">
          <v-btn @click="openDelete(item, 'make')">삭제</v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- 추가/수정 모달 -->
    <v-dialog v-model="editDialog" max-width="600">
      <v-card>
        <v-card-title>{{ isEdit ? '음식 수정' : '새 음식 추가' }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="editMeal.foodName" label="이름" />
          <v-text-field v-model="editMeal.flag" label="FLAG" />
          <v-text-field
            v-model.number="editMeal.kcal"
            label="칼로리"
            type="number"
          />
          <v-text-field
            v-model.number="editMeal.carbohydrate"
            label="탄수화물"
            type="number"
          />
          <v-text-field
            v-model.number="editMeal.protein"
            label="단백질"
            type="number"
          />
          <v-text-field
            v-model.number="editMeal.fat"
            label="지방"
            type="number"
          />
          <v-text-field
            v-model.number="editMeal.sugar"
            label="당"
            type="number"
          />
          <v-text-field
            v-model.number="editMeal.natrium"
            label="나트륨"
            type="number"
          />
          <v-text-field
            v-model.number="editMeal.foodCapacity"
            label="용량(g)"
            type="number"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="editDialog = false">취소</v-btn>
          <v-btn color="primary" @click="saveMeal">저장</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 삭제 모달 -->
    <v-dialog v-model="deleteDialog" max-width="380">
      <v-card>
        <v-card-text>
          정말 <strong>{{ deleteTarget?.foodName }}</strong> 을(를)
          삭제하시겠습니까?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="error" text @click="removeMeal">네</v-btn>
          <v-btn text @click="deleteDialog = false">아니오</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style lang="scss" scoped>
.meal-admin {
  padding: 20px;

  .title {
    font-weight: 700;
    font-size: 18px;
  }

  .styled-table {
    :deep(td),
    :deep(th) {
      // text-align: center !important;
      vertical-align: middle;
    }
  }

  .search {
    width: 50%;
  }

  .pagination {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin: 16px 0;
  }
}
</style>
