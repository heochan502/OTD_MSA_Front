<script setup>
import { computed } from "vue";
import { useBodyCompositionStore } from "@/stores/body_composition/bodyCompositionStore";

const bodyCompositionStore = useBodyCompositionStore();

// bmi 관련
const minBmi = 15;
const maxBmi = 40;

// bmi 계산식
const bmi = computed(() => {
  const heightInMeters = bodyCompositionStore.lastest.height / 100;
  if (!heightInMeters || !bodyCompositionStore.lastest.weight) return 0;

  return parseFloat(
    (bodyCompositionStore.lastest.weight / heightInMeters ** 2).toFixed(1)
  );
});
const bmiStatus = computed(() => {
  const userBmi = bmi.value;
  if (userBmi === 0) return "기록없음";
  else if (userBmi < 18.5) return "저체중";
  else if (userBmi < 25) return "정상체중";
  else if (userBmi < 30) return "과체중";
  else if (userBmi < 35) return "비만";
  else return "고도비만";
});
</script>

<template>
  <div class="content_bmi">
    <div class="d-flex justify-space-between">
      <div class="d-flex ga-1">
        <span class="otd-body-2"> BMI </span>
        <span class="otd-body-1">
          {{ bmi }}
        </span>
      </div>
      <div class="otd-caption chip_bmi">{{ bmiStatus }}</div>
    </div>
    <div>
      <!-- 슬라이더로 현재 유저 bmi 보여주기 -->
      <div class="bmi-slider-wrapper">
        <div class="gradient-bar w-100"></div>
        <v-slider
          :model-value="bmi"
          :min="minBmi"
          :max="maxBmi"
          step="0.1"
          track-size="12"
          thumb-size="6"
          thumb-color="white"
          color="transparent"
          readonly
          thumb-label
          hide-details
        />
      </div>
      <!-- 범례 -->
      <div class="bmi-legend">
        <span>15</span>
        <span>18.5</span>
        <span>25</span>
        <span>30</span>
        <span>35</span>
        <span>40</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.content_bmi {
  width: 100%;
  max-width: 315px;
  min-width: 320px;
  .chip_bmi {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 65px;
    height: 20px;
    border-radius: 5px;

    background-color: #ffe864;
  }

  .bmi-slider-wrapper {
    position: relative;
  }
  .gradient-bar {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    height: 8px;
    max-width: 315px;
    border-radius: 6px;
    background: linear-gradient(
      to right,
      #00d5df 11%,
      #9ae095 39%,
      #ffe864 65%,
      #ff5050 100%
    );
    z-index: 0;
  }
}

.bmi-legend {
  display: flex;
  justify-content: space-between;
  //   color: #ececec;
  font-size: 9px;
  max-width: 315px;
}
</style>
