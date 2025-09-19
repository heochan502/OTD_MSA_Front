<script setup>
import WeeklyCalendar from "@/components/exercise/WeeklyCalendar.vue";

import { ref } from "vue";

const hasDistance = false;
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
        <span class="otd-subtitle-1">달리기</span>
        <img src="\image\exercise\btn_trash.png" class="btn_delete" />
      </div>
      <div class="content_main otd-top-margin">
        <div class="content_effort otd-box-style">
          <span>운동 강도</span>
          <span class="emoji">{{ "😓" }}</span>
          <span class="otd-subtitle-2">{{ "어려움" }}</span>
        </div>
        <div class="content_detail otd-box-style">
          <div class="item_wrap mb-3">
            <div class="item">
              <span>시작 시간</span>
              <span class="otd-subtitle-2">{{ 16 }}시{{ "00" }}분</span>
            </div>
            <div class="item">
              <span>운동 시간</span>
              <span class="otd-subtitle-2">{{ 58 }}분</span>
            </div>
          </div>
          <div class="item_wrap">
            <div class="item">
              <span>킬로칼로리</span>
              <span class="otd-subtitle-2">{{ "223" }}kcal</span>
            </div>
            <div v-if="hasDistance" class="item">
              <span>{{ 거리 }}</span>
              <span class="otd-subtitle-2">{{ "16시 00분" }}</span>
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
