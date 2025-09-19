<script setup>
import { onMounted, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getExerciseRecordList } from "@/services/exercise/exerciseService";
import { useExerciseRecordStore } from "@/stores/exercise/exerciseRecordStore";
import { calcDuration } from "@/utils/exerciseUtils";
import { getDateString, formatTimeKR } from "@/utils/dateTimeUtils";

const router = useRouter();
const route = useRoute();
const exerciseRecordStore = useExerciseRecordStore();
const todayStr = getDateString();

// 페이징 정보
const params = reactive({
  page: 1,
  row_per_page: null,
  type: null,
  date: null,
  memberId: 1,
});

onMounted(() => {
  exerciseRecordStore.fetchExercises();
  getData();
});

const getData = async () => {
  if (route.name === "ExerciseMain") {
    // 메인 화면에서 일간 기록
    params.type = "daily";
    params.row_per_page = 3;
    params.date = todayStr;
  } else if (route.name === "ExerciseRecord") {
    // 더보기화면이면 월간 기록
    params.type = "monthly";
    params.row_per_page = 10;
    params.date = exerciseRecordStore.today;
  }

  const res = await getExerciseRecordList(params);

  exerciseRecordStore.addToday(res.data);
};

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
        v-for="item in exerciseRecordStore.today"
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
          <span v-if="item.distance === null">{{
            calcDuration(item.startAt, item.endAt)
          }}</span>

          <span>{{ item.distance }}km</span>
        </div>
        <div class="d-flex align-center ga-2">
          <span class="otd-body-3">{{ formatTimeKR(item.startAt) }}</span>
          <img
            class="btn_more"
            src="\image\exercise\btn_more.png"
            alt="상세보기 버튼"
            @click.prevent="goDetail(1)"
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
