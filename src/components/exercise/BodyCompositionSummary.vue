<script setup>
import BmiProg from "@/components/exercise/BmiProg.vue";
</script>

<template>
  <div class="content_wrap">
    <!-- 소제목 -->
    
    <!-- 내용 -->
    <div class="content_main otd-box-style otd-top-margin">
      <!-- 체성분 기록일 -->
      <div>yyyy년 MM월 dd일</div>
      <!-- 체성분 정보 -->
      <div class="d-flex">
        <div>
          <div class="otd-body-1">체중(kg)</div>
          <div class="otd-subtitle-1">{{ 68 }}</div>
        </div>
        <div>
          <div class="otd-body-1">체지방률(%)</div>
          <div class="otd-subtitle-1">{{ 68 }}</div>
        </div>
        <div>
          <div class="otd-body-1">골격근량(kg)</div>
          <div class="otd-subtitle-1">{{ 68 }}</div>
        </div>
      </div>
      <!-- BMI -->
      <BmiProg />
    </div>
  </div>
</template>

<style lang="scss" scoped>



.content_main {
  width: 350px;
  height: 188px;
  padding: 17px;
}
</style>
