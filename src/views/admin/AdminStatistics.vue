<script setup>
import {
  getUserStatistics,
  getChallengeStatistics,
  getInquiryStatistics,
  getCommunityStatistics,
  getExerciseStatistics,
  getMealStatistics,
} from '@/services/admin/adminService';
import { onMounted, ref, reactive } from 'vue';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import { Pie, Bar, Line } from 'vue-chartjs';
import ChartDataLabels from 'chartjs-plugin-datalabels';
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
  // ChartDataLabels
);

const state = reactive({
  // 유저
  genderChartData: {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
        borderWidth: 0,
      },
    ],
  },
  ageChartData: {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
        borderWidth: 0,
      },
    ],
  },
  signInChartData: {
    labels: [],
    datasets: [
      {
        data: [],
        pointRadius: 0,
      },
    ],
  },

  // 챌린지
  tierChartData: {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
        borderWidth: 0,
      },
    ],
  },
  challengeRateChartData: {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
        borderRadius: 0,
      },
    ],
  },

  // 커뮤니티
  postChartData: { labels: [], datasets: [{ data: [] }] },
  CategoryPostChartData: { labels: [], datasets: [{ data: [] }] },

  // 운동
  exerciseRecordChartData: { labels: [], datasets: [{ data: [] }] },
  exerciseTypeRecordChartData: { labels: [], datasets: [{ data: [] }] },
  exerciseDistributionChartData: { labels: [], datasets: [{ data: [] }] },

  // 식단
  mealRecordChartData: { labels: [], datasets: [{ data: [] }] },
  mealMacroAverageChartData: { labels: [], datasets: [{ data: [] }] },
});

// 퍼센트 계산용 원형차트 툴팁 콜백 함수 (마지막 조각 보정)
const makePercentLabel = (context) => {
  const values = context.dataset.data.map(Number);
  const total = values.reduce((a, b) => a + b, 0);
  const value = Number(context.raw);

  if (!total) return `${context.label}: 0명 (0%)`;

  // 소수점 한 자리 반올림
  const round1 = (n) => Math.round(n * 10) / 10;

  let pct = (value / total) * 100;

  // 마지막 조각은 합계를 100%로 맞추도록 보정
  if (context.dataIndex === values.length - 1) {
    const prevSum = values
      .slice(0, -1)
      .map((v) => round1((v / total) * 100))
      .reduce((a, b) => a + b, 0);
    pct = 100 - prevSum;
  } else {
    pct = round1(pct);
  }

  return `${context.label}: ${value}명 (${pct.toFixed(1)}%)`;
};

// 원형차트 옵션
const pieCommonOption = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { color: '#333', font: { size: 14 } },
    },
    tooltip: {
      enabled: true,
      callbacks: { label: makePercentLabel },
    },
  },
};

// 바차트 옵션
const barCommonOption = {
  responsive: true,

  plugins: {
    legend: { display: false },
    title: {
      display: true,
      font: { size: 18, weight: 'bold' },
      color: '#222',
    },
    tooltip: {
      enabled: true,
      callbacks: {
        label: (context) => {
          return `${context.parsed.y}%`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        color: '#555',
        font: { size: 13, weight: '500' },
      },
      // 막대 너비 조정
      categoryPercentage: 0.6,
      barPercentage: 0.8,
    },
    y: {
      beginAtZero: true,
      max: 100,
      grid: {
        color: '#eee',
      },
      ticks: {
        color: '#555',
        font: { size: 12 },
        callback: (value) => `${value}%`,
        stepSize: 20,
      },
    },
  },
};

// 라인차트 옵션
const lineCommonOption = {
  responsive: true,

  plugins: {
    legend: { display: false },
    title: { display: false },
    tooltip: {
      enabled: true,
      callbacks: {
        label: (context) => {
          return `${context.parsed.y}명`;
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true, // y축 0부터 시작
      ticks: {
        stepSize: 10,
        callback: (value) => `${value}명`,
      },
    },
  },
  layout: {
    padding: {
      top: 20, // 차트 위쪽 여백 확보
      bottom: 0,
      left: 0,
      right: 0,
    },
  },
};

onMounted(async () => {
  getUser();
  getChallenge();
  getInquiry();
  getCommunity();
  getExercise();
  getMeal();
});

// 유저 통계 데이터 세팅
const getUser = async () => {
  const res = await getUserStatistics();
  console.log('user', res.data);

  // 성별 비율 통계
  const genderData = Array.isArray(res.data.genderCount)
    ? res.data.genderCount
    : [];

  const male = Number(genderData.find((g) => g.gender === 'M')?.count ?? 0);
  const female = Number(genderData.find((g) => g.gender === 'F')?.count ?? 0);

  state.genderChartData = {
    labels: ['남성', '여성'],
    datasets: [
      {
        data: [male, female],
        backgroundColor: ['#36A2EB', '#FF6384'],
        borderWidth: 1,
      },
    ],
  };

  // 연령대 분포 통계
  const ageData = (
    Array.isArray(res.data.ageCount) ? res.data.ageCount : []
  ).map((d) => ({
    ageGroup: d.ageGroup,
    count: Number(d.count),
  }));

  state.ageChartData = {
    labels: ageData.map((d) => d.ageGroup),
    datasets: [
      {
        data: ageData.map((d) => d.count),
        backgroundColor: [
          '#4fc3f7',
          '#81c784',
          '#ffb74d',
          '#e57373',
          '#9575cd',
          '#b0bec5',
        ],
      },
    ],
  };

  // 월별 가입자 추이 통계
  const signInData = (
    Array.isArray(res.data.signInCount) ? res.data.signInCount : []
  ).map((d) => ({
    month: d.month ?? '기타',
    signInCount: Number(d.signInCount ?? 0),
  }));

  state.signInChartData = {
    labels: signInData.map((d) => d.month),
    datasets: [
      {
        data: signInData.map((d) => d.signInCount),
        borderColor: '#42a5f5',
        backgroundColor: '#bbdefb',
        borderWidth: 2,
        fill: true,
      },
    ],
  };
};
// 챌린지 통계 데이터 세팅
const getChallenge = async () => {
  const res = await getChallengeStatistics();
  console.log('challenge', res.data);

  // 챌린지 티어 분포
  const tierData = (
    Array.isArray(res.data.tierCount) ? res.data.tierCount : []
  ).map((d) => ({
    tier: d.tier ?? '기타',
    count: Number(d.count ?? 0),
  }));

  state.tierChartData = {
    labels: tierData.map((d) => d.tier),
    datasets: [
      {
        data: tierData.map((d) => d.count),
        backgroundColor: [
          '#c08a4d',
          '#bfc7ce',
          '#f6c453',
          '#4db6e2',
          '#f28379',
        ],
        borderWidth: 1,
      },
    ],
  };

  // 챌린지 타입별 성공률
  const challengeRateData = (
    Array.isArray(res.data.challengeSuccessRateCount)
      ? res.data.challengeSuccessRateCount
      : []
  ).map((d) => ({
    challengeType: d.challengeType ?? '기타',
    successRate: Number(d.successRate ?? 0),
  }));

  state.challengeRateChartData = {
    labels: challengeRateData.map((d) => d.challengeType),
    datasets: [
      {
        data: challengeRateData.map((d) => d.successRate),
        backgroundColor: [
          '#4db6e2',
          '#81c784',
          '#f6c453',
          '#f28379',
          '#9575cd',
        ],
        borderWidth: 1,
      },
    ],
  };
};

// 커뮤니티 통계 데이터 세팅
const getCommunity = async () => {
  const res = await getCommunityStatistics();
  console.log('community', res.data);

  // 게시글 추이
  const postData = Array.isArray(res.data.postCount) ? res.data.postCount : [];
  state.postChartData = {
    labels: postData.map((p) => p.month),
    datasets: [
      {
        data: postData.map((p) => Number(p.postCount)),
        borderColor: '#42a5f5',
        backgroundColor: '#bbdefb',
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  // 카테고리별 게시글 수
  const catData = Array.isArray(res.data.categoryPostCount)
    ? res.data.categoryPostCount
    : [];
  state.CategoryPostChartData = {
    labels: catData.map((c) => c.categoryName),
    datasets: [
      {
        data: catData.map((c) => Number(c.count)),
        backgroundColor: ['#4db6e2', '#81c784', '#ffb74d', '#f06292'],
      },
    ],
  };
};

// 운동 통계 데이터 세팅
const getExercise = async () => {
  const res = await getExerciseStatistics();
  console.log('exercise', res.data);

  // 월별 운동 기록 추이
  const monthData = Array.isArray(res.data.exerciseRecordCountResList)
    ? res.data.exerciseRecordCountResList
    : [];
  state.exerciseRecordChartData = {
    labels: monthData.map((d) => d.month),
    datasets: [
      {
        data: monthData.map((d) => Number(d.recordCount)),
        borderColor: '#66bb6a',
        backgroundColor: '#c8e6c9',
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  // 종목별 운동 수
  const typeData = Array.isArray(res.data.exerciseNameRecordCountResList)
    ? res.data.exerciseNameRecordCountResList
    : [];
  state.exerciseTypeRecordChartData = {
    labels: typeData.map((d) => d.exerciseName),
    datasets: [
      {
        data: typeData.map((d) => Number(d.recordCount)),
        backgroundColor: '#81c784',
      },
    ],
  };

  // 시간대별 운동 분포
  const timeData = Array.isArray(res.data.exerciseDistributionCountResList)
    ? res.data.exerciseDistributionCountResList
    : [];
  state.exerciseDistributionChartData = {
    labels: timeData.map((d) => d.timeRange),
    datasets: [
      {
        data: timeData.map((d) => Number(d.count)),
        backgroundColor: ['#aed581', '#4fc3f7', '#ba68c8', '#ffb74d'],
      },
    ],
  };
};

// 식단 통계 데이터 세팅
const getMeal = async () => {
  const res = await getMealStatistics();
  console.log('meal', res.data);

  // 식단 기록 추이
  const mealTrend = Array.isArray(res.data.mealRecordCount)
    ? res.data.mealRecordCount
    : [];
  state.mealRecordChartData = {
    labels: mealTrend.map((m) => m.month),
    datasets: [
      {
        data: mealTrend.map((m) => Number(m.recordCount)),
        borderColor: '#42a5f5',
        backgroundColor: '#bbdefb',
        fill: true,
        borderWidth: 2,
      },
    ],
  };

  // 탄단지 평균 섭취량
  const macro = res.data.mealMacroAverage ?? {};
  state.mealMacroAverageChartData = {
    labels: ['탄수화물', '단백질', '지방'],
    datasets: [
      {
        data: [
          Number(macro.averageCarbohydrate ?? 0),
          Number(macro.averageProtein ?? 0),
          Number(macro.averageFat ?? 0),
        ],
        backgroundColor: ['#81c784', '#64b5f6', '#ffb74d'],
      },
    ],
  };
};

// 문의 통계 데이터 세팅
const getInquiry = async () => {
  const res = await getInquiryStatistics();
  console.log('inquiry', res.data);
};
</script>

<template>
  <div class="chart-wrap">
    <div class="chart-group">
      <h3 class="title">사용자 성별</h3>
      <Pie
        :data="state.genderChartData"
        :options="pieCommonOption"
        class="pie"
      />
    </div>

    <div class="chart-group">
      <h3 class="title">사용자 연령대</h3>
      <Pie :data="state.ageChartData" :options="pieCommonOption" class="pie" />
    </div>

    <div class="chart-group">
      <h3 class="title">사용자 챌린지 티어</h3>
      <Pie :data="state.tierChartData" :options="pieCommonOption" class="pie" />
    </div>

    <div class="chart-group">
      <h3 class="title">챌린지별 성공률</h3>
      <Bar
        :data="state.challengeRateChartData"
        :options="barCommonOption"
        class="bar"
      />
    </div>

    <div class="chart-group">
      <h3 class="title">최근 6개월 회원가입 추이</h3>
      <Line
        :data="state.signInChartData"
        :options="lineCommonOption"
        class="line"
      />
    </div>

    <div class="chart-group">
      <h3 class="title">게시글 추이</h3>
      <Line
        :data="state.postChartData"
        :options="lineCommonOption"
        class="bar"
      />
    </div>

    <div class="chart-group">
      <h3 class="title">카테고리별 게시글 수</h3>
      <Pie
        :data="state.CategoryPostChartData"
        :options="pieCommonOption"
        class="pie"
      />
    </div>

    <div class="chart-group">
      <h3 class="title">운동 기록 추이</h3>
      <Line
        :data="state.exerciseRecordChartData"
        :options="lineCommonOption"
        class="line"
      />
    </div>

    <div class="chart-group">
      <h3 class="title">운동 종목별 기록 수</h3>
      <Bar
        :data="state.exerciseTypeRecordChartData"
        :options="barCommonOption"
        class="bar"
      />
    </div>

    <div class="chart-group">
      <h3 class="title">시간대별 운동 분포</h3>
      <Pie
        :data="state.exerciseDistributionChartData"
        :options="pieCommonOption"
        class="pie"
      />
    </div>

    <div class="chart-group">
      <h3 class="title">식단 기록 추이</h3>
      <Line
        :data="state.mealRecordChartData"
        :options="lineCommonOption"
        class="line"
      />
    </div>

    <div class="chart-group">
      <h3 class="title">탄단지 평균 섭취량</h3>
      <Bar
        :data="state.mealMacroAverageChartData"
        :options="barCommonOption"
        class="bar"
      />
    </div>
  </div>
</template>

<style lang="scss">
.chart-wrap {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.chart-group {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  padding: 24px 32px;
  max-width: 1100px;

  .pie {
    width: 100% !important;
    max-width: 250px;
    height: 250px !important;
  }

  .bar {
    width: 100% !important;
    max-width: 600px;
    height: 250px !important;
  }

  .line {
    width: 100% !important;
    max-width: 600px;
    height: 250px !important;
  }

  .title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 20px;
    color: #333;
    text-align: center;
  }
}
</style>
