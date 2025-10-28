<script setup>
import { ref, computed, watch } from "vue";
import { useExerciseRecordStore } from "@/stores/exercise/exerciseRecordStore";
import { formatDateYearMonthKR, formatDateISO } from "@/utils/dateTimeUtils";
import { getExerciseRecordList } from "@/services/exercise/exerciseService";

const exerciseRecordStore = useExerciseRecordStore();
const now = ref(new Date()); // 현재 보고 있는 달
const selectedDate = ref(new Date()); // 실제 선택된 날짜
const emit = defineEmits(["select-date"]);

// 캘린더 속성
const calendarAttributes = computed(() => {
  const attrs = [];

  // 선택된 날짜 표시
  attrs.push({
    key: "selected-date",
    dates: now.value,
    highlight: "yellow",
  });

  // 기록 있는 날짜 점 표시
  // const recordDates = new Set(exerciseRecordStore.monthlyRecords.map((r) =>
  //   formatDateISO(new Date(r.startAt))
  // ));
  const recordDates = computed(() => {
    return new Set(
      exerciseRecordStore.monthlyRecords.map((r) =>
        formatDateISO(new Date(r.startAt))
      )
    );
  });
  console.log(recordDates.value);
  attrs.push({
    key: "records",
    dates: Array.from(recordDates.value).map((d) => new Date(d)),
    dot: { color: "teal", radius: 3 },
  });

  return attrs;
});

// 선택된 날
const onSelectDate = (date) => {
  selectedDate.value = date.id;
  emit("select-date", date.id);
};

watch(selectedDate, () => {
  console.log("선택한 날", selectedDate.value);
});

// 달력 이동 시 실행되는 함수
const onDidMove = async (pages) => {
  exerciseRecordStore.clearMonthlyRecords();

  // 현재 보여지는 달력의 첫 페이지 정보
  const page = pages[0];
  const date = page.id;

  const params = {
    page: 1,
    row_per_page: 1000,
    type: "monthly",
    date: date,
  };

  const res = await getExerciseRecordList(params);
  exerciseRecordStore.monthlyRecords = res.data;
};
</script>

<template>
  <v-card class="calendar_card">
    <vc-calendar
      is-expanded
      v-model="now"
      :attributes="calendarAttributes"
      :locale="'ko'"
      :show-adjacent-months="false"
      style="border: none"
      class="calendar h-100 w-100"
      @did-move="onDidMove"
      @dayclick="onSelectDate"
    >
      <!-- 타이틀 디자인 수정 -->
      <template #title="{ start, prev, next }">
        <div class="d-flex align-center">
          <v-btn icon variant="text" @click="prev">
            <v-icon>mdi-menu-left</v-icon>
          </v-btn>
          <div class="text-subtitle-1" v-if="start">
            {{ formatDateYearMonthKR(start) }}
          </div>
          <v-btn icon variant="text" @click="next">
            <v-icon>mdi-menu-right</v-icon>
          </v-btn>
        </div>
      </template>

      <!-- day slot -->
      <!-- <template #day-content="{ day }">
        <div class="text-center">
          <div
            class="day-item"
            :class="{
              today: formatDateISO(day.date) === formatDateISO(new Date()),
              selectedDate:
                formatDateISO(day.date) === formatDateISO(selectedDate),
            }"
          >
            {{ day.day }}
          </div>
          <div class="dot-wrapper">
            <span
              v-if="recordSet.has(formatDateISO(day.date))"
              class="dot"
            ></span>
          </div>
        </div>
      </template> -->
    </vc-calendar>
  </v-card>
</template>

<style lang="scss" scoped>
.calendar_card {
  padding: 0;
  box-shadow: none;
}

.day-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.v-calendar__day:hover {
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.1); /* 원하는 배경색 */
  cursor: pointer;
}

.selectedDate {
  background-color: #ffe864;
}

// .today {
//   background-color: #ffe864 !important;
//   border-radius: 50%;
// width: 25px;
// height: 25px;
// display: flex;
// justify-content: center;
// align-items: center;
// margin: 0 auto;
// }

// .dot-wrapper {
//   display: flex;
//   justify-content: center;
// }

// .dot {
//   width: 6px;
//   height: 6px;
//   border-radius: 50%;
//   display: inline-block;
//   background-color: #00d5df;
// }
</style>
