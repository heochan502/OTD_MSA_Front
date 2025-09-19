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
  <div class="content_wrap">
    <div class="d-flex align-center ga-2">
      <!-- 캘린더 아이콘 -->
      <img
        src="\public\image\main\calender.png"
        alt="캘린더 아이콘"
        class="calendar_icon"
      />
      <!-- 현재 년월 -->
      <span class="otd-subtitle-1">{{ "2025년 9월" }}</span>
    </div>
    <!-- weekly 영역 -->
    <div class="d-flex justify-center otd-top-margin">
      <vc-calendar view="weekly" :attributes="claendarAttrs">
        <template #header-title-wrapper></template>
      </vc-calendar>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.calendar_icon {
  width: 18px;
  height: 18px;
}
</style>
