<script setup>
import { getChallenge } from '@/services/admin/adminService';
import { onMounted, ref, computed, nextTick } from 'vue';
import {
  postChallenge,
  putChallenge,
  deleteChallenge,
} from '@/services/admin/adminService';

const challenges = ref([]);
const search = ref('');
const selectedType = ref('');
const deleteTargetId = ref(null);

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
  cdUnit: '',
  cdReward: null,
  xp: null,
  tier: '',
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
    editChallenge.value = item;
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
  cancelDialog.value = false;
  formDialog.value = false;
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

  const isEmpty = fields.some((key) => !editChallenge.value[key]);
  if (isEmpty) {
    alert('모든 항목을 입력해주세요.');
    return;
  }

  console.log('json', editChallenge.value);
  let res = null;
  if (editChallenge.value.cdId) {
    res = await putChallenge(editChallenge.value);
    console.log('수정');
  } else {
    res = await postChallenge(editChallenge.value);
  }
  if (res && res.status === 200) {
    // 성공하면 저장 완료 모달 열기
    successDialog.value = true;
    formDialog.value = false;
  } else {
    alert('저장에 실패했습니다. 다시 시도해주세요.');
  }
};

// 삭제 api
const openDelete = (id) => {
  deleteTargetId.value = id;
  deleteDialog.value = true;
};
const remove = async () => {
  const id = deleteTargetId.value;
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
  <div class="challenge-admin">
    <!-- 수정 / 추가 모달 -->
    <v-dialog v-model="formDialog" max-width="300" min-height="100">
      <v-card>
        <v-card-title class="text-h8">{{
          isEdit ? '챌린지 수정' : '챌린지 추가'
        }}</v-card-title>
        <v-card-subtitle>이름</v-card-subtitle>
        <v-text-field v-model="editChallenge.cdName" />

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
        <v-text-field v-model="editChallenge.cdImage" />
        <!-- <v-card-subtitle>이미지</v-card-subtitle>
        <v-file-input
          v-model="editChallenge.cdImage"
          clearable
        /> -->

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
        <span class="title">챌린지 관리</span>
        <v-select
          v-model="selectedType"
          :items="typeOptions"
          item-title="title"
          item-value="value"
          label="타입 선택"
          density="compact"
          variant="outlined"
          style="max-width: 200px"
        />
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
        <v-btn @Click="toForm()">챌린지 추가하기</v-btn>
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
                ? '#9e9e9e'
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

        <!-- 관리 -->
        <template #item.setting="{ item }">
          <v-btn @click="toForm(item)">수정</v-btn>
          <v-btn @click="openDelete(item.cdId)">삭제</v-btn>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<style lang="scss" scoped>
.challenge-admin {
  padding: 20px;

  .title {
    font-weight: 700;
    font-size: 18px;
  }
  border-radius: 12px;
  overflow: hidden;
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
</style>
