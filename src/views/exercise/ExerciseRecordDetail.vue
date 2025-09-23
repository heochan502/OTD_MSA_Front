<script setup>
import WeeklyCalendar from "@/components/exercise/WeeklyCalendar.vue";
import { onMounted, reactive, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getExerciseRecordDetail } from "@/services/exercise/exerciseService";
import { formatTimeKR } from "@/utils/dateTimeUtils";
import { calcDuration } from "@/utils/exerciseUtils";
import { useExerciseRecordStore } from "@/stores/exercise/exerciseRecordStore";
import effortLevels from "@/assets/effortLevels.json";

const route = useRoute();
const exerciseRecordStore = useExerciseRecordStore();
const state = reactive({
  record: {},
});
onMounted(() => {
  getData();
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
const duration = computed(() =>
  calcDuration(state.record.startAt, state.record.endAt)
);
const recordId = route.params.exerciseRecordId;
const memberId = 1;
const getData = async () => {
  if (!recordId) return;

  const res = await getExerciseRecordDetail(recordId, { memberId });

  if (res === undefined || res.status !== 200) {
    alert(`에러발생? ${res.status}`);
    return;
  }

  state.record = res.data;
};
</script>

<template>
  <div class="wrap otd-body-1">
    <!-- 상단 주간 달력 -->
    <div class="weekly_calendar">
      <WeeklyCalendar />
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
          :selectedDate="2025 - 09 - 17"
          :logs="0"
          label="exerciseDuration"
        /> -->
      </div>
    </div>
  </div>
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
</style>
