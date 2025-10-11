<script setup>
import { computed } from "vue";
import BmiProg from "@/components/exercise/BmiProg.vue";
import { getLastestBodyComposition } from "@/services/body_composition/bodyCompositionService";
import { formatDateKR } from "@/utils/dateTimeUtils";
import { useBodyCompositionStore } from "@/stores/body_composition/bodyCompositionStore";

const bodyCompositionStore = useBodyCompositionStore();

const hasRecord = computed(() => {
  const r = bodyCompositionStore.lastest;
  if (!r) return false;
  return (
    r.height > 0 &&
    r.weight > 0 &&
    r.skeletal_muscle_mass > 0 &&
    r.bmi > 0 &&
    r.percent_body_fat > 0
  );
});
</script>

<template>
  <div class="content_wrap content_main otd-box-style">
    <!-- 내용 -->
    <div v-if="!hasRecord" class="content_main d-flex flex-column align-center">
      <span class="text-h4">☹️</span>
      <span class="otd-subtitle-2"> 체성분 측정 데이터가 없어요 </span>
    </div>
    <div v-else class="content_main otd-box-style">
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
              {{ bodyCompositionStore.lastest.weight || "-" }}
            </div>
          </div>
          <div class="item">
            <div class="otd-body-1">체지방률(%)</div>
            <div class="otd-subtitle-1">
              {{ bodyCompositionStore.lastest.percent_body_fat || "-" }}
            </div>
          </div>
          <div class="item">
            <div class="otd-body-1">골격근량(kg)</div>
            <div class="otd-subtitle-1">
              {{ bodyCompositionStore.lastest.skeletal_muscle_mass || "-" }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- BMI -->
    <BmiProg />
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
