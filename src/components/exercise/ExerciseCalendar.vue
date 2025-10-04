<script setup>
import { onMounted, ref, computed, reactive } from "vue";
import { useExerciseRecordStore } from "@/stores/exercise/exerciseRecordStore";
import { formatDateYearMonthKR, formatDateISO } from "@/utils/dateTimeUtils";
import { getExerciseRecordList } from "@/services/exercise/exerciseService";

const exerciseRecordStore = useExerciseRecordStore();
const calendarAttributes = ref([]);

// 오늘날짜
const selectedDate = ref(new Date());

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

const getParamsFromDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const start = `${year}-${month}-01`;
  const end = `${year}-${month}-${new Date(
    year,
    date.getMonth() + 1,
    0
  ).getDate()}`;
  return { start, end };
};

// 점 찍을 때 해당 일자에 데이터 있는지 확인하기 위함
const recordSet = computed(
  () =>
    new Set(
      exerciseRecordStore.monthlyRecords.map((r) =>
        formatDateISO(new Date(r.startAt))
      )
    )
);
</script>

<template>
  <v-card class="calendar_card">
    <vc-calendar
      is-expanded
      v-model="selectedDate"
      :attributes="calendarAttributes"
      :locale="'ko'"
      :show-adjacent-months="false"
      style="border: none"
      class="calendar h-100 w-100"
      @did-move="onDidMove"
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

      <!-- 기록일에 점찍기 -->
      <template #day-content="{ day }">
        <div class="text-center">
          <div
            :class="{
              today: formatDateISO(day.date) === formatDateISO(new Date()),
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
      </template>
    </vc-calendar>
  </v-card>
</template>

<style lang="scss" scoped>
.calendar_card {
  padding: 0;
  box-shadow: none;
}

.today {
  background-color: #ffe864;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
}

.dot-wrapper {
  display: flex;
  justify-content: center;
  
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
  background-color: #00d5df;
}
</style>
