<script setup>
import { getAgeCount, getGender } from '@/services/admin/adminService';
import { onMounted, ref } from 'vue';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Pie } from 'vue-chartjs';

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const genderTotal = ref(0);
const ageTotal = ref(0);

const genderChartData = ref({
  labels: ['남성', '여성'],
  datasets: [
    {
      data: [0, 0],
      backgroundColor: ['#36A2EB', '#FF6384'],
      borderWidth: 1,
    },
  ],
});

const ageChartData = ref({
  labels: [],
  datasets: [
    {
      data: [],
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
});

// 퍼센트 계산용 툴팁 콜백 함수 (마지막 조각 보정)
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

const commonOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { color: '#333', font: { size: 14 } },
    },
    tooltip: {
      callbacks: { label: makePercentLabel },
    },
  },
};

onMounted(async () => {
  // 성별 데이터 가져오기
  const res = await getGender();
  const genderData = res.data;

  const male = Number(genderData.find((g) => g.gender === 'M')?.count ?? 0);
  const female = Number(genderData.find((g) => g.gender === 'F')?.count ?? 0);

  genderChartData.value = {
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
  const data = res2.data.map((d) => ({
    ageGroup: d.ageGroup,
    count: Number(d.count),
  }));

  ageChartData.value = {
    labels: data.map((d) => d.ageGroup),
    datasets: [
      {
        data: data.map((d) => d.count),
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
  ageTotal.value = data.reduce((sum, d) => sum + d.count, 0);
});
</script>

<template>
  <div class="d-flex flex-row chart-wrap mt-8">
    <div class="chart-group">
      <h3 class="title">사용자 성별</h3>
      <Pie :data="genderChartData" :options="commonOptions" class="chart" />
    </div>

    <div class="chart-group">
      <h3 class="title">사용자 연령대</h3>
      <Pie :data="ageChartData" :options="commonOptions" class="chart" />
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

.chart {
  width: 300px !important;
  height: 300px !important;
}
</style>
