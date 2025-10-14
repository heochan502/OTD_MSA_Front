<script setup>
import {
  getUserData,
  getChallengeData,
  getPointData,
  getInquiryData,
  getCommunityData,
  getExerciseData,
  getMealData,
} from '@/services/admin/adminService';
import { useAuthenticationStore } from '@/stores/user/authentication';
import { computed, onMounted, reactive } from 'vue';
const auth = useAuthenticationStore();
const myRole = computed(() => auth?.state?.signedUser?.userRole ?? '');

const state = reactive({
  userData: {},
  challengeData: {},
  pointData: {},
  inquiryData: {},
  communityData: {},
  exerciseData: {},
  mealData: {},
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

  const communityRes = await getCommunityData();
  console.log('community', communityRes.data);
  state.communityData = communityRes.data;

  const exerciseRes = await getExerciseData();
  console.log('exercise', exerciseRes.data);
  state.exerciseData = exerciseRes.data;

  const mealRes = await getMealData();
  console.log('meal', mealRes.data);
  state.mealData = mealRes.data;
});

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  const h24 = d.getHours();
  const dayPeriod = h24 < 12 ? '오전' : '오후';
  const h12 = String(h24 % 12 || 12).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const sec = String(d.getSeconds()).padStart(2, '0');

  return `${y}-${m}-${day} ${dayPeriod} ${h12}:${min}:${sec}`;
};
</script>

<template>
  <v-container class="dashboard-container" fluid>
    <template v-if="myRole === 'ADMIN'">
      <h1 class="mb-6 text-h5 font-weight-bold">관리자 대시보드</h1>
      <!-- 회원 요약 -->
      <v-card class="mb-6 pa-4">
        <h2 class="section-title">회원 통계</h2>
        <v-row>
          <v-col cols="12" md="4">
            <v-sheet class="info-box">
              <div class="label">총 회원 수</div>
              <div class="value">{{ state.userData.totalUserCount }}명</div>
            </v-sheet>
          </v-col>
          <v-col cols="12" md="4">
            <v-sheet class="info-box">
              <div class="label">오늘 로그인</div>
              <div class="value">
                {{ state.userData.todayLoginUserCount }}명
              </div>
            </v-sheet>
          </v-col>
          <v-col cols="12" md="4">
            <v-sheet class="info-box">
              <div class="label">최근 가입자 (5명)</div>
              <ul>
                <li v-for="(u, i) in state.userData.recentJoinUser" :key="i">
                  {{ u.nickName }} {{ formatDate(u.createdAt) }}
                </li>
              </ul>
            </v-sheet>
          </v-col>
        </v-row>
      </v-card>

      <!-- 챌린지 요약 -->
      <v-card class="mb-6 pa-4">
        <h2 class="section-title">챌린지 통계</h2>
        <v-row>
          <v-col cols="12" md="3">
            <v-sheet class="info-box">
              <div class="label">총 챌린지 수</div>
              <div class="value">
                {{ state.challengeData.totalChallengeCount }}개
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
                  v-for="(ch, i) in state.challengeData
                    .participantTop5Challenge"
                  :key="i"
                >
                  {{ ch.cdName }} ({{ ch.cdType }}) —
                  {{ ch.cdGoal.toLocaleString() }}{{ ch.cdUnit }}
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
                  {{ ch.cdName }} ({{ ch.cdType }}) —
                  {{ ch.cdGoal.toLocaleString() }}{{ ch.cdUnit }}
                </li>
              </ul>
            </v-sheet>
          </v-col>
        </v-row>
      </v-card>

      <!-- 포인트 요약 -->
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
                  {{ p.nickName }} — {{ p.point.toLocaleString() }}P
                </li>
              </ul>
            </v-sheet>
          </v-col>
        </v-row>
      </v-card>

      <!-- ===== 커뮤니티 요약 ===== -->
      <v-card class="mb-6 pa-4">
        <h2 class="section-title">커뮤니티 통계</h2>
        <v-row>
          <v-col cols="12" md="3">
            <v-sheet class="info-box">
              <div class="label">총 게시글 수</div>
              <div class="value">
                {{ state.communityData.totalPostCount }}개
              </div>
            </v-sheet>
          </v-col>
          <v-col cols="12" md="3">
            <v-sheet class="info-box">
              <div class="label">이번 주 신규 게시글</div>
              <div class="value">
                {{ state.communityData.weeklyNewPostCount }}개
              </div>
            </v-sheet>
          </v-col>
          <v-col cols="12" md="6">
            <v-sheet class="info-box">
              <div class="label">카테고리별 게시글 수</div>
              <ul>
                <li
                  v-for="(c, i) in state.communityData.categoryPostCount"
                  :key="i"
                >
                  {{ c.categoryName }} — {{ c.count }}
                </li>
              </ul>
            </v-sheet>
          </v-col>
        </v-row>

        <v-divider class="my-4" />

        <v-row>
          <v-col cols="12" md="6">
            <v-sheet class="info-box">
              <div class="label">댓글 많은 게시글 TOP5</div>
              <ul>
                <li
                  v-for="(p, i) in state.communityData.topCommentPost"
                  :key="i"
                >
                  [{{ p.categoryName }}] {{ p.title }} — 댓글
                  {{ p.commentCount }}개
                </li>
              </ul>
            </v-sheet>
          </v-col>

          <v-col cols="12" md="6">
            <v-sheet class="info-box">
              <div class="label">좋아요 많은 게시글 TOP5</div>
              <ul>
                <li v-for="(p, i) in state.communityData.topLikePost" :key="i">
                  [{{ p.categoryName }}] {{ p.title }} — {{ p.likeCount }}개
                </li>
              </ul>
            </v-sheet>
          </v-col>
        </v-row>
      </v-card>

      <!-- 운동 요약 -->
      <v-card class="mb-6 pa-4">
        <h2 class="section-title">운동 통계</h2>
        <v-row>
          <v-col cols="12" md="4">
            <v-sheet class="info-box">
              <div class="label">총 운동 기록 수</div>
              <div class="value">
                {{ state.exerciseData.totalRecordCount }}개
              </div>
            </v-sheet>
          </v-col>

          <v-col cols="12" md="4">
            <v-sheet class="info-box">
              <div class="label">이번 주 기록 유저 수</div>
              <div class="value">
                {{ state.exerciseData.weeklyRecordUserCount }}명
              </div>
            </v-sheet>
          </v-col>

          <v-col cols="12" md="4">
            <v-sheet class="info-box">
              <div class="label">일 평균 운동 시간</div>
              <div class="value">
                {{ state.exerciseData.dailyExerciseAverage }}분
              </div>
            </v-sheet>
          </v-col>
        </v-row>
      </v-card>

      <!-- 식단 요약 -->
      <v-card class="mb-6 pa-4">
        <h2 class="section-title">식단 통계</h2>
        <v-row>
          <v-col cols="12" md="4">
            <v-sheet class="info-box">
              <div class="label">총 식단 기록 수</div>
              <div class="value">{{ state.mealData.totalRecordCount }}개</div>
            </v-sheet>
          </v-col>

          <v-col cols="12" md="4">
            <v-sheet class="info-box">
              <div class="label">이번 주 기록 유저 수</div>
              <div class="value">
                {{ state.mealData.weeklyRecordUserCount }}명
              </div>
            </v-sheet>
          </v-col>

          <v-col cols="12" md="4">
            <v-sheet class="info-box">
              <div class="label">1인당 평균 칼로리 섭취</div>
              <div class="value">{{ state.mealData.calorieAverage }}kcal</div>
            </v-sheet>
          </v-col>
        </v-row>
      </v-card>

      <!-- 문의 요약 -->
      <v-card class="mb-6 pa-4">
        <h2 class="section-title">문의 통계</h2>
        <v-row>
          <v-col cols="12" md="3">
            <v-sheet class="info-box">
              <div class="label">총 문의 수</div>
              <div class="value">
                {{ state.inquiryData.totalInquiryCount }}건
              </div>
            </v-sheet>
          </v-col>
          <v-col cols="12" md="3">
            <v-sheet class="info-box">
              <div class="label">미답변 문의</div>
              <div class="value">
                {{ state.inquiryData.unansweredInquiryCount }}건
              </div>
            </v-sheet>
          </v-col>
          <v-col cols="12" md="3">
            <v-sheet class="info-box">
              <div class="label">평균 응답시간</div>
              <div class="value">
                {{ state.inquiryData.avgRepliedTime }}시간
              </div>
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
            <li
              v-for="(inq, i) in state.inquiryData.recentInquiryList"
              :key="i"
            >
              [{{ inq.senderName }}] {{ inq.subject }}
            </li>
          </ul>
        </v-sheet>
      </v-card>
    </template>
    <template v-else>
      <h1 class="mb-6 text-h5 font-weight-bold">매니저 대시보드</h1>

      <!-- 문의 요약 -->
      <v-card class="mb-6 pa-4">
        <h2 class="section-title">문의 통계</h2>
        <v-row>
          <v-col cols="12" md="3">
            <v-sheet class="info-box">
              <div class="label">총 문의 수</div>
              <div class="value">
                {{ state.inquiryData.totalInquiryCount }}건
              </div>
            </v-sheet>
          </v-col>
          <v-col cols="12" md="3">
            <v-sheet class="info-box">
              <div class="label">미답변 문의</div>
              <div class="value">
                {{ state.inquiryData.unansweredInquiryCount }}건
              </div>
            </v-sheet>
          </v-col>
          <v-col cols="12" md="3">
            <v-sheet class="info-box">
              <div class="label">평균 응답시간</div>
              <div class="value">
                {{ state.inquiryData.avgRepliedTime }}시간
              </div>
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
            <li
              v-for="(inq, i) in state.inquiryData.recentInquiryList"
              :key="i"
            >
              [{{ inq.senderName }}] {{ inq.subject }}
            </li>
          </ul>
        </v-sheet>
      </v-card>

      <!-- ===== 커뮤니티 요약 ===== -->
      <v-card class="mb-6 pa-4">
        <h2 class="section-title">커뮤니티 통계</h2>
        <v-row>
          <v-col cols="12" md="3">
            <v-sheet class="info-box">
              <div class="label">총 게시글 수</div>
              <div class="value">
                {{ state.communityData.totalPostCount }}개
              </div>
            </v-sheet>
          </v-col>
          <v-col cols="12" md="3">
            <v-sheet class="info-box">
              <div class="label">이번 주 신규 게시글</div>
              <div class="value">
                {{ state.communityData.weeklyNewPostCount }}개
              </div>
            </v-sheet>
          </v-col>
          <v-col cols="12" md="6">
            <v-sheet class="info-box">
              <div class="label">카테고리별 게시글 수</div>
              <ul>
                <li
                  v-for="(c, i) in state.communityData.categoryPostCount"
                  :key="i"
                >
                  {{ c.categoryName }} — {{ c.count }}
                </li>
              </ul>
            </v-sheet>
          </v-col>
        </v-row>

        <v-divider class="my-4" />

        <v-row>
          <v-col cols="12" md="6">
            <v-sheet class="info-box">
              <div class="label">댓글 많은 게시글 TOP5</div>
              <ul>
                <li
                  v-for="(p, i) in state.communityData.topCommentPost"
                  :key="i"
                >
                  [{{ p.categoryName }}] {{ p.title }} — 댓글
                  {{ p.commentCount }}개
                </li>
              </ul>
            </v-sheet>
          </v-col>

          <v-col cols="12" md="6">
            <v-sheet class="info-box">
              <div class="label">좋아요 많은 게시글 TOP5</div>
              <ul>
                <li v-for="(p, i) in state.communityData.topLikePost" :key="i">
                  [{{ p.categoryName }}] {{ p.title }} — {{ p.likeCount }}개
                </li>
              </ul>
            </v-sheet>
          </v-col>
        </v-row>
      </v-card>

      <!-- 포인트 요약 -->
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
                  {{ p.nickName }} — {{ p.point.toLocaleString() }}P
                </li>
              </ul>
            </v-sheet>
          </v-col>
        </v-row>
      </v-card>

      <!-- 챌린지 요약 -->
      <v-card class="mb-6 pa-4">
        <h2 class="section-title">챌린지 통계</h2>
        <v-row>
          <v-col cols="12" md="3">
            <v-sheet class="info-box">
              <div class="label">총 챌린지 수</div>
              <div class="value">
                {{ state.challengeData.totalChallengeCount }}개
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
                  v-for="(ch, i) in state.challengeData
                    .participantTop5Challenge"
                  :key="i"
                >
                  {{ ch.cdName }} ({{ ch.cdType }}) —
                  {{ ch.cdGoal.toLocaleString() }}{{ ch.cdUnit }}
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
                  {{ ch.cdName }} ({{ ch.cdType }}) —
                  {{ ch.cdGoal.toLocaleString() }}{{ ch.cdUnit }}
                </li>
              </ul>
            </v-sheet>
          </v-col>
        </v-row>
      </v-card>

      <!-- 운동 요약 -->
      <v-card class="mb-6 pa-4">
        <h2 class="section-title">운동 통계</h2>
        <v-row>
          <v-col cols="12" md="4">
            <v-sheet class="info-box">
              <div class="label">총 운동 기록 수</div>
              <div class="value">
                {{ state.exerciseData.totalRecordCount }}개
              </div>
            </v-sheet>
          </v-col>

          <v-col cols="12" md="4">
            <v-sheet class="info-box">
              <div class="label">이번 주 기록 유저 수</div>
              <div class="value">
                {{ state.exerciseData.weeklyRecordUserCount }}명
              </div>
            </v-sheet>
          </v-col>

          <v-col cols="12" md="4">
            <v-sheet class="info-box">
              <div class="label">일 평균 운동 시간</div>
              <div class="value">
                {{ state.exerciseData.dailyExerciseAverage }}분
              </div>
            </v-sheet>
          </v-col>
        </v-row>
      </v-card>

      <!-- 식단 요약 -->
      <v-card class="mb-6 pa-4">
        <h2 class="section-title">식단 통계</h2>
        <v-row>
          <v-col cols="12" md="4">
            <v-sheet class="info-box">
              <div class="label">총 식단 기록 수</div>
              <div class="value">{{ state.mealData.totalRecordCount }}개</div>
            </v-sheet>
          </v-col>

          <v-col cols="12" md="4">
            <v-sheet class="info-box">
              <div class="label">이번 주 기록 유저 수</div>
              <div class="value">
                {{ state.mealData.weeklyRecordUserCount }}명
              </div>
            </v-sheet>
          </v-col>

          <v-col cols="12" md="4">
            <v-sheet class="info-box">
              <div class="label">1인당 평균 칼로리 섭취</div>
              <div class="value">{{ state.mealData.calorieAverage }}kcal</div>
            </v-sheet>
          </v-col>
        </v-row>
      </v-card>
    </template>
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
