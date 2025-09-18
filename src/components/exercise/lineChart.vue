<script setup>
import { computed, ref, onMounted } from 'vue';

import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

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
} from 'chart.js';
import { Line } from 'vue-chartjs';

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
    start: base.startOf('isoWeek'), // 월요일
    end: base.endOf('isoWeek'), // 일요일
  };
});

const weeklyLogs = computed(() => {
  return props.logs.filter((log) => {
    const day = dayjs(log.dataTime);
    return (
      day.isAfter(weekRange.value.start.subtract(1, 'day')) &&
      day.isBefore(weekRange.value.end.add(1, 'day'))
    );
  });
});

// 건강 차트
// 주차 데이터 매핑 (월~일, 빈 값은 null)
const weeklyData = computed(() => {
  const days = Array(7).fill(0);
  let lastValue = null;
 

  weeklyLogs.value.forEach((log) => {
    const day = dayjs(log.dataTime);
    const weekday = day.isoWeekday(); // 1=월 ~ 7=일

    const fieldKey = props.label || props.selectedField;
    let value = log[fieldKey];

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
// const labels = ref(["월", "화", "수", "목", "금", "토", "일"]);
const labels = weeklyLogs.value.map((item) =>
  dayjs(item.dataTime).format('YY.MM.DD')
);

// Chart.js 데이터셋
const chartData = computed(() => ( console.log('min 데이터:', minValue.value ),
console.log('max 데이터:', maxValue.value ), {
  
  labels: labels,
  datasets: [
    {
      data: weeklyData.value,
      borderColor: '#FFE864', // 선 색깔 오렌지톤
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(
          0,
          0,
          0,
          context.chart.height
        );
        gradient.addColorStop(1, 'rgba(255, 232, 100, 0)');   // 위쪽 진한색, 1은 불투명
       
gradient.addColorStop(0, 'rgba(255, 232, 100, 0.3)');   // 아래쪽 투명 (알파 0)
 gradient.addColorStop(0.3, "rgba(255, 232, 100, 0)"); // 중간
        return gradient;
      },
      fill: true,
      pointRadius: 5,
      pointBackgroundColor: '#FFE864',
      pointBorderColor: '#ffffff',     // 점 테두리는 조금 연한 오렌지색으로
      pointBorderWidth: 2,             // 테두리 두께 조절
      tension: 0.4,
    },
  ],
}));

//y축 최소값 설정하기
const minValue = computed(() => 
  Math.min(...weeklyData.value.filter((v) => v != null))
);// null 제외 후 최소값 구함
const maxValue = computed(() => 
  Math.max(...weeklyData.value.filter((v) => v != null))
);

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
    datalabels: {
      display: true,
      align: "top",
      anchor: "end",
      color: "#f1c40f", // 글씨 색상
      font: {
        size: 10,
      },
      formatter: (value) => {
        if (value === 0) return "";
        return value;
      },
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
      display: true,
      grid: { display: false },
      min: minValue.value -  (minValue.value * 0.1) , // 최소값보다 약간 작게 설정, null일 때 0
      max: maxValue.value + (maxValue.value * 0.1) , // 최대값보다 약간 크게 설정, null일 때 10
    },
  },
};

onMounted(() => {
  

});

</script>

<template>
  <v-card class="chart">
    <Line :data="chartData" :options="chartOptions" style="width: 100%" />
  </v-card>
</template>

<style lang="scss" scoped>
.chart {
  display: flex;

  height: 250px;
  padding: 12px;
}
</style>
