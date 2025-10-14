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

const editExercise = ref({
  exerciseId: null,
  exerciseName: '',
  exerciseMet: 0,
  hasDistance: false,
  hasReps: false,
});

const deleteTarget = ref(null);

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
    deleteDialog.value = false;
    loadExercises();
  } catch (e) {
    console.error('삭제 실패:', e);
  }
};

onMounted(() => {
  loadExercises();
});
</script>

<template>
  <div class="exercise-admin">
    <v-card>
      <!-- 상단 툴바 -->
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="title">운동 관리</span>
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
        :items-per-page="10"
        class="styled-table"
        fixed-header
      >
        <!-- 거리 기반 -->
        <template #item.hasDistance="{ item }">
          <v-icon :color="item.hasDistance ? 'green' : 'red'">
            {{ item.hasDistance ? 'mdi-check-circle' : 'mdi-close-circle' }}
          </v-icon>
        </template>

        <!-- 반복 기반 -->
        <template #item.hasReps="{ item }">
          <v-icon :color="item.hasReps ? 'green' : 'red'">
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
    <v-dialog v-model="formDialog" max-width="500">
      <v-card>
        <v-card-title>{{ isEdit ? '운동 수정' : '새 운동 추가' }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="editExercise.exerciseName" label="운동명" />
          <v-text-field
            v-model.number="editExercise.exerciseMet"
            label="MET"
            type="number"
          />
          <v-switch
            v-model="editExercise.hasDistance"
            label="거리 기반 운동 여부"
          />
          <v-switch
            v-model="editExercise.hasReps"
            label="반복 기반 운동 여부"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="formDialog = false">취소</v-btn>
          <v-btn color="primary" @click="saveExercise">저장</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 삭제 모달 -->
    <v-dialog v-model="deleteDialog" max-width="380">
      <v-card>
        <v-card-text>
          정말 <strong>{{ deleteTarget?.exerciseName }}</strong> 운동을
          삭제하시겠습니까?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text color="error" @click="removeExercise">네</v-btn>
          <v-btn text @click="deleteDialog = false">아니오</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style lang="scss" scoped>
.exercise-admin {
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
}
.search {
  width: 50%;
}
.btn {
  min-width: 150px;
}
</style>
