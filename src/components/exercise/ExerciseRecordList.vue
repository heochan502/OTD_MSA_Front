<script setup>
import { onMounted, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getExerciseRecordList } from "@/services/exercise/exerciseService";
import { useExerciseRecordStore } from "@/stores/exercise/exerciseRecordStore";
import { calcDuration } from "@/utils/exerciseUtils";
import {
  getDateString,
  formatTimeKR,
  formatDateKR,
} from "@/utils/dateTimeUtils";

const router = useRouter();
const route = useRoute();
const exerciseRecordStore = useExerciseRecordStore();
const todayStr = getDateString();

const props = defineProps({
  records: {
    type: Array,
    default: () => [],
  },
});

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
        오늘도 운동에 도전하세요!
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

  min-width: 350px;
  height: 75px;
  padding: 17px;

  .btn_more {
    width: 28px;
    height: 28px;
  }
}
</style>
