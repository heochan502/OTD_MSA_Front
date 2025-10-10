<script setup>
import {
  getAgeCount,
  getGender,
  getTier,
  getChallengeRate,
  getSignInCount,
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

const genderTotal = ref(0);
const ageTotal = ref(0);

// 성별 통계
const state = reactive({
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
  signInChartData: {
    labels: [],
    datasets: [
      {
        data: [],
        pointRadius: 0,
      },
    ],
  },
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
  // 성별 데이터 가져오기
  const res = await getGender();
  console.log('res', res.data);
  const genderData = Array.isArray(res.data) ? res.data : [];

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

  genderTotal.value = male + female;

  // 연령대 데이터 가져오기
  const res2 = await getAgeCount();
  console.log('res2', res2.data);
  const ageData = (Array.isArray(res2.data) ? res2.data : []).map((d) => ({
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
        borderWidth: 1,
      },
    ],
  };
  ageTotal.value = ageData.reduce((sum, d) => sum + d.count, 0);

  // 티어 데이터 가져오기
  const res3 = await getTier();
  console.log('res3', res3.data);
  const tierData = (Array.isArray(res3.data) ? res3.data : []).map((d) => ({
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

  // 챌린지 성공률 데이터 가져오기
  const res4 = await getChallengeRate();
  console.log('res4', res4.data);
  const challengeRateData = (Array.isArray(res4.data) ? res4.data : []).map(
    (d) => ({
      challengeType: d.challengeType ?? '기타',
      successRate: Number(d.successRate ?? 0),
    })
  );

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

  // 월별 가입자 추이 데이터 가져오기
  const res5 = await getSignInCount();
  console.log('res5', res5.data);
  const signInData = (Array.isArray(res5.data) ? res5.data : []).map((d) => ({
    month: d.month ?? '기타',
    signInCount: Number(d.signInCount ?? 0),
  }));

  state.signInChartData = {
    labels: signInData.map((d) => d.month),
    datasets: [
      {
        data: signInData.map((d) => d.signInCount),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        fill: false,
        pointRadius: 3,
        borderWidth: 2,
        borderColor: '#00c6ff',
        pointBackgroundColor: '#00c6ff',
      },
    ],
  };
});
</script>

<template>
  <div class="d-flex flex-row chart-wrap mt-8">
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
        class="bar"
      />
    </div>
  </div>
</template>

<style lang="scss">
.chart-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chart-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 16px;
}

.title {
  margin-bottom: 16px;
  font-weight: 700;
  text-align: center;
}

// .pie {
//   width: 300px !important;
//   height: 300px !important;
// }

// .bar {
//   width: 500px !important;
//   height: 500px !important;
// }
</style>
