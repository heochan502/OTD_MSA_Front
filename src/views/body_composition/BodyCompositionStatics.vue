<script setup>
import { onMounted, ref } from "vue";
import StaticChart from "@/components/exercise/StaticChart.vue";
import { useBodyCompositionStore } from "@/stores/body_composition/bodyCompositionStore";

const bodyCompositionStore = useBodyCompositionStore();
const toggle = ref(true);
const filterRange = ref({
  start_date: "",
  end_date: "",
});
</script>

<template>
  <div class="wrap">
    <div class="d-flex align-center justify-space-between">
      <!-- <router-link to="/exercise/body_composition/filter">
        <div class="day_picker otd-border">
          <div class="otd-body-2">조회 필터링</div>
        </div>
      </router-link> -->
    </div>
    <div class="d-flex align-center flex-row-reverse ga-2">
      <span>전체</span>
      <v-switch
        v-model="toggle"
        hide-details
        inset
        density="compact"
        color="#989898"
      ></v-switch>
      <span>최근</span>
    </div>
    <div>
      <!-- <lineChart :logs="bodyCompositionStore.series" /> -->
      <StaticChart
        :series="bodyCompositionStore.series"
        :metrics="bodyCompositionStore.metrics"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
* {
  text-decoration: none;
}
.day_picker {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 148px;
  height: 30px;
  background-color: #fff;

  border-radius: 10px;
  cursor: pointer;
}
</style>
