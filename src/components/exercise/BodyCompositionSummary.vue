<script setup>
import BmiProg from "@/components/exercise/BmiProg.vue";
</script>

<template>
  <div class="content_wrap">
    <!-- 내용 -->
    <div class="content_main otd-box-style">
      <!-- 체성분 기록일 -->
      <div class="current_date otd-body-3">yyyy년 MM월 dd일</div>
      <div class="d-flex flex-column align-center">
        <!-- 체성분 정보 -->
        <div class="item_wrap">
          <div class="item">
            <div class="otd-body-1">체중(kg)</div>
            <div class="otd-subtitle-1">{{ 68 }}</div>
          </div>
          <div class="item">
            <div class="otd-body-1">체지방률(%)</div>
            <div class="otd-subtitle-1">{{ 68 }}</div>
          </div>
          <div class="item">
            <div class="otd-body-1">골격근량(kg)</div>
            <div class="otd-subtitle-1">{{ 68 }}</div>
          </div>
        </div>
        <!-- BMI -->
        <BmiProg />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.content_main {
  width: 350px;
  height: 188px;
  padding: 10px;

  .current_date {
    display: flex;
    flex-direction: row-reverse;
    color: #989898;
    margin-bottom: 10px;
  }
}
.item_wrap {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;

  .item {
    text-align: center;
  }
}
</style>
