<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useExerciseRecordStore } from "@/stores/exercise/exerciseRecordStore";
import { getExerciseRecordList } from "@/services/exercise/exerciseService";
import { formatDateISO, formatDateYearMonthISO } from "@/utils/dateTimeUtils";
import { useRoute } from "vue-router";
import btnAdd from "/image/exercise/btn_add_grey.png";

import ExerciseRecordList from "@/components/exercise/ExerciseRecordList.vue";
import BodyCompositionSummary from "@/components/BodyComposition/BodyCompositionSummary.vue";
import WeeklyCalendar from "@/components/exercise/WeeklyCalendar.vue";
import BodyCompositionStatics from "../body_composition/BodyCompositionStatics.vue";

const route = useRoute();
const exerciseRecordStore = useExerciseRecordStore();
const selectedDate = ref(formatDateISO(new Date()));
const monthly = computed(() => formatDateYearMonthISO(selectedDate.value));

onMounted(async () => {
  await exerciseRecordStore.fetchExercises();
  fetchMonthlyRecords(monthly.value);
  onDateClick(selectedDate.value);
});
const fetchMonthlyRecords = async (date) => {
  const params = {
    page: 1,
    row_per_page: 1000,
    type: "monthly",
    date: date, // YYYY-MM-DD
  };

  const res = await getExerciseRecordList(params);
  if (res && res.status === 200) {
    exerciseRecordStore.monthlyRecords = res.data;
  } else {
    exerciseRecordStore.monthlyRecords = [];
    console.warn("월 기록 조회 실패", res);
  }
};

// @click
const onDateClick = async (date) => {
  exerciseRecordStore.clearRecords();
  selectedDate.value = formatDateISO(date);
  // date 는 JS Date 객체 (컴포넌트에서 toDate()로 emit)

  const params = reactive({
    page: 1,
    row_per_page: 2,
    type: "daily",
    date: formatDateISO(date), // YYYY-MM-DD 형태
  });

  const res = await getExerciseRecordList(params);
  if (res === undefined || res.status !== 200) {
    alert(`에러발생? ${res.status}`);
    return;
  }
  exerciseRecordStore.records = res.data;
};
</script>

<template>
  <div class="wrap content_wrap">
    <div class="weekly_calendar">
      <WeeklyCalendar :recordDate="selectedDate" @click-date="onDateClick" />
    </div>
    <div class="exercise_report">
      <div class="subtitle ga-1">
        <div class="d-flex align-center ga-1 mb-3">
          <span class="otd-subtitle-1 mb-0">운동기록</span>
          <router-link to="/exercise/record_form">
            <img class="btn_add" :src="btnAdd" alt="운동기록 추가 버튼" />
          </router-link>
        </div>
        <div>
          <router-link
            :to="{
              path: '/exercise/record',
              query: {
                date: monthly,
              },
            }"
          >
            <span class="otd-body-2">더보기</span>
          </router-link>
        </div>
      </div>
      <ExerciseRecordList />
    </div>
    <div class="body_composition">
      <div class="subtitle">
        <div class="d-flex align-center ga-1 mb-3">
          <span class="otd-subtitle-1">체성분</span>
          <!-- <img class="btn_add" :src="btnAdd" alt="체성분 추가 버튼" /> -->
        </div>
        <router-link to="/exercise/body_composition">
          <span class="otd-body-2">변화 보기</span>
        </router-link>
      </div>
      <BodyCompositionSummary />
    </div>
  </div>
</template>

<style lang="scss" scoped>
* {
  text-decoration: none;
}
.content_wrap {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}
.subtitle {
  display: flex;
  align-content: center;
  justify-content: space-between;
  margin-top: 15px;
  max-width: 350px;
}

.btn_add {
  width: 16px;
  height: 16px;
}
</style>
