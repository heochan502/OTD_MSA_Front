<script setup>
import {
  getUserStatistics,
  getChallengeStatistics,
  getInquiryStatistics,
  getCommunityStatistics,
  getExerciseStatistics,
  getMealStatistics,
} from '@/services/admin/adminService';
import { onMounted, reactive } from 'vue';
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
);

const state = reactive({
  genderChartData: { labels: [], datasets: [{ data: [] }] },
  ageChartData: { labels: [], datasets: [{ data: [] }] },
  signInChartData: { labels: [], datasets: [{ data: [] }] },
  tierChartData: { labels: [], datasets: [{ data: [] }] },
  challengeTypeChartData: { labels: [], datasets: [{ data: [] }] },
  challengeRateChartData: { labels: [], datasets: [{ data: [] }] },
  postChartData: { labels: [], datasets: [{ data: [] }] },
  CategoryPostChartData: { labels: [], datasets: [{ data: [] }] },
  exerciseRecordChartData: { labels: [], datasets: [{ data: [] }] },
  exerciseTypeRecordChartData: { labels: [], datasets: [{ data: [] }] },
  exerciseDistributionChartData: { labels: [], datasets: [{ data: [] }] },
  mealRecordChartData: { labels: [], datasets: [{ data: [] }] },
  mealMacroAverageChartData: { labels: [], datasets: [{ data: [] }] },
  inquiryCountData: { labels: [], datasets: [{ data: [] }] },
  responseRateChartData: { labels: [], datasets: [{ data: [] }] },
});

onMounted(async () => {
  getUser();
  getChallenge();
  getInquiry();
  getCommunity();
  getExercise();
  getMeal();
});

// Tooltip Formatter
const makeTooltipLabel = (unit) => (context) => {
  const value = context.parsed.y ?? context.raw;
  if (value == null) return '';
  return `${context.label}: ${value}${unit}`;
};

// Pie 공통 옵션
const makePieOption = (unit = '명') => ({
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 1,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { color: '#333', font: { size: 13 }, padding: 8 },
    },
    tooltip: {
      callbacks: {
        label: (ctx) => {
          const values = ctx.dataset.data.map(Number);
          const total = values.reduce((a, b) => a + b, 0);
          const value = Number(ctx.raw);
          const pct = total ? ((value / total) * 100).toFixed(1) : 0;
          return `${ctx.label}: ${value}${unit} (${pct}%)`;
        },
      },
    },
    layout: {
      padding: { top: 0, bottom: 0 }, //  차트 위아래 여백 줄이기
    },
  },
});

// Bar 공통 옵션
const makeBarOption = (unit = '', max = null) => ({
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: { label: makeTooltipLabel(unit) },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#555', font: { size: 12 } },
    },
    y: {
      beginAtZero: true,
      max,
      grid: { color: '#eee' },
      ticks: {
        color: '#555',
        font: { size: 12 },
        callback: (v) => `${v}${unit}`,
      },
    },
  },
});

// Line 공통 옵션
const makeLineOption = (unit = '') => ({
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: makeTooltipLabel(unit) } },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { stepSize: 10, callback: (v) => `${v}${unit}` },
      grid: { color: '#f3f3f3' },
    },
  },
});

// 데이터 로드 함수
const getUser = async () => {
  const res = await getUserStatistics();
  const genderData = res.data.genderCount || [];
  const male = Number(genderData.find((g) => g.gender === 'M')?.count ?? 0);
  const female = Number(genderData.find((g) => g.gender === 'F')?.count ?? 0);
  state.genderChartData = {
    labels: ['남성', '여성'],
    datasets: [
      { data: [male, female], backgroundColor: ['#81d4fa', '#f8b5a2'] },
    ],
  };

  const ageData = res.data.ageCount || [];
  state.ageChartData = {
    labels: ageData.map((d) => d.ageGroup),
    datasets: [
      {
        data: ageData.map((d) => d.count),
        backgroundColor: [
          '#ffe082',
          '#f8b5a2',
          '#ce93d8',
          '#81d4fa',
          '#aed581',
        ],
      },
    ],
  };

  const signInData = res.data.signInCount || [];
  state.signInChartData = {
    labels: signInData.map((d) => d.month),
    datasets: [
      {
        data: signInData.map((d) => d.signInCount),
        borderColor: '#ef9a9a',
        backgroundColor: '#ffebee',
        fill: true,
      },
    ],
  };
};

const getChallenge = async () => {
  const res = await getChallengeStatistics();
  const tierData = res.data.tierCount || [];
  state.tierChartData = {
    labels: tierData.map((d) => d.tier),
    datasets: [
      {
        data: tierData.map((d) => d.count),
        backgroundColor: [
          '#cd9777',
          '#cfd8dc',
          '#ffe082',
          '#81d4fa',
          '#a5d6a7',
        ],
      },
    ],
  };

  const challengeTypeData = res.data.challengeTypeCount || [];
  state.challengeTypeChartData = {
    labels: challengeTypeData.map((d) => d.type),
    datasets: [
      {
        data: challengeTypeData.map((d) => d.count),
        backgroundColor: ['#81d4fa', '#a5d6a7', '#ffe082', '#b39ddb'],
      },
    ],
  };

  const challengeRateData = res.data.challengeSuccessRateCount || [];
  state.challengeRateChartData = {
    labels: challengeRateData.map((d) => d.challengeType),
    datasets: [
      {
        data: challengeRateData.map((d) => d.successRate),
        backgroundColor: ['#81d4fa', '#a5d6a7', '#ffd54f', '#f8b5a2'],
      },
    ],
  };
};

const getCommunity = async () => {
  const res = await getCommunityStatistics();
  const postData = res.data.postCount || [];
  state.postChartData = {
    labels: postData.map((d) => d.month),
    datasets: [
      {
        data: postData.map((d) => d.postCount),
        borderColor: '#64b5f6',
        backgroundColor: '#e3f2fd',
        fill: true,
      },
    ],
  };

  const catData = res.data.categoryPostCount || [];
  state.CategoryPostChartData = {
    labels: catData.map((d) => d.categoryName),
    datasets: [
      {
        data: catData.map((d) => d.count),
        backgroundColor: ['#81d4fa', '#a5d6a7', '#ffe082', '#f8b5a2'],
      },
    ],
  };
};

const getExercise = async () => {
  const res = await getExerciseStatistics();
  const monthData = res.data.exerciseRecordCountResList || [];
  state.exerciseRecordChartData = {
    labels: monthData.map((d) => d.month),
    datasets: [
      {
        data: monthData.map((d) => d.recordCount),
        borderColor: '#a5d6a7',
        backgroundColor: '#e8f5e9',
        fill: true,
      },
    ],
  };

  const typeData = res.data.exerciseNameRecordCountResList || [];
  state.exerciseTypeRecordChartData = {
    labels: typeData.map((d) => d.exerciseName),
    datasets: [
      {
        data: typeData.map((d) => d.recordCount),
        backgroundColor: '#a5d6a7',
      },
    ],
  };

  const timeData = res.data.exerciseDistributionCountResList || [];
  state.exerciseDistributionChartData = {
    labels: timeData.map((d) => d.timeRange),
    datasets: [
      {
        data: timeData.map((d) => d.count),
        backgroundColor: ['#c5e1a5', '#81d4fa', '#ce93d8', '#ffe082'],
      },
    ],
  };
};

const getMeal = async () => {
  const res = await getMealStatistics();
  const mealTrend = res.data.mealRecordCount || [];
  state.mealRecordChartData = {
    labels: mealTrend.map((d) => d.month),
    datasets: [
      {
        data: mealTrend.map((d) => d.recordCount),
        borderColor: '#ffe082',
        backgroundColor: '#fffde7',
        fill: true,
      },
    ],
  };

  const macro = res.data.mealMacroAverage ?? {};
  state.mealMacroAverageChartData = {
    labels: ['탄수화물', '단백질', '지방'],
    datasets: [
      {
        data: [
          macro.averageCarbohydrate ?? 0,
          macro.averageProtein ?? 0,
          macro.averageFat ?? 0,
        ],
        backgroundColor: ['#a5d6a7', '#81d4fa', '#ffe082'],
      },
    ],
  };
};

const getInquiry = async () => {
  const res = await getInquiryStatistics();
  const inquiryCount = res.data.inquiryCount || [];
  state.inquiryCountData = {
    labels: inquiryCount.map((d) => d.month),
    datasets: [
      {
        data: inquiryCount.map((d) => d.inquiryCount),
        borderColor: '#b39ddb',
        backgroundColor: '#f3e5f5',
        fill: true,
      },
    ],
  };

  const responseRate = res.data.responseRate;
  state.responseRateChartData = {
    labels: ['답변 완료', '미답변'],
    datasets: [
      {
        data: [responseRate, 100 - responseRate],
        backgroundColor: ['#81d4fa', '#d1c4e9'],
      },
    ],
  };
};
</script>

<template>
  <div class="admin-chart">
    <v-card class="data-card pa-2">
      <v-card-title
        class="d-flex justify-space-between align-center mb-4 card-title"
      >
        <span class="title">통계</span>
      </v-card-title>

      <div class="chart-wrap">
        <!-- 기존 차트 그룹 그대로 -->
        <div class="chart-group">
          <h3 class="title">사용자 성별</h3>
          <Pie
            :data="state.genderChartData"
            :options="makePieOption('명')"
            class="pie"
          />
          <p class="chart-unit">단위: 명</p>
        </div>

        <div class="chart-group">
          <h3 class="title">사용자 연령대</h3>
          <Pie
            :data="state.ageChartData"
            :options="makePieOption('명')"
            class="pie"
          />
          <p class="chart-unit">단위: 명</p>
        </div>

        <div class="chart-group">
          <h3 class="title">최근 6개월 회원가입 추이</h3>
          <Line
            :data="state.signInChartData"
            :options="makeLineOption('명')"
            class="line"
          />
          <p class="chart-unit">단위: 명</p>
        </div>
        <!-- 🏆 챌린지 -->
        <div class="chart-group">
          <h3 class="title">챌린지 티어 분포</h3>
          <Pie
            :data="state.tierChartData"
            :options="makePieOption('개')"
            class="pie"
          />
          <p class="chart-unit">단위: 개</p>
        </div>

        <div class="chart-group">
          <h3 class="title">챌린지 타입 비율</h3>
          <Pie
            :data="state.challengeTypeChartData"
            :options="makePieOption('개')"
            class="pie"
          />
          <p class="chart-unit">단위: 개</p>
        </div>

        <div class="chart-group">
          <h3 class="title">챌린지 성공률</h3>
          <Bar
            :data="state.challengeRateChartData"
            :options="makeBarOption('%', 100)"
            class="bar"
          />
          <p class="chart-unit">단위: %</p>
        </div>

        <!-- 🗂 커뮤니티 -->
        <div class="chart-group">
          <h3 class="title">게시글 추이</h3>
          <Line
            :data="state.postChartData"
            :options="makeLineOption('건')"
            class="line"
          />
          <p class="chart-unit">단위: 건</p>
        </div>

        <div class="chart-group">
          <h3 class="title">카테고리별 게시글 수</h3>
          <Pie
            :data="state.CategoryPostChartData"
            :options="makePieOption('건')"
            class="pie"
          />
          <p class="chart-unit">단위: 건</p>
        </div>

        <!-- 💪 운동 -->
        <div class="chart-group">
          <h3 class="title">운동 기록 추이</h3>
          <Line
            :data="state.exerciseRecordChartData"
            :options="makeLineOption('건')"
            class="line"
          />
          <p class="chart-unit">단위: 건</p>
        </div>

        <div class="chart-group">
          <h3 class="title">운동 종목별 기록 수</h3>
          <Bar
            :data="state.exerciseTypeRecordChartData"
            :options="makeBarOption('건')"
            class="bar"
          />
          <p class="chart-unit">단위: 건</p>
        </div>

        <div class="chart-group">
          <h3 class="title">시간대별 운동 분포</h3>
          <Pie
            :data="state.exerciseDistributionChartData"
            :options="makePieOption('건')"
            class="pie"
          />
          <p class="chart-unit">단위: 건</p>
        </div>

        <!-- 🍽 식단 -->
        <div class="chart-group">
          <h3 class="title">식단 기록 추이</h3>
          <Line
            :data="state.mealRecordChartData"
            :options="makeLineOption('건')"
            class="line"
          />
          <p class="chart-unit">단위: 건</p>
        </div>

        <div class="chart-group">
          <h3 class="title">탄단지 평균 섭취량</h3>
          <Bar
            :data="state.mealMacroAverageChartData"
            :options="makeBarOption('g')"
            class="bar"
          />
          <p class="chart-unit">단위: g</p>
        </div>

        <!-- 📩 문의 -->
        <div class="chart-group">
          <h3 class="title">문의 건수 추이</h3>
          <Line
            :data="state.inquiryCountData"
            :options="makeLineOption('건')"
            class="line"
          />
          <p class="chart-unit">단위: 건</p>
        </div>

        <div class="chart-group">
          <h3 class="title">문의 답변율</h3>
          <Pie
            :data="state.responseRateChartData"
            :options="makePieOption('%')"
            class="pie"
          />
          <p class="chart-unit">단위: %</p>
        </div>
      </div>
    </v-card>
  </div>
</template>

<style lang="scss" scoped>
.admin-chart {
  padding: 10px;

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

// 전체 그리드 (간격 줄임, 박스 크기 키움)
.chart-wrap {
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(400px, 1fr)
  ); // 카드 크기 약간 확대
  gap: 18px 20px; // 가로세로 간격 좁힘
  justify-items: center;
  align-items: start;
  padding: 16px 0;
}

// 개별 차트 카드
.chart-group {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
  padding: 22px 26px;
  text-align: center;
  transition: all 0.25s ease;
  width: 100%;
  max-width: 460px;
  min-height: 360px; // 카드 높이 일정하게
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
  }

  .title {
    font-size: 17px;
    font-weight: 600;
    margin-bottom: 10px;
    color: #333;
  }

  .chart-unit {
    font-size: 12px;
    color: #888;
    margin-top: 6px;
  }

  // ✅ 모든 차트 크기 통일
  .pie,
  .bar,
  .line {
    width: 320px !important;
    height: 240px !important;
    margin: 0 auto;
  }
}

.card-title {
  border-bottom: 1px solid #eee;
  padding-bottom: 6px;
  margin-bottom: 16px;
}

// 반응형
@media (max-width: 1200px) {
  .chart-wrap {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }
}

@media (max-width: 900px) {
  .chart-wrap {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }

  .chart-group {
    min-height: 320px;
  }

  .chart-group .pie,
  .chart-group .bar,
  .chart-group .line {
    width: 260px !important;
    height: 200px !important;
  }
}
</style>
