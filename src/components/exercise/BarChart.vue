<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { calcDuration } from "@/utils/exerciseUtils";
import { getAvgDuration } from "@/services/exercise/exerciseService";
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

// 전체 평균 운동 시간
const avgData = ref([]);

const fetchAvgData = async () => {
  try {
    const res = await getAvgDuration(); // [{ date, averageDuration }]
    const data = res.data;

    const startOfWeek = dayjs(props.selectedDate).startOf("isoWeek");
    const endOfWeek = dayjs(props.selectedDate).endOf("isoWeek");

    const weekAvg = Array(7).fill(null);
    data.forEach((d) => {
      const day = dayjs(d.date);
      if (
        day.isAfter(startOfWeek.subtract(1, "day")) &&
        day.isBefore(endOfWeek.add(1, "day"))
      ) {
        const idx = day.isoWeekday() - 1;
        weekAvg[idx] = d.averageDuration;
      }
    });
    avgData.value = weekAvg;
  } catch (err) {
    console.error("평균 운동시간 불러오기 실패:", err);
  }
};

onMounted(fetchAvgData);
watch(() => props.selectedDate, fetchAvgData);
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

const chartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      type: "line",
      label: "전체 평균",
      data: avgData.value,
      borderColor: "#00D5DF",
      backgroundColor: "#00D5DF",
      borderWidth: 2,
      pointRadius: 2,
      pointBackgroundColor: "#00D5DF",
      fill: false,
      yAxisID: "y",
    },
    {
      type: "bar",
      label: "나의 운동시간",
      data: weeklyData.value,
      backgroundColor: "#FFE864",
      borderRadius: 10,
      yAxisID: "y",
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: "top", // 상단 표시 (bottom, left, right 도 가능)
      labels: {
        usePointStyle: true, // 둥근 점으로 표시
        pointStyle: "circle",
        padding: 10,
        font: {
          size: 10,
          weight: "500",
        },
        color: "#666",
      },
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
  border-radius: 10px;
}
</style>
