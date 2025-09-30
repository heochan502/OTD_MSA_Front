<script setup>
import { onMounted, reactive, computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import effortLevels from "@/assets/effortLevels.json";
import WeeklyCalendar from "@/components/exercise/WeeklyCalendar.vue";
import WeeklyChart from "@/components/exercise/WeeklyCalendar.vue";
import {
  getExerciseRecordDetail,
  getExerciseRecordList,
  getExerciseRecordWeekly,
} from "@/services/exercise/exerciseService";
import { formatTimeKR, formatDateISO } from "@/utils/dateTimeUtils";
import { calcDuration } from "@/utils/exerciseUtils";
import { useExerciseRecordStore } from "@/stores/exercise/exerciseRecordStore";

dayjs.extend(isoWeek);

const route = useRoute();
const exerciseRecordStore = useExerciseRecordStore();
const selectedDate = ref();
const selectionItems = ref([]); // 모달에 보여질 운동 기록들
const confirmDialog = ref(false); // 운동 선택용 모달 열림 여부
const noticeDialog = ref(false);
const recordId = route.params.exerciseRecordId;

const state = reactive({
  record: {},
  weeklyRecords: [],
});
const currentRecordDate = computed(() => {
  if (!state.record?.startAt) return null;
  return new Date(state.record.startAt); // JS Date 객체로 변환
});

// 선택된 운동
const selectedExercise = computed(() => {
  if (!state.record.exerciseId) return 0;
  return exerciseRecordStore.exerciseList.find(
    (e) => e.exerciseId === state.record.exerciseId
  );
});

// 거리기반운동 여부
const hasDistance = computed(() => {
  return selectedExercise.value ? selectedExercise.value.hasDistance : 0; // 1 또는 0 그대로 반환
});

// 반복횟수기반운동 여부
const hasReps = computed(() => {
  return selectedExercise.value ? selectedExercise.value.hasReps : 0; // 1 또는 0 그대로 반환
});

// 운동 소요시간
const duration = computed(() =>
  calcDuration(state.record.startAt, state.record.endAt)
);

onMounted(() => {
  getData(recordId);
});

// 운동 불러오기
const getData = async (recordId) => {
  if (!recordId) return;

  const res = await getExerciseRecordDetail(recordId);

  if (res === undefined || res.status !== 200) {
    alert(`에러발생? ${res.status}`);
    return;
  }

  state.record = res.data;
};

const onDateClick = async (date) => {
  // 날짜를 선택한 날 기록이 2개 이상이면 모달창을 띄우고 선택한 운동기록을 화면에 보여지게 하기

  exerciseRecordStore.clearRecords();
  selectedDate.value = date;
  // date 는 JS Date 객체 (컴포넌트에서 toDate()로 emit)

  const params = {
    page: 1,
    row_per_page: 2,
    type: "daily",
    date: date, // YYYY-MM-DD 형태
  };

  const res = await getExerciseRecordList(params);
  if (res === undefined || res.status !== 200) {
    alert(`에러발생? ${res.status}`);
    return;
  }
  exerciseRecordStore.records = res.data;

  if (exerciseRecordStore.records.length === 0) {
    noticeDialog.value = true;
  } else if (exerciseRecordStore.records.length === 1) {
    getData(exerciseRecordStore.records.exerciseRecordId);
  } else {
    selectionItems.value = exerciseRecordStore.records;
    confirmDialog.value = true;
  }
};

// 모달에서 선택된 기록
const selectRecord = (record) => {
  confirmDialog.value = false;
  getData(record.exerciseRecordId);
};

watch(
  () => state.record.startAt,
  async (newStartAt) => {
    if (!newStartAt) return;

    const base = dayjs(newStartAt);
    const params = {
      startOfWeek: base.startOf("isoWeek").format("YYYY-MM-DDTHH:mm:ss"),
      endOfWeek: base.endOf("isoWeek").format("YYYY-MM-DDTHH:mm:ss"),
    };
    const res = await getExerciseRecordWeekly(params);
    if (res?.status === 200) {
      state.weeklyRecords = res.data;
    }
  }
);
</script>

<template>
  <div class="wrap otd-body-1">
    <!-- 상단 주간 달력 -->
    <div class="weekly_calendar">
      <WeeklyCalendar
        :recordDate="formatDateISO(currentRecordDate)"
        @click-date="onDateClick"
      />
    </div>
    <!-- 운동 기록 -->
    <div class="content_wrap">
      <div class="subtitle">
        <span class="otd-subtitle-1">{{ state.record.exerciseName }}</span>
        <img src="\image\exercise\btn_trash.png" class="btn_delete" />
      </div>
      <div class="content_main otd-top-margin">
        <div class="content_effort otd-box-style">
          <span>운동 강도</span>
          <span class="emoji">{{
            effortLevels[state.record.effortLevel - 1]?.emoji
          }}</span>
          <span class="otd-subtitle-2">{{
            effortLevels[state.record.effortLevel - 1]?.label
          }}</span>
        </div>
        <div class="content_detail otd-box-style">
          <div class="item_wrap mb-3">
            <div class="item">
              <span>시작 시간</span>
              <span class="otd-subtitle-2">{{
                formatTimeKR(state.record.startAt)
              }}</span>
            </div>
            <div class="item">
              <span>운동 시간</span>
              <span class="otd-subtitle-2">{{ duration }}분</span>
            </div>
          </div>
          <div class="item_wrap">
            <div class="item">
              <span>킬로칼로리</span>
              <span class="otd-subtitle-2"
                >{{ state.record.activityKcal }}kcal</span
              >
            </div>
            <div v-if="hasDistance" class="item">
              <span>거리</span>
              <span class="otd-subtitle-2">{{ state.record.distance }}km</span>
            </div>
            <div v-if="hasReps" class="item">
              <span>반복 횟수</span>
              <span class="otd-subtitle-2">{{ state.record.reps }}rep</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="content_wrap">
      <div class="subtitle">
        <span class="otd-subtitle-1">주간 운동 시간</span>
      </div>
      <div>
        <!-- <WeeklyChart
          :selectedDate="selectedDate"
          :records="state.weeklyRecords"
          label="duration"
        /> -->
      </div>
    </div>
  </div>

  <!-- 모달창 -->
  <v-dialog v-model="confirmDialog" max-width="350" min-height="100">
    <v-card>
      <v-card-title class="otd-subtitle-1"> 운동 기록 선택 </v-card-title>
      <v-card-text>
        <v-list>
          <v-list-item
            v-for="item in selectionItems"
            :key="item.exerciseRecordId"
          >
            <div class="d-flex justify-space-between m-1">
              <div>
                <div class="otd-subtitle-2">
                  {{
                    exerciseRecordStore.exerciseList.find(
                      (e) => e.exerciseId === String(item.exerciseId)
                    )?.exerciseName || "운동명 없음"
                  }}
                </div>
                <div class="otd-body-1">{{ duration }}분</div>
              </div>
              <v-btn @click="selectRecord(item)" class="otd-shadow btn_select">
                보기
              </v-btn>
            </div>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions class="d-flex justify-center">
        <v-btn @click="confirmDialog = false" class="btn_close w-50"
          >닫기</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="noticeDialog" max-width="350" min-height="100">
    <v-card class="pa-2 d-flex">
      <v-card-text class="otd-body-1 text-center">
        <span> 운동을 기록하지 않았어요! </span>
        <v-btn @click="noticeDialog = false" class="btn_close w-50">닫기</v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style lang="scss" scoped>
.subtitle {
  display: flex;
  align-content: center;
  justify-content: space-between;
}
.calendar_icon {
  width: 18px;
  height: 18px;
}
.content_wrap {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;

  .content_main {
    display: flex;
    justify-content: space-between;

    .content_effort {
      display: flex;
      flex-direction: column;
      align-items: center;

      width: 130px;
      height: 150px;
      padding: 20px;

      .emoji {
        font-size: 40px;
      }
    }
    .content_detail {
      width: 210px;
      height: 150px;
      padding: 20px;
    }
  }
}

.item_wrap {
  display: flex;
  gap: 25px;

  .item {
    display: flex;
    flex-direction: column;
  }
}

.btn_delete {
  width: 24px;
  height: 24px;
}
.btn_select {
  background-color: #e6e6e6;
}
.btn_select:hover {
  background-color: #ffe864;
}
.btn_close {
  width: 143px;
  height: 38px;
  margin-top: 20px;
  background-color: #e6e6e6;
  border-radius: 10px;
  box-shadow: none;
}
</style>
