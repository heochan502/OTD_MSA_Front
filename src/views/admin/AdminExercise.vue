<script setup>
import { onMounted, ref } from 'vue';
import { getExercise } from '@/services/admin/adminService';

onMounted(async () => {
  const res = await getExercise();
  console.log('exercise', res.data);
  exercise.value = res.data;
});

const formDialog = ref(false);
const successDialog = ref(false);
const cancelDialog = ref(false);
const deleteDialog = ref(false);
const isEdit = ref(false);
const deleteTargetId = ref(null);
const editExercise = ref({})

const exercise = ref([]);
const search = ref('');

const headers = [
  { title: 'ID', key: 'exerciseId' },
  { title: '운동명', key: 'exerciseName' },
  { title: '활동에너지 소모량', key: 'exerciseMet' },
  { title: '거리 기반', key: 'hasDistance' },
  { title: '갯수 기반', key: 'hasReps' },
  { title: '관리', key: 'setting' },
];

const toForm = (item) => {
  if (item) {
    editExercise.value = item;
    plainGoal.value = item.cdGoal;
    isEdit.value = true;
  } else {
    isEdit.value = false;
    editExercise.value = { ...addChallenge };
    plainGoal.value = null;
  }
  formDialog.value = true;
};

const cancel = () => {
  cancelDialog.value = false;
  formDialog.value = false;
};
</script>

<template>
  <div class="admin-exercise">
    <!-- 수정 / 추가 모달 -->
    <v-dialog v-model="formDialog" max-width="300" min-height="100">
      <v-card>
        <v-card-title class="text-h8">{{
          isEdit ? '운동 종목 수정' : '운동 종목 추가'
        }}</v-card-title>
        <v-card-subtitle>운동명</v-card-subtitle>
        <v-text-field v-model="editExercise.exerciseName" />

        <v-card-subtitle>활동에너지 소모량</v-card-subtitle>
        <v-text-field v-model="editExercise.exerciseMet" />

        <v-card-subtitle>타입</v-card-subtitle>
        <v-select
          :items="['competition', 'personal', 'weekly', 'daily']"
          v-model="editChallenge.cdType"
        />

        <v-card-subtitle>단위</v-card-subtitle>
        <v-combobox
          :items="challnegeUnit"
          v-model="editChallenge.cdUnit"
          no-filter
        />

        <v-card-subtitle>목표</v-card-subtitle>
        <v-text-field v-model="goal" />

        <v-card-subtitle>티어</v-card-subtitle>
        <v-select
          :items="['없음', '브론즈', '실버', '골드', '다이아']"
          v-model="editChallenge.tier"
        />

        <v-card-subtitle>이미지</v-card-subtitle>
        <v-file-input
          accept="image/*"
          label="이미지 선택"
          @change="onFileChange"
        />

        <v-card-subtitle>포인트 보상</v-card-subtitle>
        <v-text-field
          type="number"
          v-model.number="editChallenge.cdReward"
          placeholder="포인트 보상 입력"
        />

        <v-card-subtitle>경험치</v-card-subtitle>
        <v-text-field
          type="number"
          v-model.number="editChallenge.xp"
          placeholder="획득 경험치 입력"
        />

        <v-card-actions>
          <v-spacer />
          <v-btn color="dark" text @click="cancelDialog = true">취소</v-btn>
          <v-btn color="dark" text @click="submit()">저장</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 취소 모달 -->
    <v-dialog v-model="cancelDialog" max-width="380" min-height="100">
      <v-card>
        <v-card-text>
          취소하고 돌아가시겠습니까? 해당 내용은 저장되지 않습니다.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="dark" text @click="cancel()">네</v-btn>
          <v-btn color="dark" text @click="cancelDialog = false">아니오</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 수정 / 저장 완료 모달 -->
    <v-dialog v-model="successDialog" max-width="380" min-height="100">
      <v-card>
        <v-card-title class="text-h8">완료</v-card-title>
        <v-card-text> 성공적으로 완료되었습니다. </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="dark" text @click="successDialog = false">확인</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 삭제 모달 -->
    <v-dialog v-model="deleteDialog" max-width="380" min-height="100">
      <v-card>
        <v-card-text> 해당 챌린지를 삭제하시겠습니까? </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="dark" text @click="remove()">네</v-btn>
          <v-btn color="dark" text @click="deleteDialog = false">아니오</v-btn>
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
        <v-btn>운동 종목 추가하기</v-btn>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="exercise"
        :search="search"
        fixed-header
        :items-per-page="10"
        class="styled-table"
      >
        <!-- 타입 변환 -->
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
        <template #item.setting="{ item }">
          <v-btn @click="toForm(item)">수정</v-btn>
          <v-btn @click="openDelete(item.cdId)">삭제</v-btn>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<style scoped></style>
