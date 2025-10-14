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
  series: { type: Object, default: () => ({ points: [] }) },
  metrics: { type: Array, default: () => [] },
  selectedMetric: String,
});

// 선택된 측정항목이 있으면 그것만 화면에 보여짐. 없으면 전체 항목
const displayMetrics = computed(() => {
  if (!props.selectedMetric) return props.metrics;
  return props.metrics.filter((m) => m.metricCode === props.selectedMetric);
});

// 날짜 라벨
const labels = computed(() =>
  props.series.points.map((p) => dayjs(p.date).format("YY/MM/DD"))
);

// 항목별 데이터셋 생성
const makeChartData = (metric) => {
  return {
    labels: labels.value,
    datasets: [
      {
        label: metric,
        data: props.series.points.map((p) => p.values[metric]),
        borderColor: "#FFE864", // 선 색깔 오렌지톤
        backgroundColor: (context) => {
          const chart = context.chart; // chartArea가 계산된 후에 gradient 생성
          const { ctx, chartArea } = chart; // ctx 객체로 선 긋고 색 칠하고 그라데이션 효과 줌
          if (!chartArea) return null; // 아직 계산 전이면 null 리턴
          const gradient = ctx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom
          );
          gradient.addColorStop(0, "rgba(255, 232, 100, 0.6)"); // 위쪽 진한색
          gradient.addColorStop(1, "rgba(255, 232, 100, 0)"); // 아래쪽 투명
          return gradient;
        },
        fill: true,
        pointRadius: 5,
        pointBackgroundColor: "#FFE864",
        pointBorderColor: "#ffffff", // 점 테두리는 조금 연한 오렌지색으로
        pointBorderWidth: 2, // 테두리 두께 조절
        tension: 0.4,
      },
    ],
  };
};

const makeChartOptions = (metricCode) => ({
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
      grace: "30%",
      suggestedMax: undefined, // c최대값은 데이터에 따라 자동 조절
    },
  },
});

const hasData = computed(() => {
  return props.series?.points && props.series.points.length > 0;
});
</script>

<template>
  <div v-if="!hasData" class="no-data">
    <v-card class="chart otd-border otd-shadow otd-box-style">
      <span class="text-h4">🤸🏻</span>
      <span class="otd-subtitle-2"> InBody 데이터가 없어요. </span>
    </v-card>
  </div>
  <!-- selectedMetric 유무에 따라 표시할 metric 다르게 -->
  <div v-else>
    <div v-for="metric in displayMetrics" :key="metric.metricCode">
      <div>
        <span class="otd-subtitle-1 ml-2">{{ metric.metricName }}</span>
        <v-card class="chart otd-border otd-shadow otd-box-style">
          <Line
            :data="makeChartData(metric.metricCode)"
            :options="makeChartOptions(metric.metricCode)"
            style="width: 100%"
          />
        </v-card>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chart {
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  max-width: 350px;
  height: 250px;
  padding: 20px 10px;
  margin: 0 0 15px 0;
}
</style>
