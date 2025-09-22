<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  reminderDate: {
    type: Array,
    default: () => [],
  },
  usePage: { type: String, default: 'home' },
});
const emit = defineEmits(['click-date', 'reminder-date']);

const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

const calendarMatrix = ref([]);

const today = new Date();

const year = today.getFullYear();

const month = today.getMonth() + 1;

const lastDate = new Date(year, month, 0).getDate();
const startIdx = new Date(year, month - 1, 1).getDay();

// 캘린더 그리기 로직
const makeCalendar = () => {
  // console.log('startIdx', startIdx);
  // console.log('endDay', endDay);
  const matrix = [];
  let date = 1;
  let nextDate = 1;

  const prevMonthDate = new Date(year, month + 1, 0).getDate();
  console.log('prev', prevMonthDate);

  for (let i = 0; i < 6; i++) {
    const row = [];
    for (let k = 0; k < 7; k++) {
      if (i === 0 && k < startIdx) {
        const prevDate = prevMonthDate - startIdx + k + 1;
        row.push({ date: prevDate, type: 'other' });
      } else if (date <= lastDate) {
        row.push({ date });
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
// console.log('calendar', calendarMatrix);

// watch(
//   () => props.reminderDate,
//   () => {
//     makeCalendar();
//   },
//   { immediate: true, deep: true }
// );

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
          'reminder-color': dayOfMonth.hasReminder,
          empty: !dayOfMonth.date,
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
  // height: 248px;
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
    cursor: pointer;
    // margin: 8px;

    &.reminder-color {
      background-color: #bfeaff;
    }
    &.today-color {
      color: steelblue;
    }
    &.sunday-color {
      color: tomato;
    }
    &.empty {
      background: none;
      cursor: default;
    }
    &.other-color {
      color: #989898;
    }
  }
}
</style>
