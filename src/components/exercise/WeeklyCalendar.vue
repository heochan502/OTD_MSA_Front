<script setup>
import { ref, computed } from "vue";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek"; // 주 시작일 설정용
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(isoWeek);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);

const props = defineProps({
  recordDate: {
    type: Array,
    default: () => [], // ["2025-09-10", "2025-09-12"]
  },
});
const emit = defineEmits(["click-date"]);

const today = dayjs();
const currentDate = ref(today);

// 이번 주의 "일요일"을 시작으로 설정
const weekStart = ref(today.startOf("week")); // 기본은 일요일 시작

// 한 주(7일) 배열
const weekDays = computed(() =>
  Array.from({ length: 7 }, (_, i) => weekStart.value.add(i, "day"))
);

const goPrevWeek = () => {
  weekStart.value = weekStart.value.subtract(1, "week");
};
const goNextWeek = () => {
  weekStart.value = weekStart.value.add(1, "week");
};

const isToday = (day) => day.isSame(today, "day");
const isSelected = (day) => day.isSame(currentDate.value, "day");

const selectDate = (day) => {
  currentDate.value = day;
  emit("click-date", day.toDate());
};
</script>

<template>
  <div class="d-flex align-center ga-2">
    <img
      src="\image\exercise\calender.png"
      alt="캘린더 아이콘"
      class="calendar_icon"
    />
    <span class="otd-subtitle-1">{{ currentDate.format("YYYY년 M월") }}</span>
  </div>

  <div class="weekly-calendar otd-body-1">
    <button class="btn" @click="goPrevWeek">
      <img src="\image\exercise\btn_prev.png" alt="" width="10" />
    </button>

    <div class="days">
      <div
        v-for="day in weekDays"
        :key="day.format('YYYY-MM-DD')"
        class="day-cell"
        :class="{ today: isToday(day), selected: isSelected(day) }"
        @click="selectDate(day)"
      >
        <span class="date">{{ day.format("D") }}</span>
        <span class="weekday">{{
          ["일", "월", "화", "수", "목", "금", "토"][day.day()]
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
