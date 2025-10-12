<script setup>
import {
  getUserData,
  getChallengeData,
  getPointData,
  getInquiryData,
} from '@/services/admin/adminService';
import { onMounted, reactive } from 'vue';

const state = reactive({
  userData: {},
  challengeData: {},
  pointData: {},
  inquiryData: {},
});
onMounted(async () => {
  const userRes = await getUserData();
  console.log('userRes', userRes.data);
  state.userData = userRes.data;
  const challengeRes = await getChallengeData();
  console.log('challengeRes', challengeRes.data);
  state.challengeData = challengeRes.data;
  const pointRes = await getPointData();
  console.log('pointRes', pointRes.data);
  state.pointData = pointRes.data;
  const inquiryRes = await getInquiryData();
  console.log('inquiryRes', inquiryRes.data);
  state.inquiryData = inquiryRes.data;
});

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleString('ko-KR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
</script>

<template>
  <v-container class="dashboard-container" fluid>
    <h1 class="mb-6 text-h5 font-weight-bold">관리자 대시보드</h1>

    <!-- ===== 회원 요약 ===== -->
    <v-card class="mb-6 pa-4">
      <h2 class="section-title">회원 통계</h2>
      <v-row>
        <v-col cols="12" md="4">
          <v-sheet class="info-box">
            <div class="label">총 회원 수</div>
            <div class="value">{{ state.userData.totalUserCount }}</div>
          </v-sheet>
        </v-col>
        <v-col cols="12" md="4">
          <v-sheet class="info-box">
            <div class="label">오늘 로그인</div>
            <div class="value">{{ state.userData.todayLoginUserCount }}</div>
          </v-sheet>
        </v-col>
        <v-col cols="12" md="4">
          <v-sheet class="info-box">
            <div class="label">최근 가입자 (5명)</div>
            <ul>
              <li v-for="(u, i) in state.userData.recentJoinUser" :key="i">
                {{ u.userId }}번 · {{ formatDate(u.createdAt) }}
              </li>
            </ul>
          </v-sheet>
        </v-col>
      </v-row>
    </v-card>

    <!-- ===== 챌린지 요약 ===== -->
    <v-card class="mb-6 pa-4">
      <h2 class="section-title">챌린지 통계</h2>
      <v-row>
        <v-col cols="12" md="3">
          <v-sheet class="info-box">
            <div class="label">총 챌린지 수</div>
            <div class="value">
              {{ state.challengeData.totalChallengeCount }}
            </div>
          </v-sheet>
        </v-col>
        <v-col cols="12" md="3">
          <v-sheet class="info-box">
            <div class="label">평균 성공률</div>
            <div class="value">{{ state.challengeData.successRate }}%</div>
          </v-sheet>
        </v-col>
        <v-col cols="12" md="6">
          <v-sheet class="info-box">
            <div class="label">참여자 수 TOP5</div>
            <ul>
              <li
                v-for="(ch, i) in state.challengeData.participantTop5Challenge"
                :key="i"
              >
                {{ ch.cdName }} ({{ ch.cdType }}) — {{ ch.cdGoal }}
              </li>
            </ul>
          </v-sheet>
        </v-col>
      </v-row>
      <v-divider class="my-4" />
      <v-row>
        <v-col cols="12" md="6">
          <v-sheet class="info-box">
            <div class="label">실패율 높은 TOP3</div>
            <ul>
              <li
                v-for="(ch, i) in state.challengeData.failTop3Challenge"
                :key="i"
              >
                {{ ch.cdName }} ({{ ch.cdType }}) — {{ ch.cdGoal }}
              </li>
            </ul>
          </v-sheet>
        </v-col>
      </v-row>
    </v-card>

    <!-- ===== 포인트 요약 ===== -->
    <v-card class="mb-6 pa-4">
      <h2 class="section-title">포인트 통계</h2>
      <v-row>
        <v-col cols="12" md="4">
          <v-sheet class="info-box">
            <div class="label">총 포인트</div>
            <div class="value">
              {{ state.pointData.totalPoint?.toLocaleString() || 0 }}
            </div>
          </v-sheet>
        </v-col>
        <v-col cols="12" md="8">
          <v-sheet class="info-box">
            <div class="label">포인트 Top 5 사용자</div>
            <ul>
              <li v-for="(p, i) in state.pointData.pointTop5User" :key="i">
                {{ p.nickName }} — {{ p.point }}P
              </li>
            </ul>
          </v-sheet>
        </v-col>
      </v-row>
    </v-card>

    <!-- ===== 문의 요약 ===== -->
    <v-card class="mb-6 pa-4">
      <h2 class="section-title">문의 통계</h2>
      <v-row>
        <v-col cols="12" md="3">
          <v-sheet class="info-box">
            <div class="label">총 문의 수</div>
            <div class="value">{{ state.inquiryData.totalInquiryCount }}</div>
          </v-sheet>
        </v-col>
        <v-col cols="12" md="3">
          <v-sheet class="info-box">
            <div class="label">미답변 문의</div>
            <div class="value">
              {{ state.inquiryData.unansweredInquiryCount }}
            </div>
          </v-sheet>
        </v-col>
        <v-col cols="12" md="3">
          <v-sheet class="info-box">
            <div class="label">평균 응답시간</div>
            <div class="value">{{ state.inquiryData.avgRepliedTime }}시간</div>
          </v-sheet>
        </v-col>
        <v-col cols="12" md="3">
          <v-sheet class="info-box">
            <div class="label">답변 처리율</div>
            <div class="value">{{ state.inquiryData.responseRate }}%</div>
          </v-sheet>
        </v-col>
      </v-row>

      <v-divider class="my-4" />

      <v-sheet class="info-box">
        <div class="label">최근 문의 TOP5</div>
        <ul>
          <li v-for="(inq, i) in state.inquiryData.recentInquiryList" :key="i">
            [{{ inq.senderName }}] {{ inq.subject }}
          </li>
        </ul>
      </v-sheet>
    </v-card>
  </v-container>
</template>

<style lang="scss">
.dashboard-container {
  background-color: #fafafa;
}

.section-title {
  font-weight: 600;
  margin-bottom: 12px;
}

.info-box {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.label {
  font-weight: 500;
  font-size: 14px;
  color: #666;
}

.value {
  font-weight: bold;
  font-size: 22px;
  margin-top: 6px;
}
</style>
