import { defineStore } from "pinia";
import {
  getLastestBodyComposition,
  getMetrics,
  getSeries,
} from "@/services/body_composition/bodyCompositionService";

export const useBodyCompositionStore = defineStore("bodyComposition", {
  state: () => ({
    lastest: {},
    series: [],
    metrics: [],
  }),
  getters: {
    // 메인 화면 토글로 사용할 항목
    filteredMetrics: (state) => {
      const targetCodes = [
        "weight",
        "percent_body_fat",
        "skeletal_muscle_mass",
      ];
      return state.metrics.filter((m) => targetCodes.includes(m.metricCode));
    },
  },

  actions: {
    // 가장 최근 데이터
    async fetchLastestBodyComposition() {
      // console.log("getLastestBodyComposition : ");
      const res = await getLastestBodyComposition();
      // console.log("getLastestBodyComposition : ", res.data);
      this.lastest = res.data;
    },

    // 그래프에 사용할 전체 데이터
    async fetchSeriesBodyComposition() {
      // console.log("fetchSeriesBodyComposition : ");

      try {
        const res = await getSeries();
        this.series = res.data;
      } catch (error) {
        // 에러 발생 시 에러 메시지와 빈 배열
        console.log("fetchSeriesBodyComposition error: ", error);
        this.metrics = [];
      }
      console.log("체성분 series", this.series);
    },

    // 측정 항목들
    async fetchBodyCompositionMetrics() {
      try {
        const res = await getMetrics();
        this.metrics = res.data;
      } catch (error) {
        // 에러 발생 시 에러 메시지와 빈 배열
        console.error("fetchBodyCompositionMetrics error:", error);
        this.metrics = [];
      }
    },

    clearSeries() {
      this.series = [];
    },
  },
  persist: true,
});
