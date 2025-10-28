<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useExerciseRecordStore } from "@/stores/exercise/exerciseRecordStore";
import { calcDuration, calcEffortAvg, calcKcal } from "@/utils/exerciseUtils";
import {
  getDateString,
  formatTimeKR,
  formatDateKR,
} from "@/utils/dateTimeUtils";
import { getFeedbackMessage } from "@/utils/getFeedbackMessage";

const router = useRouter();
const exerciseRecordStore = useExerciseRecordStore();

const props = defineProps({
  records: {
    type: Array,
    default: () => [],
  },
});

// const todayRecords = computed(() => exerciseRecordStore.today);
// const yesterdayRecords = computed(() => exerciseRecordStore.yesterday);

// const todayKcal = computed(() => calcKcal(todayRecords.value));
// const yesterdayKcal = computed(() => calcKcal(yesterdayRecords.value));

// const todayDuration = computed(() => calcDuration(todayRecords.value));
// const yesterdayDuration = computed(() => calcDuration(yesterdayRecords.value));

// const todayEffortAvg = computed(() => calcEffortAvg(todayRecords.value));
// const yesterdayEffortAvg = computed(() =>
//   calcEffortAvg(yesterdayRecords.value)
// );
// console.log("여기여기", yesterdayRecords.value);

// const feedbackMessage = computed(() =>
//   getFeedbackMessage({
//     todayDuration: todayDuration.value,
//     yesterdayDuration: yesterdayDuration.value,
//     todayEffort: todayEffortAvg.value,
//     yesterdayEffort: yesterdayEffortAvg.value,
//     todayKcal: todayKcal.value,
//     yesterdayKcal: yesterdayKcal.value,
//     isFirst: todayRecords.length === 1 && yesterdayRecords.length === 0,
//     isComeback: yesterdayRecords.length === 0 && todayRecords.length === 1,
//     hasRecord: todayRecords.length > 0,
//   })
// );

// @click
const goDetail = (exerciseRecordId) => {
  router.push(`/exercise/record/${exerciseRecordId}`);
};
</script>

<template>
  <!-- 운동기록 영역 -->
  <div class="content_wrap">
    <!-- <운동기록> -->
  </div>
  <!-- <리스트> -->
  <div>
    <ul class="d-flex flex-column ga-2 p-0">
      <li
        v-if="exerciseRecordStore.records.length < 1"
        class="list_item otd-box-style"
      >
        <span>운동 기록이 없어요. 잊지말고 기록하세요!</span>
      </li>
      <li>
        <!-- <div>{{ feedbackMessage }}</div> -->
      </li>
      <li
        v-for="item in exerciseRecordStore.records"
        :key="item.exerciseRecordId"
        class="list_item otd-box-style"
      >
        <div class="d-flex flex-column otd-body-1">
          <span>
            {{
              exerciseRecordStore.exerciseList[item.exerciseId - 1]
                ?.exerciseName
            }}
          </span>
          <span v-if="item.distance === null"
            >{{ calcDuration(item.startAt, item.endAt) }}분</span
          >
          <span v-else>{{ item.distance }}km</span>
        </div>
        <div class="d-flex align-center ga-2">
          <div class="d-flex flex-column align-end">
            <span class="otd-body-3">{{ formatTimeKR(item.startAt) }}</span>
            <span class="otd-caption">{{ formatDateKR(item.startAt) }}</span>
          </div>
          <img
            class="btn_more"
            src="\image\exercise\btn_more.png"
            alt="상세보기 버튼"
            @click.prevent="goDetail(item.exerciseRecordId)"
          />
        </div>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
* {
  text-decoration: none;
}

.list_item {
  display: flex;
  align-content: center;
  align-items: center;
  justify-content: space-between;

  min-width: 320px;
  // max-width: 350px;
  width: 100%;
  height: 75px;
  padding: 17px;

  .btn_more {
    width: 28px;
    height: 28px;
  }
}
</style>
