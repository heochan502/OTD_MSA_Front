<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { calcDuration } from "@/utils/exerciseUtils";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
// Chart.js
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
} from "chart.js";
import { Bar } from "vue-chartjs";

// Chart.js 기본 세팅
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler
);

dayjs.extend(isoWeek);

const props = defineProps({
  selectedDate: {
    // 주차 기준이 되는 날자 (선택 날짜 1개)
    type: String,
    required: true,
    default: "",
  },
  records: { type: Array, default: () => [] },
  label: String,
});

// x축 라벨
const labels = ref(["월", "화", "수", "목", "금", "토", "일"]);

// 주차 데이터 매핑 (월~일, 빈 값은 null)
const weeklyData = computed(() => {
  const days = Array(7).fill(0);
  let lastValue = null;

  props.records.forEach((record) => {
    const day = dayjs(record.startAt);
    const weekday = day.isoWeekday(); // 1=월 ~ 7=일

    const duration = calcDuration(record.startAt, record.endAt);

    days[weekday - 1] = duration || 0;
  });
  return days;
});

// 데이터셋
const chartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      data: weeklyData.value,
      backgroundColor: "rgba(0, 213, 223, 1)",
      borderRadius: 10,
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      title: {
        display: false,
      },
      grid: {
        display: false,
      },
    },
    y: {
      beginAtZero: true,
      title: {
        display: false,
      },
      grid: {
        display: false,
      },
    },
  },
};
</script>

<template>
  <v-card class="chart">
    <Bar :data="chartData" :options="chartOptions" />
  </v-card>
</template>

<style lang="scss" scoped>
.chart {
  display: flex;
  min-width: 210px;
  height: 215px;
  padding: 12px;
}
</style>
