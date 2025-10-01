<script setup>
import { onMounted, reactive, ref } from 'vue';
import { getUserDetail } from '@/services/admin/adminService';
import { useAuthenticationStore } from '@/stores/user/authentication';

const authenticationStore = useAuthenticationStore();

const picUrl = ref();

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
  state.userInfo = JSON.parse(history.state.user);
  const userId = Number(state.userInfo.userId);
  const res = await getUserDetail(userId);
  state.challengeHistory = res.data.challengeProgress;
  state.pointHistory = res.data.challengePointHistory;
  picUrl.value = authenticationStore.formattedUserPic(state.userInfo);
});
</script>

<template>
  <div class="user-detail">
    <v-card>
      <v-card-title>회원 정보</v-card-title>
      <v-divider></v-divider>
      <v-img :src="picUrl" alt="profile-img" class="profile-img"></v-img>
      <v-card-title>{{ state.userInfo.name }}</v-card-title>

      <v-card-subtitle>이름</v-card-subtitle>
      <input type="text" v-model="state.userInfo.name"></input>

      <v-card-subtitle>닉네임</v-card-subtitle>
      <input type="text" v-model="state.userInfo.nickName"></input>

      <v-card-subtitle>티어</v-card-subtitle>
      <v-select :items="['브론즈', '실버', '골드', '다이아']" v-model="state.userInfo.challengeRole">{{ state.userInfo.challengeRole }}</v-select>

      <v-card-subtitle>생년월일</v-card-subtitle>
      <v-card-text>{{ formatBirthDate(state.userInfo.birthDate) }}</v-card-text>

      <v-card-subtitle>가입일자</v-card-subtitle>
      <v-card-text>{{ String(state.userInfo.createdAt).slice(0, 10) }}</v-card-text>

      <v-card-subtitle>이메일</v-card-subtitle>
      <v-card-text>{{ state.userInfo.email }}</v-card-text>

      <v-card-subtitle>성별</v-card-subtitle>
      <v-card-text>{{ state.userInfo.gender === 'F' ? '여' : '남' }}</v-card-text>

      <v-card-subtitle>전화번호</v-card-subtitle>
      <v-card-text>{{ state.userInfo.phone }}</v-card-text>

      <v-card-subtitle>회원 아이디</v-card-subtitle>
      <v-card-text>{{ state.userInfo.uid }}</v-card-text>

      <v-card-subtitle>보유 포인트</v-card-subtitle>
      <input type="text" v-model="state.userInfo.point"></input>

      <v-card-subtitle>보유 경험치</v-card-subtitle>
      <input type="text" v-model="state.userInfo.xp"></input>

      <v-card-subtitle>전화번호</v-card-subtitle>
      <v-card-text>{{ state.userInfo.phone }}</v-card-text>
      <v-card-subtitle>전화번호</v-card-subtitle>
      <v-card-text>{{ state.userInfo.phone }}</v-card-text>
      <v-card-subtitle>전화번호</v-card-subtitle>
      <v-card-text>{{ state.userInfo.phone }}</v-card-text>
    </v-card>
  </div>
</template>

<style lang="scss" scoped>
.profile-img {
  width: 100px;
}
</style>
