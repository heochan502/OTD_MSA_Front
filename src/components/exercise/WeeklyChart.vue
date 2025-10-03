<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
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
  Filler
);

const props = defineProps({
  selectedDate: {
    // 주차 기준이 되는 날자 (선택 날짜 1개)
    type: String,
    required: true,
    default: "",
  },
  records: { type: Array, default: () => [] }, // 서버에서 내린 기록들
  selectedField: String,
  fields: Array,
  label: String,
});

// 해당 주차 범위
const weekRange = computed(() => {
  const base = dayjs(props.selectedDate);
  return {
    startOfWeek: base.startOf("isoWeek"), // 월요일
    endOfWeek: base.endOf("isoWeek"), // 일요일
  };
});

// const weeklyRecords = computed(() => {
//   return props.records.filter((records) => {
//     const day = dayjs(records.startAt);
//     return (
//       day.isAfter(weekRange.value.start.subtract(1, "day")) &&
//       day.isBefore(weekRange.value.end.add(1, "day"))
//     );
//   });
// });

// 주차 데이터 매핑 (월~일, 빈 값은 null)
const weeklyData = computed(() => {
  const days = Array(7).fill(0);
  let lastValue = null;

  props.records.forEach((records) => {
    const day = dayjs(records.startAt);
    const weekday = day.isoWeekday(); // 1=월 ~ 7=일

    const fieldKey = props.label || props.selectedField;
    let value = records[fieldKey];

    if (value != null) {
      days[weekday - 1] = value;
      lastValue = days[weekday - 1];
    } else {
      days[weekday - 1] = lastValue;
    }
  });
  return days;
});

// X축 라벨 (월 ~ 일)
const labels = ref(["월", "화", "수", "목", "금", "토", "일"]);

// Chart.js 데이터셋
const chartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      data: weeklyData.value,
      borderColor: "#3BBEFF",
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(
          0,
          0,
          0,
          context.chart.height
        );
        gradient.addColorStop(0, "rgba(59,190,255,1)"); // 위쪽 조금 더 진하게
        gradient.addColorStop(0.5, "rgba(59, 190, 255, 0.5)"); // 중간
        gradient.addColorStop(1, "rgba(59, 190, 255, 0)"); // 아래쪽 투명
        return gradient;
      },
      fill: true,
      pointRadius: 0,
      pointBackgroundColor: "#3BBEFF",
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
      callbacks: {
        label: (context) => {
          const field = props.fields.find((f) => f.key === props.selectedField);
          const unit = field?.unit || "";
          if (context.parsed.y === 0) {
            return "기록없음";
          }
          return `${context.parsed.y} ${unit}`;
        },
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
      type: "linear",
      suggestedMin: 0,
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
    <Line :data="chartData" :options="chartOptions" />
  </v-card>
</template>

<style lang="scss" scoped>
.chart {
  display: flex;
  min-width: 210px;
  height: 350px;
  padding: 12px;
}
</style>
