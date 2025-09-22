<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  recordDate: {
    type: Array,
    default: () => [],
  },
});

const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

const calendarMatrix = ref([]);

const today = new Date();

const year = today.getFullYear();

const month = today.getMonth() + 1;

const lastDate = new Date(year, month, 0).getDate();
const startIdx = new Date(year, month - 1, 1).getDay();

// props 데이터가 바뀔 때마다 캘린더 다시 그림
watch(
  () => props.recordDate,
  (data) => {
    if (!data || data.length === 0) return;
    makeCalendar();
  }
);

// 캘린더 그리기 로직
const makeCalendar = () => {
  // console.log('startIdx', startIdx);
  // console.log('endDay', endDay);
  const matrix = [];
  let date = 1;
  let nextDate = 1;

  const prevMonthDate = new Date(year, month + 1, 0).getDate();
  console.log('prev', prevMonthDate);

  console.log('record-date', props.recordDate);

  for (let i = 0; i < 6; i++) {
    const row = [];
    for (let k = 0; k < 7; k++) {
      if (i === 0 && k < startIdx) {
        const prevDate = prevMonthDate - startIdx + k + 1;
        row.push({ date: prevDate, type: 'other' });
      } else if (date <= lastDate) {
        const hasRecord = props.recordDate.includes(date);
        row.push({ date, hasRecord });
        date++;
      } else {
        row.push({ date: nextDate, type: 'other' });
        nextDate++;
      }
    }
    matrix.push(row);
    if (date > lastDate) {
      break;
    }
  }
  calendarMatrix.value = matrix;
  console.log('111', calendarMatrix.value);
};

onMounted(() => {
  makeCalendar();
});

// 오늘 날짜 색 표시
const todayColor = (date) => {
  const today = new Date();
  return date === today.getDate();
};
</script>
<template>
  <div class="calendar">
    <h3 class="calendar-title">
      <span
        ><b>{{ year }}</b
        >년</span
      >
      <span>
        <b>{{ month }}</b
        >월</span
      >
    </h3>
    <div class="header calendar-grid">
      <div v-for="day in dayOfWeek" :key="day" class="day-header">
        {{ day }}
      </div>
    </div>
    <div class="body calendar-grid">
      <div
        v-for="(dayOfMonth, index) in calendarMatrix.flat()"
        :key="index"
        class="day-cell"
        :class="{
          'today-color': todayColor(dayOfMonth.date),
          'record-color': dayOfMonth.hasRecord,
          'sunday-color': index % 7 === 0 && dayOfMonth.type !== 'other',
          'other-color': dayOfMonth.type === 'other',
        }"
      >
        {{ dayOfMonth.date }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.calendar {
  margin: 0 auto;
  border-radius: 20px;
  border: #dedede solid 1px;
  max-width: 310px;
  background-color: #fff;
  padding: 20px 20px 17px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  .calendar-title {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #000;
    gap: 10px;
    font-size: 18px;
    margin-bottom: 5px;
  }
  .calendar-grid {
    color: #000;
    display: grid;
    grid-template-columns: repeat(7, 1fr);
  }
  .day-header {
    aspect-ratio: 1 / 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 15px;
  }

  .day-cell {
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 15px;
    border-radius: 50%;
    margin: 2px 4px;
  }
  .record-color {
    border: 2px solid #00D5DF;
  }
  .today-color {
    color: steelblue;
  }
  .sunday-color {
    color: tomato;
  }
  .other-color {
    color: #989898;
  }
}
</style>
