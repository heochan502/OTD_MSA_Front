<script setup>
import WeeklyDatePick from "@/components/exercise/WeeklyDatePick.vue";
import ExerciseRecordList from "@/components/exercise/ExerciseRecordList.vue";
import BodyCompositionSummary from "@/components/exercise/BodyCompositionSummary.vue";
</script>

<template>
  <div class="wrap content_wrap">
    <div class="weekly_calendar">
      <div class="d-flex align-center ga-2">
        <!-- 캘린더 아이콘 -->
        <img
          src="\image\main\calender.png"
          alt="캘린더 아이콘"
          class="calendar_icon"
        />
        <!-- 현재 년월 -->
        <span class="otd-subtitle-1">{{ "2025년 9월" }}</span>
      </div>
      <WeeklyDatePick />
    </div>
    <div class="exercise_report">
      <div class="subtitle ga-1">
        <div class="d-flex align-center ga-1 mb-3">
          <span class="otd-subtitle-1 mb-0">운동기록</span>
          <router-link to="/exercise/record_form">
            <img
              class="btn_add"
              src="\image\main\btn_add_grey.png"
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
            src="\image\main\btn_add_grey.png"
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
.calendar_icon {
  width: 18px;
  height: 18px;
}
.btn_add {
  width: 16px;
  height: 16px;
}
</style>
