<script setup>
import { ref, computed, watch } from "vue";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek"; // 주 시작일 설정용
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import customParseFormat from "dayjs/plugin/customParseFormat";
import ExerciseCalendar from "./ExerciseCalendar.vue";

dayjs.extend(isoWeek);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);

const openCalendar = ref(false);

const props = defineProps({
  recordDate: {
    type: String,
    default: () => [], // ["2025-09-10", "2025-09-12"]
  },
});
const emit = defineEmits(["click-date"]);

const today = dayjs();
const currentDate = ref(props.recordDate ? dayjs(props.recordDate) : today);

// 선택 날짜 기준 주 시작일 설정.
// const weekStart = ref(currentDate.value.startOf("isoWeek")); // 월요일 시작
const weekStart = ref(
  props.recordDate
    ? dayjs(props.recordDate).startOf("isoWeek")
    : today.startOf("isoWeek")
);

// 한 주(7일) 배열
const weekDays = computed(() =>
  Array.from({ length: 7 }, (_, i) => weekStart.value.add(i, "day"))
);

// 주 이동
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
  emit("click-date", day.format("YYYY-MM-DD"));
};

// 수정된 부분 참고!!
watch(
  () => props.recordDate,
  (newDate) => {
    if (newDate) {
      currentDate.value = dayjs(newDate);
      weekStart.value = dayjs(newDate).startOf("isoWeek");
    }
  }
);

// @click
const goNow = () => {
  currentDate.value = today; // 현재 날짜
  weekStart.value = today.startOf("isoWeek"); // 이번 주 시작일 갱신
  emit("click-date", today.format("YYYY-MM-DD"));
};

const confirmYes = () => {
  alert("적용완료");
};
</script>

<template>
  <div class="d-flex align-center ga-2">
    <div class="d-flex align-center ga-2">
      <img
        src="\image\exercise\calender.png"
        alt="캘린더 아이콘"
        class="calendar_icon"
        @click="openCalendar = true"
      />
      <span class="otd-subtitle-1">{{ currentDate.format("YYYY년 M월") }}</span>
    </div>
    <div class="btn_now otd-body-3" @click.prevent="goNow">오늘</div>
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
  <!-- 캘린더 모달 -->
  <v-dialog v-model="openCalendar" max-width="350" min-height="100">
    <v-card class="pa-0 d-flex">
      <v-card-text class="otd-body-1 text-center">
        <ExerciseCalendar />
        <span>선택한 날의 기록을 보시겠어요?</span>
        <div class="d-flex w-100">
          <v-btn
            @click="openCalendar = false"
            class="btn_confirm otd-body-1 ma-1"
            >닫기</v-btn
          >
          <v-btn
            color="#ffe864"
            @click="confirmYes"
            class="btn_confirm otd-body-1 ma-1"
            >적용하기</v-btn
          >
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style lang="scss" scoped>
.calendar_icon {
  width: 18px;
  height: 18px;
}
.btn_now {
  cursor: pointer;
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

.btn_select:hover {
  background-color: #ffe864;
}
.btn_confirm {
  width: 100%;
  max-width: 143px;
  height: 38px;
  margin-top: 20px;
  background-color: #e6e6e6;
  border-radius: 10px;
  box-shadow: none;
}

:hover {
  border: none;
}
</style>
