<script setup>
import { computed, ref, watch, nextTick } from "vue";

import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

import ChartDataLabels from "chartjs-plugin-datalabels";

// Chart.js
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
} from "chart.js";
import { Line } from "vue-chartjs";

dayjs.extend(isoWeek);

// Chart.js 기본 세팅
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
  ChartDataLabels
);

const props = defineProps({
  series: Object,
});

// 날짜 라벨
const labels = computed(() =>
  props.series.points.map((p) => dayjs(p.date).format("YY/MM/DD"))
);

const metrics = computed(() => Object.keys(props.series.points[0].values));

// const chartData = computed(() => ({
//   labels: labels.value,
//   datasets: [
//     {
//       borderColor: "#FFE864", // 선 색깔 오렌지톤
//       backgroundColor: (context) => {
//         const ctx = context.chart.ctx;
//         const gradient = ctx.createLinearGradient(
//           0,
//           0,
//           0,
//           context.chart.height
//         );
//         gradient.addColorStop(1, "rgba(255, 232, 100, 0)"); // 위쪽 진한색, 1은 불투명

//         gradient.addColorStop(0, "rgba(255, 232, 100, 0.3)"); // 아래쪽 투명 (알파 0)
//         gradient.addColorStop(0.3, "rgba(255, 232, 100, 0)"); // 중간
//         return gradient;
//       },
//       fill: true,
//       pointRadius: 5,
//       pointBackgroundColor: "#FFE864",
//       pointBorderColor: "#ffffff", // 점 테두리는 조금 연한 오렌지색으로
//       pointBorderWidth: 2, // 테두리 두께 조절
//       tension: 0.4,
//     },
//   ],
// }));

// 항목별 데이터셋 생성
const makeChartData = (metric) => {
  return {
    labels: labels.value,
    datasets: [
      {
        label: metric,
        data: props.series.points.map((p) => p.values[metric]),
        borderColor: "#84C7E8",
        backgroundColor: "rgba(132, 199, 232, 0.3)",
        tension: 0.4,
        fill: true,
      },
    ],
  };
};
// const chartOptions = {
//   responsive: true,
//   maintainAspectRatio: false,
//   plugins: {
//     legend: {
//       display: false,
//     },
//     // 툴팁
//     tooltip: {
//       // 아래 tooltip.enabled=false 와 충돌나지 않도록 여기서만 설정하거나, 아래 것을 제거하세요.
//       enabled: true,
//       callbacks: {
//         label: (context) => {
//           const field = props.fields.find((f) => f.key === props.selectedField);
//           const unit = field?.unit || "";
//           if (context.parsed.y === 0) return "기록없음";
//           return `${context.parsed.y} ${unit}`;
//         },
//       },
//     },
//     datalabels: {
//       display: true,
//       align: "top",
//       anchor: "end",
//       color: "#303030",
//       font: { size: 10 },
//       formatter: (value) => (value === 0 ? "" : value),
//     },
//   },
//   legend: {
//     display: false,
//   },
//   tooltip: {
//     enabled: false,
//   },
//   scales: {
//     x: {
//       ticks: {
//         font: { size: 10 },
//       },
//       grid: {
//         display: false,
//       },
//       title: { display: false },
//     },
//     y: {
//       display: false,
//       grid: { display: false },
//       grace: "20%", // 위·아래 20% 여유
//       // min: minValue.value - minValue.value * 0.1, // 최소값보다 약간 작게 설정, null일 때 0
//       // max: maxValue.value + maxValue.value * 0.41, // 최대값보다 약간 크게 설정, null일 때 10
//     },
//   },
// };
const makeChartOptions = (metric) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: true,
      callbacks: {
        label: (context) => {
          const value = context.parsed.y;
          return value === 0 ? "기록없음" : `${value}`;
        },
      },
    },
    datalabels: {
      display: true,
      align: "top",
      anchor: "end",
      color: "#303030",
      font: { size: 10 },
      formatter: (value) => (value === 0 ? "" : value),
    },
  },
  scales: {
    // x: { ticks: { font: { size: 10 } }, grid: { display: false } },
    y: {
      display: false,
      grace: "30%",
      suggestedMax: undefined, // c최대값은 데이터에 따라 자동 조절
    },
  },
});
</script>

<template>
  <v-card class="chart otd-border otd-shadow otd-box-style">
    <div v-for="metric in metrics" :key="metric" style="margin-bottom: 24px">
      <h4>{{ metric }}</h4>
      <Line
        :data="makeChartData(metric)"
        :options="makeChartOptions(metric)"
        style="height: 250px"
      />
    </div>
  </v-card>
</template>

<style lang="scss" scoped>
.chart {
  display: flex;

  height: 250px;
  padding: 12px;
  position: relative;
}
</style>
