<script setup>
import { onMounted, reactive, ref, computed } from 'vue';
import { getUserDetail } from '@/services/admin/adminService';
import { useAuthenticationStore } from '@/stores/user/authentication';
import { useAdminStore } from '@/stores/admin/adminStore';

const authenticationStore = useAuthenticationStore();
const adminStore = useAdminStore();

const picUrl = ref();

const plainXp = ref(0);
const xp = computed({
  get() {
    return plainXp.value.toLocaleString();
  },
  set(num) {
    plainXp.value = parseInt(num.replace(/,/g, '')) || 0;
    state.userInfo.xp = plainXp.value;
  },
});

const plainPoint = ref(0);
const point = computed({
  get() {
    return plainPoint.value.toLocaleString();
  },
  set(num) {
    plainPoint.value = parseInt(num.replace(/,/g, '')) || 0;
    state.userInfo.point = plainPoint.value;
  },
});
const state = reactive({
  userInfo: {},
  challengeHistory: [],
  pointHistory: [],
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
  plainXp.value = state.userInfo.xp;
  plainPoint.value = state.userInfo.point;
  const userId = Number(state.userInfo.userId);
  const res = await getUserDetail(userId);
  console.log('res', res.data);
  state.challengeHistory = res.data.challengeProgress;
  state.pointHistory = res.data.challengePointHistory;
  picUrl.value = authenticationStore.formattedUserPic(state.userInfo);
});

const headers = [
  { title: 'ID', key: 'chId' },
  { title: '사유', key: 'reason' },
  { title: '지급 포인트', key: 'point' },
  { title: '날짜', key: 'createdAt' },
];

const formatNumber = (n) => String(n).padStart(2, '0');
const formatDate = (date) => {
  const y = date.getFullYear();
  const m = formatNumber(date.getMonth() + 1);
  const d = formatNumber(date.getDate());
  return `${y}-${m}-${d}`;
};

const submit = () => {
  const jsonBody = state.userInfo;
};
</script>

<template>
  <div class="user-detail">
    <v-card>
      <span class="title">회원 정보</span>
      <v-divider></v-divider>
      <v-img :src="picUrl" alt="profile-img" class="profile-img"></v-img>
      <v-card-title>{{ state.userInfo.name }}</v-card-title>

      <v-card-subtitle>이름</v-card-subtitle>
      <v-text-field v-model="state.userInfo.name"></v-text-field>

      <v-card-subtitle>닉네임</v-card-subtitle>
      <v-text-field v-model="state.userInfo.nickName"></v-text-field>

      <v-card-subtitle>티어</v-card-subtitle>
      <v-select
        :items="['브론즈', '실버', '골드', '다이아']"
        v-model="state.userInfo.challengeRole"
        >{{ state.userInfo.challengeRole }}</v-select
      >

      <v-card-subtitle>생년월일</v-card-subtitle>
      <v-card-text>{{ formatBirthDate(state.userInfo.birthDate) }}</v-card-text>

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

      <v-card-subtitle>회원 아이디</v-card-subtitle>
      <v-card-text>{{ state.userInfo.uid }}</v-card-text>

      <v-card-subtitle>보유 포인트</v-card-subtitle>
      <v-text-field v-model="point"></v-text-field>

      <v-card-subtitle>보유 경험치</v-card-subtitle>
      <v-text-field v-model="xp"></v-text-field>

      <v-card-subtitle>권한</v-card-subtitle>
      <v-select
        v-if="state.userInfo.userRoles != null"
        :items="['USER', 'SOCAIL', 'MANAGER', 'ADMIN']"
        v-model="state.userInfo.userRoles"
        >{{ state.userInfo.userRoles }}</v-select
      >

      <v-btn @click="submit()">저장</v-btn>
    </v-card>

    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="title">포인트 지급 내역</span>
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
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="state.pointHistory"
        :items-per-page="10"
        fixed-header
        class="styled-table"
      >
        <!-- 가입일 -->
        <template #item.createdAt="{ item }">
          {{ formatDate(new Date(item.createdAt)) }}
        </template>
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
