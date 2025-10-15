<script setup>
import { ref, computed, watch } from "vue";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek"; // 주 시작일 설정용
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import customParseFormat from "dayjs/plugin/customParseFormat";
import ExerciseCalendar from "./ExerciseCalendar.vue";
import Modal from "../user/Modal.vue";

dayjs.extend(isoWeek);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);

const openCalendar = ref(false); // 캘린더 모달창
const emit = defineEmits(["click-date"]);

const props = defineProps({
  recordDate: {
    type: String,
    default: () => [], // ["2025-09-10", "2025-09-12"]
  },
});

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
const isFuture = (day) => day.isAfter(today, "day");
const isCurrentWeek = computed(() => {
  const startOfCurrentWeek = today.startOf("isoWeek");
  // 표시된 주의 시작일(weekStart.value)이 이번 주의 시작일과 같은지 확인
  return weekStart.value.isSame(startOfCurrentWeek, "day");
});
const selectDate = (day) => {
  if (day.isAfter(today, "day")) return; // 미래 날짜 선택 불가

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

// 날짜 선택 시 (단순히 날짜만 업데이트)
const onSelectDate = (date) => {
  emit("click-date", date); // 부모로 선택된 날짜 전달
};

// 적용 버튼 클릭 시 (날짜 반영 + 모달 닫기)
const applyDate = (date) => {
  emit("click-date", date);
  openCalendar.value = false; // 모달 닫기
};
</script>

<template>
  <div class="d-flex align-center ga-2">
    <div class="d-flex align-center ga-2 ml-2">
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
        :class="{
          today: isToday(day),
          selected: isSelected(day),
          future: isFuture(day),
        }"
        @click="selectDate(day)"
      >
        <span class="date">{{ day.format("D") }}</span>
        <span class="weekday">{{
          ["일", "월", "화", "수", "목", "금", "토"][day.day()]
        }}</span>
      </div>
    </div>

    <button class="btn" @click="goNextWeek" :disabled="isCurrentWeek">
      <img src="\image\exercise\btn_next.png" alt="" width="10" />
    </button>
  </div>
  <!-- 캘린더 모달 -->
  <v-dialog v-model="openCalendar" max-width="350">
    <div class="modal-container">
      <v-card-text class="otd-body-1 text-center">
        <ExerciseCalendar @select-date="onSelectDate" />
        <span>선택한 날의 기록을 보시겠어요?</span>
      </v-card-text>
      <div class="d-flex justify-center">
        <v-btn @click="openCalendar = false" class="modal-btn otd-body-1 ma-1"
          >닫기</v-btn
        >
        <v-btn
          color="#393e46"
          @click="applyDate(currentDate)"
          class="modal-btn otd-body-1 ma-1"
          >적용하기</v-btn
        >
      </div>
    </div>
  </v-dialog>
</template>

<style lang="scss" scoped>
.calendar_icon {
  width: 18px;
  height: 18px;
  cursor: pointer;
}
.btn_now {
  cursor: pointer;
}
.weekly-calendar {
  display: flex;
  justify-content: center;
  max-width: 350px;
  // width: 100%;
  margin: 0 auto;
  padding: 16px;

  .btn {
    padding: 5px;

    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
      border: none;
    }
  }
  .days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);

    .day-cell {
      position: relative;
      text-align: center;
      padding: 8px 13px;

      cursor: pointer;
      &.future {
        pointer-events: none; /* 클릭 방지 로직이 있지만 UI에서도 비활성화 */
      }
      &.future .date,
      &.future .weekday {
        color: #e6e6e6; /* 글자색을 #e6e6e6으로 변경 */
      }
      .date {
        // 기본 날짜 스타일 (선택되지 않은 상태)
        color: #989898;
      }

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

.modal-btn {
  max-width: 135px;
  width: 100%;
  height: 38px;
  margin-top: 20px;
  background-color: #e6e6e6;
  border-radius: 10px;
  box-shadow: none;
}

:hover {
  border: none;
}

.calendar {
  box-shadow: none;
}

.modal-container {
  background: white;
  border-radius: 16px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  animation: modalSlideUp 0.3s ease-out;
  padding: 0 0 15px 0;
}
</style>
