<script setup>
import { onMounted, reactive } from "vue";
import BmiProg from "@/components/exercise/BmiProg.vue";
import { getLastestBodyComposition } from "@/services/body_composition/bodyCompositionService";
import { formatDateKR } from "@/utils/dateTimeUtils";
import { useBodyCompositionStore } from "@/stores/body_composition/bodyCompositionStore";

const bodyCompositionStore = useBodyCompositionStore();

onMounted(async () => {});
</script>

<template>
  <div class="content_wrap">
    <!-- 내용 -->
    <div class="content_main otd-box-style">
      <!-- 체성분 기록일 -->
      <div class="current_date otd-body-3">
        {{ formatDateKR(bodyCompositionStore.lastest.created_at) }}
      </div>
      <div class="d-flex flex-column align-center">
        <!-- 체성분 정보 -->
        <div class="item_wrap">
          <div class="item">
            <div class="otd-body-1">체중(kg)</div>
            <div class="otd-subtitle-1">
              {{ bodyCompositionStore.lastest.weight }}
            </div>
          </div>
          <div class="item">
            <div class="otd-body-1">체지방률(%)</div>
            <div class="otd-subtitle-1">
              {{ bodyCompositionStore.lastest.percent_body_fat }}
            </div>
          </div>
          <div class="item">
            <div class="otd-body-1">골격근량(kg)</div>
            <div class="otd-subtitle-1">
              {{ bodyCompositionStore.lastest.skeletal_muscle_mass }}
            </div>
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
  min-width: 320px;
  width: 100%;
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
