<script setup>
import { ref, onMounted, computed } from 'vue';
import {
  getExercise,
  postExercise,
  putExercise,
  deleteExercise,
} from '@/services/admin/adminService';

const exercises = ref([]);
const keyword = ref('');
const formDialog = ref(false);
const deleteDialog = ref(false);
const isEdit = ref(false);
const successDialog = ref(false);
const cancelDialog = ref(false);

const exercise = ref([]);
const search = ref('');

// 테이블 헤더
const headers = [
  { title: 'ID', key: 'exerciseId' },
  { title: '운동명', key: 'exerciseName' },
  { title: 'MET', key: 'exerciseMet' },
  { title: '거리 기반', key: 'hasDistance' },
  { title: '반복 기반', key: 'hasReps' },
  { title: '관리', key: 'setting', sortable: false },
];

// 운동 목록 불러오기
const loadExercises = async () => {
  try {
    const res = await getExercise();
    // exerciseId → Number 변환 후 내림차순 정렬
    exercises.value = res.data.map((e) => ({
      ...e,
      exerciseId: Number(e.exerciseId),
    }));
  } catch (e) {
    console.error('운동 데이터 불러오기 실패:', e);
  }
};

// 검색 필터링
const filteredExercises = computed(() => {
  if (!Array.isArray(exercises.value)) return [];
  if (!keyword.value) return exercises.value;
  return exercises.value.filter((e) =>
    e.exerciseName.toLowerCase().includes(keyword.value.toLowerCase())
  );
});

// 추가/수정 폼 열기
const openForm = (exercise = null) => {
  if (exercise) {
    isEdit.value = true;
    editExercise.value = { ...exercise };
  } else {
    isEdit.value = false;
    editExercise.value = {
      exerciseId: null,
      exerciseName: '',
      exerciseMet: 0,
      hasDistance: false,
      hasReps: false,
    };
  }
  formDialog.value = true;
};

// 저장 (추가 or 수정)
const saveExercise = async () => {
  if (
    !editExercise.value.exerciseName ||
    editExercise.value.exerciseName.trim() === ''
  ) {
    alert('운동명을 입력해주세요.');
    return;
  }
  if (editExercise.value.exerciseMet <= 0) {
    alert('MET 값을 입력해주세요.');
    return;
  }

  try {
    if (isEdit.value) {
      await putExercise(editExercise.value.exerciseId, editExercise.value);
    } else {
      await postExercise(editExercise.value);
    }
    successDialog.value = true;
    formDialog.value = false;
    loadExercises();
  } catch (e) {
    console.error('저장 실패:', e);
  }
};

// 삭제 다이얼로그 열기
const openDelete = (exercise) => {
  deleteTarget.value = exercise;
  deleteDialog.value = true;
};

// 삭제 실행
const removeExercise = async () => {
  try {
    await deleteExercise(deleteTarget.value.exerciseId);
    successDialog.value = true;
    deleteDialog.value = false;
    loadExercises();
  } catch (e) {
    console.error('삭제 실패:', e);
  }
};

// 수정, 추가 취소 모달
const cancel = () => {
  cancelDialog.value = false;
  formDialog.value = false;
};
onMounted(() => {
  loadExercises();
});
</script>

<template>
  <div class="admin-exercise">
    <v-card class="data-card pa-2">
      <!-- 상단 툴바 -->
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="title">운동 종목 관리</span>
        <div class="d-flex align-center search" style="gap: 12px">
          <v-text-field
            v-model="keyword"
            label="검색 (운동명)"
            prepend-inner-icon="mdi-magnify"
            density="compact"
            hide-details
            single-line
            variant="outlined"
            style="max-width: 450px"
          />
          <v-btn class="btn" @click="openForm()">➕ 운동 추가</v-btn>
        </div>
      </v-card-title>

      <!-- 데이터 테이블 -->
      <v-data-table
        :headers="headers"
        :items="filteredExercises"
        :items-per-page="12"
        height="700"
        class="styled-table"
        fixed-header
      >
        <!-- 거리 기반 -->
        <template #item.hasDistance="{ item }">
          <v-icon :color="item.hasDistance ? '#9FD995' : '#F18A86'">
            {{ item.hasDistance ? 'mdi-check-circle' : 'mdi-close-circle' }}
          </v-icon>
        </template>

        <!-- 반복 기반 -->
        <template #item.hasReps="{ item }">
          <v-icon :color="item.hasReps ? '#9FD995' : '#F18A86'">
            {{ item.hasReps ? 'mdi-check-circle' : 'mdi-close-circle' }}
          </v-icon>
        </template>

        <!-- 관리 버튼 -->
        <template #item.setting="{ item }">
          <v-btn @click="openForm(item)">수정</v-btn>
          <v-btn @click="openDelete(item)">삭제</v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- 추가/수정 모달 -->
    <v-dialog v-model="formDialog" max-width="700">
      <v-card class="admin-dialog pa-6">
        <v-card-title class="dialog-title mb-4">
          {{ isEdit ? '운동 수정' : '운동 추가' }}
        </v-card-title>

        <v-container fluid>
          <v-row dense>
            <!-- 운동명 -->
            <v-col cols="6">
              <v-card-subtitle class="field-label">운동명</v-card-subtitle>
              <v-text-field
                v-model="editExercise.exerciseName"
                class="field-input"
                density="comfortable"
                hide-details
                placeholder="운동명을 입력하세요"
              />
            </v-col>

            <!-- MET -->
            <v-col cols="6">
              <v-card-subtitle class="field-label">MET</v-card-subtitle>
              <v-text-field
                v-model.number="editExercise.exerciseMet"
                class="field-input"
                type="number"
                density="comfortable"
                hide-details
              />
            </v-col>

            <!-- 거리 기반 -->
            <v-col cols="6">
              <v-switch
                v-model="editExercise.hasDistance"
                color="#9FD995"
                hide-details
                inset
                label="거리 기반 운동 여부"
              />
            </v-col>

            <!-- 반복 기반 -->
            <v-col cols="6">
              <v-switch
                v-model="editExercise.hasReps"
                color="#9FD995"
                hide-details
                inset
                label="반복 기반 운동 여부"
              />
            </v-col>
          </v-row>
        </v-container>

        <v-divider class="my-2" />
        <v-card-actions class="justify-end btn-area">
          <v-btn class="btn-no" @click="cancelDialog = true">취소</v-btn>
          <v-btn class="btn-yes" @click="saveExercise">저장</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 삭제 모달 -->
    <v-dialog v-model="deleteDialog" max-width="380">
      <v-card class="admin-dialog pa-6">
        <v-card-text>
          정말 <strong>{{ deleteTarget?.exerciseName }}</strong> 운동을
          삭제하시겠습니까?
        </v-card-text>
        <v-card-actions class="justify-end btn-area">
          <v-btn class="btn-yes" @click="removeExercise">네</v-btn>
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

    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="title">운동 종목 관리</span>
        <v-text-field
          v-model="search"
          label="검색"
          prepend-inner-icon="mdi-magnify"
          density="compact"
          hide-details
          single-line
          variant="outlined"
          style="max-width: 250px"
        />
        <v-btn>챌린지 추가하기</v-btn>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="exercise"
        style="max-height: calc(100vh - 200px)"
        :search="search"
        fixed-header
        :items-per-page="10"
        class="styled-table"
      >
        타입 변환
        <!-- <template #item.cdType="{ item }">
          <v-chip
            :color="
              item.cdType === 'daily'
                ? 'blue'
                : item.cdType === 'weekly'
                ? 'green'
                : item.cdType === 'competition'
                ? 'red'
                : 'purple'
            "
            text-color="white"
            small
          >
            {{ formatType(item.cdType) }}
          </v-chip>
        </template> -->

        <!-- 목표 -->
        <!-- <template #item.cdGoal="{ item }">
          {{ Number(item.cdGoal).toLocaleString() }}
        </template> -->

        <!-- 챌린지 등급 -->
        <!-- <template #item.tier="{ item }">
          <v-chip
            :color="
              item.tier === '브론즈'
                ? '#ce7430'
                : item.tier === '실버'
                ? '#7a7a7a'
                : item.tier === '골드'
                ? '#ffba57'
                : item.tier === '다이아'
                ? '#00c6ff'
                : '#ff8a80' // 그 외
            "
            small
          >
            {{ item.tier }}
          </v-chip>
        </template> -->

        <!-- 관리 -->
        <!-- <template #item.setting="{ item }">
          <v-btn @click="toForm(item)">수정</v-btn>
          <v-btn @click="openDelete(item.cdId)">삭제</v-btn>
        </template> -->
      </v-data-table>
    </v-card>
  </div>
</template>

<style lang="scss" scoped>
.admin-exercise {
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
}
.search {
  width: 50%;
}
.btn {
  min-width: 150px;
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
