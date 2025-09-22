<script setup>
import { computed, onMounted, onUnmounted, reactive } from "vue";
import { useRoute } from "vue-router";
import { useExerciseRecordStore } from "@/stores/exercise/exerciseRecordStore";
import ExerciseRecordList from "@/components/exercise/ExerciseRecordList.vue";
import { getExerciseRecordList } from "@/services/exercise/exerciseService";
import { formatDateYearMonthKR } from "@/utils/dateTimeUtils";
import { result } from "lodash";

const route = useRoute();
const exerciseRecordStore = useExerciseRecordStore();
const now = formatDateYearMonthKR(route.query.date);

onMounted(async () => {
  exerciseRecordStore.clearRecords();
  const date = route.query.date;

  const params = {
    page: 1,
    row_per_page: 10,
    type: "monthly",
    date: date,
    memberId: 1,
  };

  const res = await getExerciseRecordList(params);

  exerciseRecordStore.records = res.data;
});

onUnmounted(() => {
  exerciseRecordStore.clearRecords();
});

const countRecord = exerciseRecordStore.records.length;
</script>

<template>
  <div class="wrap parent">
    <div class="otd-subtitle-1">{{ now }}</div>
    <div class="d-flex justify-center otd-body-1 mb-8">
      <table>
        <colgroup>
          <col style="width: 120px" />
          <col style="width: 120px" />
          <col style="width: 120px" />
        </colgroup>
        <tbody>
          <tr>
            <td></td>
            <td>전체</td>
            <td>평균</td>
          </tr>
          <tr>
            <td>운동</td>
            <td>{{ countRecord }}</td>
            <td></td>
          </tr>
          <tr>
            <td>시간</td>
            <td>{{ "전체시간" }}</td>
            <td>{{ "평균시간" }}</td>
          </tr>
          <tr>
            <td>킬로칼로리</td>
            <td>{{ "전체칼로리" }}</td>
            <td>{{ "평균칼로리" }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="item_wrap">
      <ExerciseRecordList />
    </div>
    <div class="d-flex flex-row-reverse btn">
      <router-link to="/exercise/record_form">
        <img
          class="btn_add"
          src="\public\image\exercise\btn_add.png"
          alt="운동기록 추가하기 버튼"
        />
      </router-link>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.btn {
  z-index: 999999;
  .btn_add {
    width: 50px;
    height: 50px;
  }
}
:hover {
  border: none;
}
</style>
