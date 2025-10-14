<script setup>
import { onMounted, ref, computed, nextTick } from 'vue';
import {
  postChallenge,
  putChallenge,
  deleteChallenge,
  getChallenge,
  getChallengeProgress,
} from '@/services/admin/adminService';
import { useRouter } from 'vue-router';

const router = useRouter();
const challenges = ref([]);
const search = ref('');
const selectedType = ref('');
const deleteTarget = ref(null);

const formDialog = ref(false);
const successDialog = ref(false);
const cancelDialog = ref(false);
const deleteDialog = ref(false);

const editChallenge = ref({});
const challnegeUnit = ref([]);
const isEdit = ref(false);

const addChallenge = {
  cdName: '',
  cdType: '',
  cdGoal: null,
  cdUnit: '-',
  cdReward: null,
  xp: null,
  tier: '없음',
  cdImage: '',
};

const plainGoal = ref(0);

const goal = computed({
  get() {
    return plainGoal.value != null ? plainGoal.value.toLocaleString() : '';
  },
  set(num) {
    plainGoal.value = parseInt(num.replace(/,/g, '')) || 0;
    editChallenge.value.cdGoal = plainGoal.value;
  },
});

const headers = [
  { title: 'ID', key: 'cdId' },
  { title: '이름', key: 'cdName' },
  { title: '타입', key: 'cdType' },
  { title: '목표', key: 'cdGoal' },
  { title: '단위', key: 'cdUnit' },
  { title: '보상(P)', key: 'cdReward' },
  { title: '경험치(XP)', key: 'xp' },
  { title: '티어', key: 'tier' },
  { title: '이미지 경로', key: 'cdImage' },
  { title: '더보기', key: 'progress'},
  { title: '관리', key: 'setting' },
];

const typeOptions = [
  { title: '전체', value: '' },
  { title: '월간경쟁챌린지', value: 'competition' },
  { title: '월간개인챌린지', value: 'personal' },
  { title: '주간챌린지', value: 'weekly' },
  { title: '일일미션', value: 'daily' },
];

const setChallengeUnit = (challenge) => {
  challnegeUnit.value = [...new Set(challenge.map((item) => item.cdUnit))];
  console.log('unit', challnegeUnit.value);
};

// id 타입 String -> Number
const setIdType = (challenge) => {
  challenges.value = challenge.map((item) => ({
    ...item,
    cdId: Number(item.cdId),
  }));
};

const filteredChallenges = computed(() => {
  let data = challenges.value;

  if (selectedType.value) {
    data = data.filter((c) => c.cdType === selectedType.value);
  }

  if (search.value) {
    data = data.filter((c) =>
      Object.values(c).some((v) =>
        String(v).toLowerCase().includes(search.value.toLowerCase())
      )
    );
  }

  return data;
});

const formatType = (type) => {
  const map = {
    daily: '일일미션',
    weekly: '주간챌린지',
    competition: '월간경쟁챌린지',
    personal: '월간개인챌린지',
  };
  return map[type] || type;
};

onMounted(async () => {
  const res = await getChallenge();
  setIdType(res.data);
  console.log('challenge', challenges.value);
  setChallengeUnit(res.data);
});

const toForm = (item) => {
  if (item) {
    // 깊은복사
    editChallenge.value = JSON.parse(JSON.stringify(item));
    plainGoal.value = item.cdGoal;
    isEdit.value = true;
  } else {
    isEdit.value = false;
    editChallenge.value = { ...addChallenge };
    plainGoal.value = null;
  }
  formDialog.value = true;
};

const cancel = () => {
  isEdit.value = false;
  editChallenge.value = { ...addChallenge };
  plainGoal.value = null;
  console.log('edit', editChallenge.value);
  cancelDialog.value = false;
  formDialog.value = false;
};

const onFileChange = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  editChallenge.value.cdImageFile = file; // 실제 File 객체
  editChallenge.value.cdImage = file.name; // 파일명
};

// 수정 / 추가 api
const submit = async () => {
  const fields = [
    'cdName',
    'cdType',
    'cdGoal',
    'cdUnit',
    'cdReward',
    'xp',
    'tier',
    'cdImage',
  ];

  // 0은 허용, null/''만 막기
  const isEmpty = fields.some(
    (key) =>
      editChallenge.value[key] === null || editChallenge.value[key] === ''
  );
  if (isEmpty) {
    alert('모든 항목을 입력해주세요.');
    return;
  }

  console.log('json', editChallenge.value);

  const formData = new FormData();

  const challengeData = {
    cdId: editChallenge.value.cdId,
    cdName: editChallenge.value.cdName,
    cdType: editChallenge.value.cdType,
    cdGoal: editChallenge.value.cdGoal,
    cdUnit: editChallenge.value.cdUnit,
    cdReward: editChallenge.value.cdReward,
    xp: editChallenge.value.xp,
    tier: editChallenge.value.tier,
    cdImage: editChallenge.value.cdImage,
  };
  formData.append(
    'challenge',
    new Blob([JSON.stringify(challengeData)], { type: 'application/json' })
  );
  if (editChallenge.value.cdImageFile) {
    formData.append('file', editChallenge.value.cdImageFile);
  }
  console.log('file check', editChallenge.value.cdImageFile);
  console.log('json', editChallenge.value);

  console.log([...formData]);
  let res = null;
  if (editChallenge.value.cdId) {
    res = await putChallenge(formData);
    console.log('수정');
  } else {
    res = await postChallenge(formData);
  }
  if (res && res.status === 200) {
    // 성공하면 저장 완료 모달 열기
    successDialog.value = true;
    formDialog.value = false;
    const refresh = await getChallenge();
    setIdType(refresh.data);
    setChallengeUnit(refresh.data);
  } else {
    alert('저장에 실패했습니다. 다시 시도해주세요.');
  }
  deleteDialog.value = false;
};
// 챌린지 현황
const progress = async (id) => {
  try {
    router.push({ name: 'AdminChallengeDetail', query: { id } });
  } catch (e) {
    console.error('현황 조회 실패', e);
  }
};

// 삭제 api
const openDelete = (item) => {
  deleteTarget.value = item;
  deleteDialog.value = true;
};

const remove = async () => {
  const id = deleteTarget.value.cdId;
  console.log('removeid', id);
  const res = await deleteChallenge(id);
  if (res && res.status === 200) {
    successDialog.value = true;
    formDialog.value = false;
    const refresh = await getChallenge();
    setIdType(refresh.data);
    setChallengeUnit(refresh.data);
  } else {
    alert('삭제에 실패했습니다. 다시 시도해주세요.');
  }
  deleteDialog.value = false;
};
</script>

<template>
  <div class="admin-challenge">
    <!-- 수정 / 추가 모달 -->
    <v-dialog v-model="formDialog" max-width="700">
      <v-card class="admin-dialog pa-6">
        <v-card-title class="dialog-title mb-4">
          {{ isEdit ? '챌린지 수정' : '챌린지 추가' }}
        </v-card-title>

        <v-container fluid>
          <v-row dense>
            <v-col cols="6">
              <v-card-subtitle class="field-label">이름</v-card-subtitle>
              <v-text-field
                v-model="editChallenge.cdName"
                hide-details
                density="comfortable"
                class="field-input"
                placeholder="챌린지 이름 입력"
              />
            </v-col>

            <v-col cols="6">
              <v-card-subtitle class="field-label">타입</v-card-subtitle>
              <v-select
                :items="['competition', 'personal', 'weekly', 'daily']"
                v-model="editChallenge.cdType"
                hide-details
                density="comfortable"
                class="field-input"
              />
            </v-col>

            <v-col cols="6">
              <v-card-subtitle class="field-label">단위</v-card-subtitle>
              <v-combobox
                :items="challnegeUnit"
                v-model="editChallenge.cdUnit"
                hide-details
                density="comfortable"
                class="field-input"
                no-filter
              />
            </v-col>

            <v-col cols="6">
              <v-card-subtitle class="field-label">목표</v-card-subtitle>
              <v-text-field
                v-model="goal"
                hide-details
                density="comfortable"
                class="field-input"
                placeholder="목표값 입력"
              />
            </v-col>

            <v-col cols="6">
              <v-card-subtitle class="field-label">티어</v-card-subtitle>
              <v-select
                :items="['없음', '브론즈', '실버', '골드', '다이아']"
                v-model="editChallenge.tier"
                hide-details
                density="comfortable"
                class="field-input"
              />
            </v-col>

            <v-col cols="6">
              <v-card-subtitle class="field-label">이미지</v-card-subtitle>
              <v-file-input
                label="이미지 선택"
                accept="image/*"
                hide-details
                density="comfortable"
                class="field-input"
                @change="onFileChange"
              />
            </v-col>

            <v-col cols="6">
              <v-card-subtitle class="field-label">포인트 보상</v-card-subtitle>
              <v-text-field
                type="number"
                v-model.number="editChallenge.cdReward"
                placeholder="포인트 입력"
                hide-details
                density="comfortable"
                class="field-input"
              />
            </v-col>

            <v-col cols="6">
              <v-card-subtitle class="field-label">경험치</v-card-subtitle>
              <v-text-field
                type="number"
                v-model.number="editChallenge.xp"
                placeholder="획득 경험치 입력"
                hide-details
                density="comfortable"
                class="field-input"
              />
            </v-col>
          </v-row>
        </v-container>

        <v-divider class="my-2" />

        <v-card-actions class="justify-end btn-area">
          <v-btn class="btn-no"@click="cancelDialog = true">
            취소
          </v-btn>
          <v-btn class="btn-yes" @click="submit()">
            저장
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 취소 모달 -->
    <v-dialog v-model="cancelDialog" max-width="380" min-height="100">
      <v-card class="admin-dialog pa-6">
        <v-card-text>
          취소하고 돌아가시겠습니까? 
          <br></br>
          해당 내용은 저장되지 않습니다.
        </v-card-text>
        <v-card-actions class="btn-area">
          <v-btn class="btn-yes" @click="cancel()">네</v-btn>
          <v-btn class="btn-no" @click="cancelDialog = false"
            >아니오</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 수정 / 저장 완료 모달 -->
    <v-dialog v-model="successDialog" max-width="380" min-height="100">
      <v-card class="admin-dialog pa-6">
        <v-card-text> 성공적으로 완료되었습니다. </v-card-text>
        <v-card-actions>
          <v-btn
            class="btn-yes"
            text
            @click="successDialog = false"
            >확인</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 삭제 모달 -->
    <v-dialog v-model="deleteDialog" max-width="380" min-height="100">
      <v-card class="admin-dialog pa-6">
        <v-card-text> 정말 <strong>{{ deleteTarget.cdName }}</strong> 챌린지를 삭제하시겠습니까? </v-card-text>
        <v-card-actions class="btn-area">
          <v-btn class="btn-yes" @click="remove()"> 네 </v-btn>
          <v-btn
            class="btn-no"
            variant="flat"
            @click="deleteDialog = false"
          >
            아니오
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-card class="data-card pa-2">
      <v-card-title class="d-flex justify-space-between align-center">
        <!-- 왼쪽 -->
        <div class="d-flex align-center" style="gap: 12px">
          <span class="title">챌린지 관리</span>
          <v-select
            v-model="selectedType"
            :items="typeOptions"
            item-title="title"
            item-value="value"
            label="타입 선택"
            density="compact"
            hide-details
            variant="outlined"
            style="max-width: 200px"
          />
        </div>

        <!-- 오른쪽 -->
        <div class="d-flex align-center search" style="gap: 12px">
          <v-text-field
            v-model="search"
            label="검색 (챌린지명)"
            prepend-inner-icon="mdi-magnify"
            density="compact"
            hide-details
            single-line
            variant="outlined"
            style="max-width: 450px"
          />
          <v-btn class="btn" @click="toForm()">➕ 챌린지 추가</v-btn>
        </div>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="filteredChallenges"
        style="max-height: calc(100vh - 200px)"
        fixed-header
        :items-per-page="10"
        class="styled-table"
      >
        <!-- 타입 변환 -->
        <template #item.cdType="{ item }">
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
        </template>

        <!-- 목표 -->
        <template #item.cdGoal="{ item }">
          {{ Number(item.cdGoal).toLocaleString() }}
        </template>

        <!-- 챌린지 등급 -->
        <template #item.tier="{ item }">
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
        </template>

        <!-- 챌린지 현황 -->
        <template #item.progress="{item}">
          <v-bt @click="progress(item.cdId)">챌린지 현황</v-bt>
        </template>

        <!-- 관리 -->
        <template #item.setting="{ item }">
          <v-btn @click="toForm(item)">수정</v-btn>
          <v-btn @click="openDelete(item)">삭제</v-btn>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<style lang="scss" scoped>
.admin-challenge {
  padding: 10px;

  .data-card{
  background: #fff;
  border-radius: 15px; 
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
  }

  .title {
    font-weight: 700;
    font-size: 23px;
  }
  border-radius: 12px;
  overflow: hidden;
}
.search {
  width: 50%;
}
.btn {
  min-width: 150px;
}
.styled-table {
  :deep(td),
  :deep(th) {
    // text-align: center !important;
    vertical-align: middle;
  }
  thead {
    background-color: #393e46;
    color: #fff;
    font-weight: 600;
  }

  tbody tr:hover {
    background-color: #f1f5f9 !important; // 행 hover 시 은은한 강조
  }

  .v-data-table-footer {
    background: #fafafa;
  }
}

// 카드
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
