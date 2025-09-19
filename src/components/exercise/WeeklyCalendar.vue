<script setup>
import { ref, computed } from "vue";
import { startOfWeek, addDays, isSameDay, format } from "date-fns";

const props = defineProps({
  recordDate: {
    type: Array,
    default: () => [], // ["2025-09-10", "2025-09-12"]
  },
});
const emit = defineEmits(["click-date"]);

const today = new Date();
const currentDate = ref(today);
const weekStart = ref(startOfWeek(today, { weekStartsOn: 0 })); // 일요일 시작

// 한 주(7일): 현재 주의 날짜 배열만 계산
const weekDays = computed(() =>
  Array.from({ length: 7 }, (_, i) => addDays(weekStart.value, i))
);

const goPrevWeek = () => (weekStart.value = addDays(weekStart.value, -7));
const goNextWeek = () => (weekStart.value = addDays(weekStart.value, 7));

const isToday = (day) => isSameDay(day, today);
const isSelected = (day) => isSameDay(day, currentDate.value);

const selectDate = (day) => {
  currentDate.value = day;
  emit("click-date", day);
};
</script>

<template>
  <div class="d-flex align-center ga-2">
    <!-- 캘린더 아이콘 -->
    <img
      src="\image\exercise\calender.png"
      alt="캘린더 아이콘"
      class="calendar_icon"
    />
    <!-- 현재 년월 -->
    <span class="otd-subtitle-1">{{ "2025년 9월" }}</span>
  </div>
  <div class="weekly-calendar otd-body-1">
    <button class="btn" @click="goPrevWeek">
      <img src="\image\exercise\btn_prev.png" alt="" width="10" />
    </button>
    <div class="days">
      <div
        v-for="day in weekDays"
        :key="day"
        class="day-cell"
        :class="{
          today: isToday(day),
          selected: isSelected(day),
        }"
        @click="selectDate(day)"
      >
        <span class="date">{{ format(day, "d") }}</span>
        <span class="weekday">{{
          ["일", "월", "화", "수", "목", "금", "토"][day.getDay()]
        }}</span>
      </div>
    </div>
    <button class="btn" @click="goNextWeek">
      <img src="\image\exercise\btn_next.png" alt="" width="10" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
.calendar_icon {
  width: 18px;
  height: 18px;
}
.weekly-calendar {
  display: flex;
  justify-content: center;
  max-width: 330px;
  margin: 0 auto;
  padding: 16px;

  .btn {
    padding: 5px;
  }
  .days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);

    .day-cell {
      position: relative;
      text-align: center;
      padding: 8px 15px;

      cursor: pointer;

      .date {
        // 기본 날짜 스타일 (선택되지 않은 상태)
        color: #989898;
      }

      //   &.today {
      //     .date {
      //       background: #ffe864;
      //       color: #000;
      //       border-radius: 10%;
      //       padding: 32px 20px;
      //     }
      //   }

      &.selected {
        background: #ffe864;
        color: #393e46;
        border-radius: 18px;

        padding: 8px 15px;

        box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1);
        .date {
          color: #393e46;
        }
        .weekday {
          color: #393e46;
        }
      }

      .weekday {
        display: block;
        color: #989898;
      }
    }
  }
}
:hover {
  border: none;
}
</style>
