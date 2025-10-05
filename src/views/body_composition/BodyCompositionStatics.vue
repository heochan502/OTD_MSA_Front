<script setup>
import { onMounted, ref } from "vue";
import lineChart from "@/components/exercise/lineChart.vue";
import { useBodyCompositionStore } from "@/stores/body_composition/bodyCompositionStore";

const model = ref(true);
const bodyCompositionStore = useBodyCompositionStore();

// TODO: 서버에서 내려받을 수 있도록 api 수정하기
const metrics = [
  "weight",
  "bmi",
  "skeletal_muscle_mass",
  "body_fat_mass",
  "protein",
  "mineral",
  "total_body_water",
  "basal_metabolic_rate",
  "percent_body_fat",
];
</script>

<template>
  <div class="wrap">
    <div class="d-flex align-center justify-space-between">
      <div class="day_picker otd-border">
        <div class="otd-body-2">{{ "2024.10.16 ~ 최근" }}</div>
      </div>
      <div class="d-flex align-center ga-2">
        <span>전체</span>
        <v-switch
          v-model="model"
          hide-details
          inset
          density="compact"
          color="#989898"
        ></v-switch>
        <span>최근</span>
      </div>
    </div>
    <div>
      <lineChart :logs="bodyCompositionStore.series.points" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.day_picker {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 148px;
  height: 30px;
  background-color: #fff;

  border-radius: 10px;
}
</style>
