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
import { useRouter } from 'vue-router';

const auth = useAuthenticationStore();
const myRole = computed(() => auth?.state?.signedUser?.userRole ?? '');
const router = useRouter();

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
  const [
    userRes,
    challengeRes,
    pointRes,
    inquiryRes,
    communityRes,
    exerciseRes,
    mealRes,
  ] = await Promise.all([
    getUserData(),
    getChallengeData(),
    getPointData(),
    getInquiryData(),
    getCommunityData(),
    getExerciseData(),
    getMealData(),
  ]);

  state.userData = userRes.data;
  state.challengeData = challengeRes.data;
  state.pointData = pointRes.data;
  state.inquiryData = inquiryRes.data;
  state.communityData = communityRes.data;
  state.exerciseData = exerciseRes.data;
  state.mealData = mealRes.data;

  console.log(
    'in',
    state.userData,
    state.challengeData,
    state.pointData,
    state.inquiryData,
    state.communityData,
    state.exerciseData,
    state.mealData
  );
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
  <div class="admin-dashboard">
    <v-card v-if="myRole === 'ADMIN'" class="data-card pa-2">
      <v-card-title
        class="d-flex justify-space-between align-center mb-4 card-title"
      >
        <span class="title">관리자 대시보드</span>
      </v-card-title>

      <!-- 2열 구조 -->
      <v-row dense>
        <!-- 회원 통계 -->
        <v-col cols="12" md="6">
          <v-card class="section-card pa-4">
            <div class="section-header">
              <h2 class="section-title">회원 통계</h2>
              <v-btn
                size="small"
                variant="text"
                color="primary"
                @click="router.push('/admin/user')"
                >더보기</v-btn
              >
            </div>
            <v-row>
              <v-col cols="6">
                <v-sheet class="info-box">
                  <div class="label">총 회원 수</div>
                  <div class="value">{{ state.userData.totalUserCount }}명</div>
                </v-sheet>
              </v-col>
              <v-col cols="6">
                <v-sheet class="info-box">
                  <div class="label">오늘 로그인 회원 수</div>
                  <div class="value">
                    {{ state.userData.todayLoginUserCount }}명
                  </div>
                </v-sheet>
              </v-col>
              <v-col cols="12">
                <v-sheet class="info-box">
                  <div class="label">최근 가입자 (5명)</div>
                  <ul>
                    <li
                      v-for="(u, i) in state.userData.recentJoinUser"
                      :key="i"
                    >
                      {{ u.nickName }} ({{ formatDate(u.createdAt) }})
                    </li>
                  </ul>
                </v-sheet>
              </v-col>
            </v-row>
          </v-card>
        </v-col>

        <!-- 챌린지 통계 -->
        <v-col cols="12" md="6">
          <v-card class="section-card pa-4">
            <div class="section-header">
              <h2 class="section-title">챌린지 통계</h2>
              <v-btn
                size="small"
                variant="text"
                color="primary"
                @click="router.push('/admin/challenge')"
                >더보기</v-btn
              >
            </div>
            <v-row>
              <v-col cols="6">
                <v-sheet class="info-box">
                  <div class="label">총 챌린지 수</div>
                  <div class="value">
                    {{ state.challengeData.totalChallengeCount }}개
                  </div>
                </v-sheet>
              </v-col>
              <v-col cols="6">
                <v-sheet class="info-box">
                  <div class="label">평균 성공률</div>
                  <div class="value">
                    {{ state.challengeData.successRate }}%
                  </div>
                </v-sheet>
              </v-col>
              <v-col cols="6">
                <v-sheet class="info-box">
                  <div class="label">참여자 수 TOP5</div>
                  <ul>
                    <li
                      v-for="(ch, i) in state.challengeData
                        .participantTop5Challenge"
                      :key="i"
                    >
                      {{ ch.cdName }} ({{ ch.cdType }})
                    </li>
                  </ul>
                </v-sheet>
              </v-col>
              <v-col cols="6">
                <v-sheet class="info-box">
                  <div class="label">실패율 TOP5</div>
                  <ul>
                    <li
                      v-for="(ch, i) in state.challengeData.failTop3Challenge"
                      :key="i"
                    >
                      {{ ch.cdName }} ({{ ch.cdType }})
                    </li>
                  </ul>
                </v-sheet>
              </v-col>
            </v-row>
          </v-card>
        </v-col>

        <!-- 커뮤니티 통계 -->
        <v-col cols="12" md="9">
          <v-card class="section-card pa-4">
            <div class="section-header">
              <h2 class="section-title">커뮤니티 통계</h2>
              <v-btn
                size="small"
                variant="text"
                color="primary"
                @click="router.push('/admin/community')"
                >더보기</v-btn
              >
            </div>
            <v-row>
              <v-col cols="4">
                <v-sheet class="info-box">
                  <div class="label">총 게시글 수</div>
                  <div class="value">
                    {{ state.communityData.totalPostCount }}개
                  </div>
                </v-sheet>
              </v-col>
              <v-col cols="4">
                <v-sheet class="info-box">
                  <div class="label">이번 주 신규 게시글 수</div>
                  <div class="value">
                    {{ state.communityData.weeklyNewPostCount }}개
                  </div>
                </v-sheet>
              </v-col>
              <v-col cols="4">
                <v-sheet class="info-box">
                  <div class="label">카테고리별 게시글 수</div>
                  <ul>
                    <li
                      v-for="(c, i) in state.communityData.categoryPostCount"
                      :key="i"
                    >
                      {{ c.categoryName }} : {{ c.count }}
                    </li>
                  </ul>
                </v-sheet>
              </v-col>
              <v-col cols="6">
                <v-sheet class="info-box">
                  <div class="label">좋아요 수 Top5 게시글</div>
                  <ul>
                    <li
                      v-for="(c, i) in state.communityData.topCommentPost"
                      :key="i"
                    >
                      [{{ c.categoryName }}] : {{ c.title }}
                    </li>
                  </ul>
                </v-sheet>
              </v-col>
              <v-col cols="6">
                <v-sheet class="info-box">
                  <div class="label">댓글 수 Top5 게시글</div>
                  <ul>
                    <li
                      v-for="(c, i) in state.communityData.topLikePost"
                      :key="i"
                    >
                      [{{ c.categoryName }}] : {{ c.title }}
                    </li>
                  </ul>
                </v-sheet>
              </v-col>
            </v-row>
          </v-card>
        </v-col>

        <!-- 포인트 통계 -->
        <v-col cols="12" md="3">
          <v-card class="section-card pa-4">
            <div class="section-header">
              <h2 class="section-title">포인트 통계</h2>
              <v-btn
                size="small"
                variant="text"
                color="primary"
                @click="router.push('/admin/point')"
                >더보기</v-btn
              >
            </div>
            <v-row>
              <v-col cols="12">
                <v-sheet class="info-box">
                  <div class="label">누적 지급 포인트</div>
                  <div class="value">
                    {{ state.pointData.totalPoint?.toLocaleString() || 0 }}P
                  </div>
                </v-sheet>
              </v-col>
              <v-col cols="12">
                <v-sheet class="info-box">
                  <div class="label">Top5 사용자</div>
                  <ul>
                    <li
                      v-for="(p, i) in state.pointData.pointTop5User"
                      :key="i"
                    >
                      {{ p.nickName }} : {{ p.point.toLocaleString() }}P
                    </li>
                  </ul>
                </v-sheet>
              </v-col>
            </v-row>
          </v-card>
        </v-col>

        <!-- 운동 / 식단 -->
        <v-col cols="12" md="6">
          <v-card class="section-card pa-4">
            <div class="section-header">
              <h2 class="section-title">운동 통계</h2>
              <v-btn
                size="small"
                variant="text"
                color="primary"
                @click="router.push('/admin/exercise')"
                >더보기</v-btn
              >
            </div>
            <v-row>
              <v-col cols="4">
                <v-sheet class="info-box">
                  <div class="label">누적 운동기록</div>
                  <div class="value">
                    {{ state.exerciseData.totalRecordCount }}개
                  </div>
                </v-sheet>
              </v-col>
              <v-col cols="4">
                <v-sheet class="info-box">
                  <div class="label">이번 주 기록 회원</div>
                  <div class="value">
                    {{ state.exerciseData.weeklyRecordUserCount }}명
                  </div>
                </v-sheet>
              </v-col>
              <v-col cols="4">
                <v-sheet class="info-box">
                  <div class="label">일일 평균 운동시간</div>
                  <div class="value">
                    {{ state.exerciseData.dailyExerciseAverage }}분
                  </div>
                </v-sheet>
              </v-col>
            </v-row>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="section-card pa-4">
            <div class="section-header">
              <h2 class="section-title">식단 통계</h2>
              <v-btn variant="text" @click="router.push('/admin/meal')"
                >더보기</v-btn
              >
            </div>
            <v-row>
              <v-col cols="4">
                <v-sheet class="info-box">
                  <div class="label">누적 식단기록</div>
                  <div class="value">
                    {{ state.mealData.totalRecordCount }}개
                  </div>
                </v-sheet>
              </v-col>
              <v-col cols="4">
                <v-sheet class="info-box">
                  <div class="label">이번 주 식단기록 회원</div>
                  <div class="value">
                    {{ state.mealData.weeklyRecordUserCount }}명
                  </div>
                </v-sheet>
              </v-col>
              <v-col cols="4">
                <v-sheet class="info-box">
                  <div class="label">일일 평균 칼로리 섭취량</div>
                  <div class="value">
                    {{ state.mealData.calorieAverage }}kcal
                  </div>
                </v-sheet>
              </v-col>
            </v-row>
          </v-card>
        </v-col>

        <!-- 문의 -->
        <v-col cols="12" md="12">
          <v-card class="section-card pa-4">
            <div class="section-header">
              <h2 class="section-title">문의 통계</h2>
              <v-btn
                size="small"
                variant="text"
                color="primary"
                @click="router.push('/admin/qna')"
                >더보기</v-btn
              >
            </div>
            <v-row>
              <v-col cols="3">
                <v-sheet class="info-box">
                  <div class="label">총 문의 건</div>
                  <div class="value">
                    {{ state.inquiryData.totalInquiryCount }}건
                  </div>
                </v-sheet>
              </v-col>
              <v-col cols="3">
                <v-sheet class="info-box">
                  <div class="label">미답변 건</div>
                  <div class="value">
                    {{ state.inquiryData.unansweredInquiryCount }}건
                  </div>
                </v-sheet>
              </v-col>
              <v-col cols="3">
                <v-sheet class="info-box">
                  <div class="label">문의 답변율</div>
                  <div class="value">{{ state.inquiryData.responseRate }}%</div>
                </v-sheet>
              </v-col>
              <v-col cols="3">
                <v-sheet class="info-box">
                  <div class="label">평균 답변 시간</div>
                  <div class="value">
                    {{ state.inquiryData.avgRepliedTime }}%
                  </div>
                </v-sheet>
              </v-col>
              <v-col cols="12">
                <v-sheet class="info-box">
                  <div class="label">최근 문의 건</div>
                  <ul>
                    <li
                      v-for="(inq, i) in state.inquiryData.recentInquiryList"
                      :key="i"
                    >
                      [{{ inq.senderName }}] {{ inq.subject }}
                    </li>
                  </ul>
                </v-sheet>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-card>

    <v-card v-else class="data-card pa-2">
      <v-card-title
        class="d-flex justify-space-between align-center mb-4 card-title"
      >
        <span class="title">매니저 대시보드</span>
      </v-card-title>

      <!-- 2열 구조 -->
      <v-row dense>
        <!-- 문의 -->
        <v-col cols="12" md="12">
          <v-card class="section-card pa-4">
            <div class="section-header">
              <h2 class="section-title">문의 통계</h2>
              <v-btn
                size="small"
                variant="text"
                color="primary"
                @click="router.push('/admin/qna')"
                >더보기</v-btn
              >
            </div>
            <v-row>
              <v-col cols="3">
                <v-sheet class="info-box">
                  <div class="label">총 문의 건</div>
                  <div class="value">
                    {{ state.inquiryData.totalInquiryCount }}건
                  </div>
                </v-sheet>
              </v-col>
              <v-col cols="3">
                <v-sheet class="info-box">
                  <div class="label">미답변 건</div>
                  <div class="value">
                    {{ state.inquiryData.unansweredInquiryCount }}건
                  </div>
                </v-sheet>
              </v-col>
              <v-col cols="3">
                <v-sheet class="info-box">
                  <div class="label">문의 답변율</div>
                  <div class="value">{{ state.inquiryData.responseRate }}%</div>
                </v-sheet>
              </v-col>
              <v-col cols="3">
                <v-sheet class="info-box">
                  <div class="label">평균 답변 시간</div>
                  <div class="value">
                    {{ state.inquiryData.avgRepliedTime }}%
                  </div>
                </v-sheet>
              </v-col>
              <v-col cols="12">
                <v-sheet class="info-box">
                  <div class="label">최근 문의 건</div>
                  <ul>
                    <li
                      v-for="(inq, i) in state.inquiryData.recentInquiryList"
                      :key="i"
                    >
                      [{{ inq.senderName }}] {{ inq.subject }}
                    </li>
                  </ul>
                </v-sheet>
              </v-col>
            </v-row>
          </v-card>
        </v-col>

        <!-- 커뮤니티 통계 -->
        <v-col cols="12" md="9">
          <v-card class="section-card pa-4">
            <div class="section-header">
              <h2 class="section-title">커뮤니티 통계</h2>
              <v-btn
                size="small"
                variant="text"
                color="primary"
                @click="router.push('/admin/community')"
                >더보기</v-btn
              >
            </div>
            <v-row>
              <v-col cols="4">
                <v-sheet class="info-box">
                  <div class="label">총 게시글 수</div>
                  <div class="value">
                    {{ state.communityData.totalPostCount }}개
                  </div>
                </v-sheet>
              </v-col>
              <v-col cols="4">
                <v-sheet class="info-box">
                  <div class="label">이번 주 신규 게시글 수</div>
                  <div class="value">
                    {{ state.communityData.weeklyNewPostCount }}개
                  </div>
                </v-sheet>
              </v-col>
              <v-col cols="4">
                <v-sheet class="info-box">
                  <div class="label">카테고리별 게시글 수</div>
                  <ul>
                    <li
                      v-for="(c, i) in state.communityData.categoryPostCount"
                      :key="i"
                    >
                      {{ c.categoryName }} : {{ c.count }}
                    </li>
                  </ul>
                </v-sheet>
              </v-col>
              <v-col cols="6">
                <v-sheet class="info-box">
                  <div class="label">좋아요 수 Top5 게시글</div>
                  <ul>
                    <li
                      v-for="(c, i) in state.communityData.topCommentPost"
                      :key="i"
                    >
                      [{{ c.categoryName }}] : {{ c.title }}
                    </li>
                  </ul>
                </v-sheet>
              </v-col>
              <v-col cols="6">
                <v-sheet class="info-box">
                  <div class="label">댓글 수 Top5 게시글</div>
                  <ul>
                    <li
                      v-for="(c, i) in state.communityData.topLikePost"
                      :key="i"
                    >
                      [{{ c.categoryName }}] : {{ c.title }}
                    </li>
                  </ul>
                </v-sheet>
              </v-col>
            </v-row>
          </v-card>
        </v-col>

        <!-- 챌린지 통계 -->
        <v-col cols="12" md="6">
          <v-card class="section-card pa-4">
            <div class="section-header">
              <h2 class="section-title">챌린지 통계</h2>
              <v-btn
                size="small"
                variant="text"
                color="primary"
                @click="router.push('/admin/challenge')"
                >더보기</v-btn
              >
            </div>
            <v-row>
              <v-col cols="6">
                <v-sheet class="info-box">
                  <div class="label">총 챌린지 수</div>
                  <div class="value">
                    {{ state.challengeData.totalChallengeCount }}개
                  </div>
                </v-sheet>
              </v-col>
              <v-col cols="6">
                <v-sheet class="info-box">
                  <div class="label">평균 성공률</div>
                  <div class="value">
                    {{ state.challengeData.successRate }}%
                  </div>
                </v-sheet>
              </v-col>
              <v-col cols="6">
                <v-sheet class="info-box">
                  <div class="label">참여자 수 TOP5</div>
                  <ul>
                    <li
                      v-for="(ch, i) in state.challengeData
                        .participantTop5Challenge"
                      :key="i"
                    >
                      {{ ch.cdName }} ({{ ch.cdType }})
                    </li>
                  </ul>
                </v-sheet>
              </v-col>
              <v-col cols="6">
                <v-sheet class="info-box">
                  <div class="label">실패율 TOP5</div>
                  <ul>
                    <li
                      v-for="(ch, i) in state.challengeData.failTop3Challenge"
                      :key="i"
                    >
                      {{ ch.cdName }} ({{ ch.cdType }})
                    </li>
                  </ul>
                </v-sheet>
              </v-col>
            </v-row>
          </v-card>
        </v-col>

        <!-- 운동 / 식단 -->
        <v-col cols="12" md="6">
          <v-card class="section-card pa-4">
            <div class="section-header">
              <h2 class="section-title">운동 통계</h2>
              <v-btn
                size="small"
                variant="text"
                color="primary"
                @click="router.push('/admin/exercise')"
                >더보기</v-btn
              >
            </div>
            <v-row>
              <v-col cols="4">
                <v-sheet class="info-box">
                  <div class="label">누적 운동기록</div>
                  <div class="value">
                    {{ state.exerciseData.totalRecordCount }}개
                  </div>
                </v-sheet>
              </v-col>
              <v-col cols="4">
                <v-sheet class="info-box">
                  <div class="label">이번 주 기록 회원</div>
                  <div class="value">
                    {{ state.exerciseData.weeklyRecordUserCount }}명
                  </div>
                </v-sheet>
              </v-col>
              <v-col cols="4">
                <v-sheet class="info-box">
                  <div class="label">일일 평균 운동시간</div>
                  <div class="value">
                    {{ state.exerciseData.dailyExerciseAverage }}분
                  </div>
                </v-sheet>
              </v-col>
            </v-row>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="section-card pa-4">
            <div class="section-header">
              <h2 class="section-title">식단 통계</h2>
              <v-btn variant="text" @click="router.push('/admin/meal')"
                >더보기</v-btn
              >
            </div>
            <v-row>
              <v-col cols="4">
                <v-sheet class="info-box">
                  <div class="label">누적 식단기록</div>
                  <div class="value">
                    {{ state.mealData.totalRecordCount }}개
                  </div>
                </v-sheet>
              </v-col>
              <v-col cols="4">
                <v-sheet class="info-box">
                  <div class="label">이번 주 식단기록 회원</div>
                  <div class="value">
                    {{ state.mealData.weeklyRecordUserCount }}명
                  </div>
                </v-sheet>
              </v-col>
              <v-col cols="4">
                <v-sheet class="info-box">
                  <div class="label">일일 평균 칼로리 섭취량</div>
                  <div class="value">
                    {{ state.mealData.calorieAverage }}kcal
                  </div>
                </v-sheet>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<style lang="scss" scoped>
// 메인 컨테이너
.admin-dashboard {
  padding: 12px;
  .title {
    font-weight: 700;
    font-size: 23px;
  }
  .data-card {
    background: #fff;
    border-radius: 15px;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
  }
}

.card-title {
  border-bottom: 1px solid #eee;
  padding-bottom: 6px;
  margin-bottom: 18px;
}

// 2열 카드 구성
.section-card {
  border-radius: 12px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #ececec;
  transition: all 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
  }
}

// 제목 + 더보기 버튼 라인
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .section-title {
    font-weight: 700;
    font-size: 18px;
    color: #222;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 0;
      width: 100%;
      height: 3px;
      border-radius: 2px;
      background-color: #5ee6eb;
    }
  }

  .v-btn {
    color: #5ee6eb !important;
    font-weight: 600 !important;
    text-transform: none !important;
    font-size: 1rem !important;
  }
}

// 데이터 박스
.v-sheet.info-box {
  background-color: #fff;
  border-radius: 12px;
  border: 1px solid #eee;
  padding: 14px 18px;
  transition: all 0.2s ease;
  height: 100%;

  &:hover {
    border-color: #5ee6eb;
    box-shadow: 0 3px 10px rgba(94, 230, 235, 0.2);
  }

  .label {
    font-weight: 600;
    font-size: 14px;
    color: #555;
    margin-bottom: 4px;
  }

  .value {
    font-weight: 700;
    font-size: 20px;
    color: #333;
  }

  ul {
    margin-top: 6px;
    padding-left: 16px;
    li {
      font-size: 14px;
      color: #555;
      line-height: 1.5;
      position: relative;
      padding-left: 6px;
      &::before {
        content: '-';
        position: absolute;
        left: -10px;
        color: #5ee6eb;
        font-weight: bold;
      }
    }
  }
}
</style>
