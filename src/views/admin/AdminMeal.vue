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

const successDialog = ref(false);
const cancelDialog = ref(false);

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
  { title: '칼로리', key: 'kcal' },
  { title: '탄수화물', key: 'carbohydrate' },
  { title: '단백질', key: 'protein' },
  { title: '지방', key: 'fat' },
  { title: '당', key: 'sugar' },
  { title: '나트륨', key: 'natrium' },
  { title: '용량', key: 'foodCapacity' },
  { title: '단위', key: 'flag' },
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
    successDialog.value = true;
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
    successDialog.value = true;
    deleteDialog.value = false;
    loadMeals(currentPage.value);
  } catch (e) {
    console.error('삭제 실패:', e);
    alert('삭제 중 오류 발생');
  }
};

// 수정, 추가 취소 모달
const cancel = () => {
  cancelDialog.value = false;
  editDialog.value = false;
};

onMounted(() => {
  loadMeals();
});
</script>

<template>
  <div class="admin-meal">
    <!-- 공식 DB -->
    <v-card class="data-card pa-2">
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="title">공식 식품 관리</span>
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
          <v-btn @click="openForm()">➕ 식품 추가</v-btn>
        </div>
      </v-card-title>

      <v-data-table
        :headers="headersDb"
        :items="mealFoodDbs"
        :items-per-page="size"
        :page="currentPage + 1"
        hide-default-footer
        class="styled-table"
      >
        <template #item.kcal="{ item }"
          >{{ item.kcal.toLocaleString() }}kcal</template
        >
        <template #item.carbohydrate="{ item }"
          >{{ item.carbohydrate.toLocaleString() }}g</template
        >
        <template #item.protein="{ item }"
          >{{ item.protein.toLocaleString() }}g</template
        >
        <template #item.fat="{ item }"
          >{{ item.fat.toLocaleString() }}g</template
        >
        <template #item.natrium="{ item }"
          >{{ item.natrium.toLocaleString() }}mg</template
        >
        <template #item.sugar="{ item }"
          >{{ item.sugar.toLocaleString() }}g</template
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

      <!-- Pagination -->
      <div class="pagination">
        <v-btn
          class="page-btn"
          :disabled="currentPage === 0"
          variant="tonal"
          prepend-icon="mdi-chevron-left"
          @click="loadMeals(currentPage - 1)"
        >
          이전
        </v-btn>

        <div class="page-info">
          <span class="current">{{ currentPage + 1 }}</span>
          <span class="divider">/</span>
          <span class="total">{{ totalPages }}</span>
        </div>

        <v-btn
          class="page-btn"
          :disabled="currentPage + 1 >= totalPages"
          variant="tonal"
          append-icon="mdi-chevron-right"
          @click="loadMeals(currentPage + 1)"
        >
          다음
        </v-btn>
      </div>
    </v-card>
    <br />
    <!-- 사용자 커스텀 DB -->
    <v-card class="data-card pa-2">
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="title">사용자 커스텀 식품 관리</span>
      </v-card-title>
      <v-data-table
        :headers="headersMake"
        :items="mealFoodMakeDbs"
        :items-per-page="10"
        class="styled-table"
        fixed-header
      >
        <template #item.kcal="{ item }"
          >{{ item.kcal.toLocaleString() }}kcal</template
        >
        <template #item.carbohydrate="{ item }"
          >{{ item.carbohydrate.toLocaleString() }}g</template
        >
        <template #item.protein="{ item }"
          >{{ item.protein.toLocaleString() }}g</template
        >
        <template #item.fat="{ item }"
          >{{ item.fat.toLocaleString() }}g</template
        >
        <template #item.natrium="{ item }"
          >{{ item.natrium.toLocaleString() }}mg</template
        >
        <template #item.sugar="{ item }"
          >{{ item.sugar.toLocaleString() }}g</template
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
      <v-card class="admin-dialog pa-6">
        <!-- 제목 -->
        <v-card-title class="dialog-title mb-4">
          {{ isEdit ? '식품 수정' : '식품 추가' }}
        </v-card-title>

        <v-container fluid>
          <v-row dense>
            <v-col cols="6">
              <v-card-subtitle class="field-label">이름</v-card-subtitle>
              <v-text-field
                v-model="editMeal.foodName"
                class="field-input"
                placeholder="음식 이름 입력"
              />
            </v-col>

            <v-col cols="6">
              <v-card-subtitle class="field-label">단위</v-card-subtitle>
              <v-text-field
                v-model="editMeal.flag"
                class="field-input"
                placeholder="g, ml"
              />
            </v-col>

            <v-col cols="6">
              <v-card-subtitle class="field-label"
                >칼로리(kcal)</v-card-subtitle
              >
              <v-text-field
                v-model.number="editMeal.kcal"
                class="field-input"
                type="number"
                placeholder="예: 120"
              />
            </v-col>

            <v-col cols="6">
              <v-card-subtitle class="field-label">탄수화물(g)</v-card-subtitle>
              <v-text-field
                v-model.number="editMeal.carbohydrate"
                class="field-input"
                type="number"
                placeholder="예: 12.5"
              />
            </v-col>

            <v-col cols="6">
              <v-card-subtitle class="field-label">단백질(g)</v-card-subtitle>
              <v-text-field
                v-model.number="editMeal.protein"
                class="field-input"
                type="number"
                placeholder="예: 5.2"
              />
            </v-col>

            <v-col cols="6">
              <v-card-subtitle class="field-label">지방(g)</v-card-subtitle>
              <v-text-field
                v-model.number="editMeal.fat"
                class="field-input"
                type="number"
                placeholder="예: 3.1"
              />
            </v-col>

            <v-col cols="6">
              <v-card-subtitle class="field-label">당(g)</v-card-subtitle>
              <v-text-field
                v-model.number="editMeal.sugar"
                class="field-input"
                type="number"
                placeholder="예: 2.8"
              />
            </v-col>

            <v-col cols="6">
              <v-card-subtitle class="field-label">나트륨(mg)</v-card-subtitle>
              <v-text-field
                v-model.number="editMeal.natrium"
                class="field-input"
                type="number"
                placeholder="예: 125"
              />
            </v-col>

            <v-col cols="6">
              <v-card-subtitle class="field-label">용량(g)</v-card-subtitle>
              <v-text-field
                v-model.number="editMeal.foodCapacity"
                class="field-input"
                type="number"
                placeholder="예: 100"
              />
            </v-col>
          </v-row>
        </v-container>

        <v-divider class="my-2" />
        <v-card-actions class="justify-end btn-area">
          <v-btn class="btn-no" @click="cancelDialog = true">취소</v-btn>
          <v-btn class="btn-yes" @click="saveMeal">저장</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 삭제 모달 -->
    <v-dialog v-model="deleteDialog" max-width="380">
      <v-card class="admin-dialog pa-6">
        <v-card-text>
          정말 <strong>{{ deleteTarget?.foodName }}</strong> 을(를)
          삭제하시겠습니까?
        </v-card-text>
        <v-card-actions class="justify-end btn-area">
          <v-btn class="btn-yes" @click="removeMeal">네</v-btn>
          <v-btn class="btn-no" @click="deleteDialog = false">아니오</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 수정 / 저장 완료 모달 -->
    <v-dialog v-model="successDialog" max-width="380" min-height="100">
      <v-card class="admin-dialog pa-6">
        <v-card-text> 성공적으로 완료되었습니다. </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn class="btn-yes" text @click="successDialog = false"
            >확인</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 취소 모달 -->
    <v-dialog v-model="cancelDialog" max-width="380" min-height="100">
      <v-card class="admin-dialog pa-6">
        <v-card-text>
          취소하고 돌아가시겠습니까?
          <br />
          해당 내용은 저장되지 않습니다.
        </v-card-text>
        <v-card-actions class="btn-area">
          <v-btn class="btn-yes" @click="cancel()">네</v-btn>
          <v-btn class="btn-no" @click="cancelDialog = false">아니오</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style lang="scss" scoped>
.admin-meal {
  padding: 10px;

  .data-card {
    background: #fff;
    border-radius: 15px;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
  }

  .title {
    font-weight: 700;
    font-size: 23px;
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
    align-items: center;
    gap: 16px;
    margin-top: 5px;
    padding: 12px 0;

    .page-btn {
      min-width: 90px;
      font-weight: 600;
      font-size: 0.9rem;
      border-radius: 10px;
      background-color: #eee !important;
      color: #555 !important;
      transition: all 0.25s ease;

      &:hover {
        background-color: #dcdcdc !important;
        transform: scale(1.03);
      }

      &:disabled {
        background-color: #f0f0f0 !important;
        color: #999 !important;
        box-shadow: none;
        transform: none;
      }
    }

    .page-info {
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 600;
      font-size: 1rem;
      color: #555;

      .current {
        color: #5ee6eb; // 메인 민트 강조
        font-size: 1.05rem;
        font-weight: 700;
      }

      .divider {
        margin: 0 2px;
        color: #999;
      }

      .total {
        color: #999;
        font-size: 0.95rem;
      }
    }
  }
}

.admin-dialog {
  border-radius: 15px !important;
  background-color: #fff;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
}

.dialog-title {
  font-weight: 700;
  font-size: 1.3rem;
  color: #333;
  text-align: center;
}

.field-label {
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
  margin-bottom: 6px;
}

.field-input :deep(.v-field) {
  border: 1px solid #d7d7d7 !important;
  border-radius: 14px !important;
  background-color: #f9f9f9 !important;
  height: 54px !important;
  padding-inline: 14px !important;
  display: flex !important;
  align-items: center !important;
  box-shadow: none !important;
  transition: all 0.25s ease;
}

// 선 제거
.field-input :deep(.v-field__outline),
.field-input :deep(.v-field__overlay) {
  display: none !important;
}

// hover시 강조
.field-input:hover :deep(.v-field),
.field-input:focus-within :deep(.v-field) {
  background-color: #f0f0f0 !important;
  border-color: #b0b0b0 !important;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.1);
}

// 텍스트 중앙 정렬
.field-input :deep(.v-field__input) {
  font-size: 0.95rem !important;
  color: #333;
  line-height: normal !important;
  align-items: center !important;
  display: flex !important;
}

// 모달 버튼
.btn-area {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 0 4px 4px 0 !important;
  margin-top: 4px !important;
}

// 버튼 공통
.btn-no,
.btn-yes {
  min-width: 72px;
  height: 38px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  line-height: 1;
  text-transform: none;
  letter-spacing: -0.2px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

// 취소 버튼
.btn-no {
  background-color: #e0e0e0 !important;
  color: #333 !important;
  border-radius: 10px;
}
.btn-no:hover {
  background-color: #d6d6d6 !important;
  transform: scale(1.03);
}

// 저장 버튼
.btn-yes {
  background-color: #5ee6eb !important;
  color: #fff !important;
  border-radius: 10px;
}
.btn-yes:hover {
  background-color: #3dd4da !important;
  box-shadow: 0 3px 10px rgba(61, 212, 218, 0.35);
  transform: scale(1.03);
}
</style>
