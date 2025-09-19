<script setup>
import WeeklyDatePick from "@/components/exercise/WeeklyCalendar.vue";
import ExerciseRecordList from "@/components/exercise/ExerciseRecordList.vue";
import BodyCompositionSummary from "@/components/exercise/BodyCompositionSummary.vue";
import testWeeklyCalendar from "@/components/exercise/WeeklyCalendar.vue";
</script>

<template>
  <div class="wrap content_wrap">
    <div class="weekly_calendar">
      <!-- <WeeklyDatePick /> -->
      <test-weekly-calendar />
    </div>
    <div class="exercise_report">
      <div class="subtitle ga-1">
        <div class="d-flex align-center ga-1 mb-3">
          <span class="otd-subtitle-1 mb-0">운동기록</span>
          <router-link to="/exercise/record_form">
            <img
              class="btn_add"
              src="\image\exercise\btn_add_grey.png"
              alt="운동기록 추가 버튼"
            />
          </router-link>
        </div>
        <div>
          <router-link to="/exercise/record">
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
          <img
            class="btn_add"
            src="\image\exercise\btn_add_grey.png"
            alt="체성분 추가 버튼"
          />
        </div>
        <span class="otd-body-2">변화 보기</span>
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
}

.btn_add {
  width: 16px;
  height: 16px;
}
</style>
