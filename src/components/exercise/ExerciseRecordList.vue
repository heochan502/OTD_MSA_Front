<script setup></script>

<template>
  <!-- 운동기록 영역 -->
  <div class="content_wrap">
    <!-- <운동기록> -->
  </div>
  <!-- <리스트> -->
  <div class="otd-top-margin">
    <ul class="d-flex flex-column ga-2 p-0">
      <li class="list_item otd-box-style">
        <div class="d-flex flex-column otd-body-1">
          <span>운동명</span>
          <span>운동시간 || 거리</span>
        </div>
        <div class="d-flex align-center ga-2">
          <span class="otd-body-3">운동시작시간</span>

          <img
            class="btn_more"
            src="\public\image\main\btn_more.png"
            alt="상세보기 버튼"
          />
        </div>
      </li>
      <li class="list_item otd-box-style">
        <div class="d-flex flex-column otd-body-1">
          <span>운동명</span>
          <span>운동시간 || 거리</span>
        </div>
        <div class="d-flex align-center ga-2">
          <span class="otd-body-3">운동시작시간</span>
          <img
            class="btn_more"
            src="\public\image\main\btn_more.png"
            alt="더보기 버튼"
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
