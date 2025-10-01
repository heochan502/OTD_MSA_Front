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

const chartRef = ref(null);

const props = defineProps({
  selectedDate: {
    type: String,
    required: true,
  },
  selectedField: String,
  fields: Array,
  label: String,
  logs: { type: Array, default: () => [] },
});

// 해당 주차 범위
const weekRange = computed(() => {
  const base = dayjs(props.selectedDate);
  return {
    start: base.startOf("isoWeek"), // 월요일
    end: base.endOf("isoWeek"), // 일요일
  };
});

const weeklyLogs = computed(() => {
  return props.logs.filter((log) => {
    const day = dayjs(log.dataTime);
    return (
      day.isAfter(weekRange.value.start.subtract(1, "day")) &&
      day.isBefore(weekRange.value.end.add(1, "day"))
    );
  });
});

// 주차 데이터 매핑 (월~일, 빈 값은 null)
const weeklyData = computed(() => {
  const days = Array(7).fill(0);
  let lastValue = null;

  weeklyLogs.value.forEach((log) => {
    const day = dayjs(log.dataTime);
    const weekday = day.isoWeekday(); // 1=월 ~ 7=일

    const fieldKey = props.label || props.selectedField;
    let value = log.values[fieldKey];

    if (value != null) {
      days[weekday - 1] = value;
      lastValue = days[weekday - 1];
    } else {
      days[weekday - 1] = lastValue;
    }
  });
  return days;
});


// Chart.js 데이터셋
const chartData = computed(() => ({
  labels: labels,
  datasets: [
    {
      data: weeklyData.value,
      borderColor: "#FFE864", // 선 색깔 오렌지톤
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(
          0,
          0,
          0,
          context.chart.height
        );
        gradient.addColorStop(1, "rgba(255, 232, 100, 0)"); // 위쪽 진한색, 1은 불투명

        gradient.addColorStop(0, "rgba(255, 232, 100, 0.3)"); // 아래쪽 투명 (알파 0)
        gradient.addColorStop(0.3, "rgba(255, 232, 100, 0)"); // 중간
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
}));

// Chart.js 옵션
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    // 툴팁
    tooltip: {
      // 아래 tooltip.enabled=false 와 충돌나지 않도록 여기서만 설정하거나, 아래 것을 제거하세요.
      enabled: true,
      callbacks: {
        label: (context) => {
          const field = props.fields.find((f) => f.key === props.selectedField);
          const unit = field?.unit || "";
          if (context.parsed.y === 0) return "기록없음";
          return `${context.parsed.y} ${unit}`;
        },
      },
    },
    datalabels: {
      display: true,
      align: "top",
      anchor: "end",
      color: "#f1c40f",
      font: { size: 10 },
      formatter: (value) => (value === 0 ? "" : value),
    },
  },
  legend: {
    display: false,
  },
  tooltip: {
    enabled: false,
  },
  scales: {
    x: {
      ticks: {
        font: { size: 10 },
      },
      grid: {
        display: false,
      },
      title: { display: false },
    },
    y: {
      display: false,
      grid: { display: false },
      grace: "20%", // 위·아래 20% 여유
      // min: minValue.value - minValue.value * 0.1, // 최소값보다 약간 작게 설정, null일 때 0
      // max: maxValue.value + maxValue.value * 0.41, // 최대값보다 약간 크게 설정, null일 때 10
    },
  },
};
// 차트 업데이트
watch(
  [weeklyData, () => props.selectedField],
  async () => {
    await nextTick();
    // vue-chartjs v5 기준: chartRef.value.chart 인스턴스 보유
    chartRef.value?.chart?.update();
  },
  { deep: true }
);
</script>

<template>
  <v-card class="chart otd-border otd-shadow otd-box-style">
    <Line
      ref="chartRef"
      :data="chartData"
      :options="chartOptions"
      style="width: 100%"
    />
  </v-card>
</template>

<style lang="scss" scoped>
.chart {
  display: flex;

  height: 250px;
  padding: 12px;
}
</style>
