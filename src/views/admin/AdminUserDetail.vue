<script setup>
import { onMounted, reactive, ref, computed } from 'vue';
import {
  getUserDetail,
  putUserProfile,
  deleteUser,
} from '@/services/admin/adminService';
import { getUserExerciseRecord } from '@/services/exercise/exerciseService';
import { getUserMealRecord } from '@/services/meal/mealService';
import { useAuthenticationStore } from '@/stores/user/authentication';
import { useAdminStore } from '@/stores/admin/adminStore';

const authenticationStore = useAuthenticationStore();
const adminStore = useAdminStore();

const searchPoint = ref('');
const searchChallenge = ref('');
const picUrl = ref();
const deletePicDialog = ref(false);
const putProfileDialog = ref(false);
const successDialog = ref(false);
const deleteUserDialog = ref(false);

const state = reactive({
  userInfo: {},
  challengeHistory: [],
  pointHistory: [],
  exerciseHistory: [],
  mealHistory: [],
});

const formatBirthDate = (birthDate) => {
  if (!birthDate) return '';
  const str = birthDate.toString();
  if (str.length === 8) {
    return `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`;
  }
  return str;
};

onMounted(async () => {
  state.userInfo = adminStore.state.selectedUser;
  console.log('userInfo', state.userInfo);
  const userId = Number(state.userInfo.userId);
  const resUser = await getUserDetail(userId);
  // const resExercise = await getUserExerciseRecord(userId);
  // const resMeal = await getUserMealRecord(userId);
  console.log('1', resUser.data);
  // console.log('2', resExercise.data);
  // console.log('3', resMeal.data);
  state.challengeHistory = resUser.data.challengeProgress;
  state.pointHistory = resUser.data.challengePointHistory;
  // state.exerciseHistory = resExercise.data.exerciseRecord;
  // state.mealHistory = resMeal.data.mealRecord;

  picUrl.value = authenticationStore.formattedUserPic(state.userInfo);
});

const pointHeaders = [
  { title: 'ID', key: 'chId' },
  { title: '사유', key: 'reason' },
  { title: '지급 포인트', key: 'point' },
  { title: '지급일', key: 'createdAt' },
];

const challengeHeaders = [
  { title: 'ID', key: 'cpId' },
  { title: '챌린지', key: 'name' },
  { title: '포인트', key: 'point' },
  { title: '시작일', key: 'startDate' },
  { title: '종료일', key: 'endDate' },
  { title: '성공여부', key: 'success' },
];

const formatNumber = (n) => String(n).padStart(2, '0');
const formatDate = (date) => {
  const y = date.getFullYear();
  const m = formatNumber(date.getMonth() + 1);
  const d = formatNumber(date.getDate());
  return `${y}-${m}-${d}`;
};

const tableSet = computed(() => {
  console.log('test', state.challengeHistory);
  const rows = state.challengeHistory.map((item, i) => {
    const name = String(item.challengeDefinition?.cdName ?? '').trim();
    const point = Number(item.challengeDefinition?.cdReward ?? 0);
    const startDate = String(item.startDate ?? '').trim();
    const endDate = String(item.endDate ?? '').trim();
    const success = item.success === true ? '성공' : '실패';

    return {
      cpId: item.cpId ?? i, // id 없을 경우 index로 보정
      name: name.normalize('NFC'),
      point,
      startDate,
      endDate,
      success,
    };
  });

  // 최신순 (endDate DESC)
  rows.sort((a, b) => new Date(b.endDate) - new Date(a.endDate));
  console.log('row', rows);
  return rows;
});

const submit = async () => {
  const jsonBody = state.userInfo;
  console.log('json', jsonBody);

  const res = await putUserProfile(jsonBody);

  if (res && res.status === 200) {
    // 성공하면 저장 완료 모달 열기
    putProfileDialog.value = false;
    successDialog.value = true;
  } else {
    alert('저장에 실패했습니다. 다시 시도해주세요.');
  }
};

const deleteUserProfile = async () => {
  const res = await deleteUser(state.userInfo.userId);
  if (res && res.status === 200) {
    // 성공하면 저장 완료 모달 열기
    deleteUserDialog.value = false;
    successDialog.value = true;
  } else {
    alert('차단에 실패했습니다. 다시 시도해주세요.');
  }
};

const deletePic = () => {
  deletePicDialog.value = false;
  picUrl.value = authenticationStore.formattedUserPic('');
  state.userInfo.pic = null;
};
</script>

<template>
  <div class="user-detail">
    <!-- 이미지 삭제 모달 -->
    <v-dialog v-model="deletePicDialog" max-width="380" min-height="100">
      <v-card>
        <v-card-text> 프로필 이미지를 삭제하시겠습니까? </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="dark" text @click="deletePic()">네</v-btn>
          <v-btn color="dark" text @click="deletePicDialog = false"
            >아니오</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 사용자 차단 모달 -->
    <v-dialog v-model="deleteUserDialog" max-width="380" min-height="100">
      <v-card>
        <v-card-text> 해당 사용자를 차단하시겠습니까? </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="dark" text @click="deleteUserProfile()">네</v-btn>
          <v-btn color="dark" text @click="deleteUserDialog = false"
            >아니오</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 프로필 저장 모달 -->
    <v-dialog v-model="putProfileDialog" max-width="380" min-height="100">
      <v-card>
        <v-card-text> 내용을 저장하시겠습니까? </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="dark" text @click="submit()">네</v-btn>
          <v-btn color="dark" text @click="putProfileDialog = false"
            >아니오</v-btn
          >
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

    <v-card>
      <span class="title">회원 정보</span>
      <v-btn @click="deleteUserDialog = true">회원 차단</v-btn>
      <v-divider></v-divider>
      <v-img :src="picUrl" alt="profile-img" class="profile-img"></v-img>
      <v-btn v-if="state.userInfo.pic" @click="deletePicDialog = true"
        >이미지 삭제</v-btn
      >
      <v-card-title>{{ state.userInfo.name }}</v-card-title>

      <v-card-subtitle>이름</v-card-subtitle>
      <v-text-field v-model="state.userInfo.name"></v-text-field>

      <v-card-subtitle>닉네임</v-card-subtitle>
      <v-text-field v-model="state.userInfo.nickName"></v-text-field>

      <v-card-subtitle>회원 아이디</v-card-subtitle>
      <v-text-field v-model="state.userInfo.uid"></v-text-field>

      <v-card-subtitle>티어</v-card-subtitle>
      <v-select
        :items="['브론즈', '실버', '골드', '다이아']"
        v-model="state.userInfo.challengeRole"
      ></v-select>

      <v-card-subtitle>권한</v-card-subtitle>
      <v-select
        v-if="state.userInfo.userRoles != null"
        :items="['USER', 'SOCIAL', 'MANAGER', 'ADMIN']"
        v-model="state.userInfo.userRoles"
      ></v-select>

      <v-card-subtitle>생년월일</v-card-subtitle>
      <v-card-text>
        <!-- {{ formatBirthDate(state.userInfo.birthDate) }} -->
        {{ state.userInfo.birthDate }}
      </v-card-text>

      <v-card-subtitle>가입일자</v-card-subtitle>
      <v-card-text>{{
        String(state.userInfo.createdAt).slice(0, 10)
      }}</v-card-text>

      <v-card-subtitle>이메일</v-card-subtitle>
      <v-card-text>{{ state.userInfo.email }}</v-card-text>

      <v-card-subtitle>성별</v-card-subtitle>
      <v-card-text>{{
        state.userInfo.gender === 'F' ? '여' : '남'
      }}</v-card-text>

      <v-card-subtitle>전화번호</v-card-subtitle>
      <v-card-text>{{ state.userInfo.phone }}</v-card-text>

      <v-card-subtitle>보유 포인트</v-card-subtitle>
      <v-card-text>{{
        Number(state.userInfo.point).toLocaleString()
      }}</v-card-text>
      <!-- <v-btn @click="postPointDialog = true">포인트 지급</v-btn> -->

      <v-card-subtitle>보유 경험치</v-card-subtitle>
      <v-card-text>{{
        Number(state.userInfo.xp).toLocaleString()
      }}</v-card-text>

      <v-btn @click="putProfileDialog = true">저장</v-btn>
    </v-card>

    <!-- 포인트 -->
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="title">포인트 지급 내역</span>
        <v-text-field
          v-model="searchPoint"
          label="검색"
          prepend-inner-icon="mdi-magnify"
          density="compact"
          hide-details
          single-line
          variant="outlined"
          style="max-width: 250px"
        />
      </v-card-title>
      <v-data-table
        :headers="pointHeaders"
        :items="state.pointHistory"
        :items-per-page="10"
        :search="searchPoint"
        fixed-header
        class="styled-table"
      >
        <!-- 포인트 -->
        <template #item.point="{ item }"> {{ item.point }}P </template>
        <!-- 지급일 -->
        <template #item.createdAt="{ item }">
          {{ formatDate(new Date(item.createdAt)) }}
        </template>
      </v-data-table>
    </v-card>

    <!-- 챌린지 -->
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="title">챌린지 도전 내역</span>
        <v-text-field
          v-model="searchChallenge"
          label="검색"
          prepend-inner-icon="mdi-magnify"
          density="compact"
          hide-details
          single-line
          variant="outlined"
          style="max-width: 250px"
        />
      </v-card-title>
      <v-data-table
        :headers="challengeHeaders"
        :items="tableSet"
        :items-per-page="10"
        :search="searchChallenge"
        fixed-header
        class="styled-table"
      >
        <!-- 포인트 -->
        <template #item.point="{ item }"> {{ item.point }}P </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<style lang="scss" scoped>
.profile-img {
  width: 100px;
}
.title {
  font-weight: 700;
  font-size: 18px;
}
</style>
