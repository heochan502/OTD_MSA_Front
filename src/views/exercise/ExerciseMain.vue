<script setup>
import { ref } from "vue";

const claendarAttrs = ref([
  {
    key: "today",
    dates: new Date(),
  },
]);
</script>

<template>
  <div class="wrap">
    <div class="content">
      <div class="d-flex align-center ga-2">
        <!-- 캘린더 아이콘 -->
        <img
          src="\public\image\main\calender.png"
          alt="calendar-icon"
          class="calendar-icon"
        />
        <!-- 현재 년월 -->
        <span class="otd-subtitle-1">{{ "2025년 9월" }}</span>
      </div>
      <!-- weekly 영역 -->
      <div class="d-flex justify-center otd-top-margin">
        <vc-calendar
          class="calendar-style"
          view="weekly"
          :attributes="claendarAttrs"
        >
          <template #header-title-wrapper></template>
        </vc-calendar>
      </div>
    </div>
    <!-- 운동기록 영역 -->
    <div class="content">
      <!-- <운동기록> -->
      <div class="d-flex align-center subtitle">
        <div class="d-flex align-center ga-1">
          <p class="otd-subtitle-1 mb-0">운동기록</p>
          <img
            class="btn-add"
            src="\public\image\main\btn_add_grey.png"
            alt="운동기록 추가 버튼"
          />
        </div>
        <div>
          <span class="otd-body-2">더보기</span>
        </div>
      </div>
      <!-- <리스트> -->
      <div class="list-wrap otd-top-margin">
        <ul class="d-flex flex-column ga-2 p-0">
          <li class="list-item otd-box-style">
            <div class="d-flex flex-column otd-body-1">
              <span>운동명</span>
              <span>운동시간 || 거리</span>
            </div>
            <div class="d-flex align-center ga-2">
              <span class="otd-body-3">운동시작시간</span>
              <img
                class="btn-more"
                src="\public\image\main\btn_more.png"
                alt="더보기 버튼"
              />
            </div>
          </li>
          <li class="list-item otd-box-style">
            <div class="d-flex flex-column otd-body-1">
              <span>운동명</span>
              <span>운동시간 || 거리</span>
            </div>
            <div class="d-flex align-center ga-2">
              <span class="otd-body-3">운동시작시간</span>
              <img
                class="btn-more"
                src="\public\image\main\btn_more.png"
                alt="더보기 버튼"
              />
            </div>
          </li>
        </ul>
      </div>
    </div>
    <div class="content">
      <span class="otd-subtitle-1">체성분 분석</span>
      <div class="otd-"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
p {
  padding: 0px;
}
.content {
  margin-bottom: 30px;
}
.calendar-icon {
  width: 18px;
  height: 18px;
}
.btn-add {
  width: 16px;
  height: 16px;
}
.subtitle {
  gap: 218px;
}
.list-item {
  display: flex;
  align-content: center;
  align-items: center;
  justify-content: space-between;

  min-width: 350px;
  height: 75px;
  // margin: 5px 0;
  padding: 17px;

  .btn-more {
    width: 28px;
    height: 28px;
  }
}
</style>
