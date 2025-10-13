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
    selectionMetrics: [],
    filterList: [],
    bmiInfo: {
      height: null,
      weight: null,
      bmi: null,
    },
  }),

  actions: {
    // 측정 항목들
    async fetchBodyCompositionMetrics() {
      try {
        const res = await getMetrics();
        this.metrics = res.data;
        const targetCodes = [
          "weight",
          "percent_body_fat",
          "skeletal_muscle_mass",
        ];
        this.selectionMetrics = this.metrics.filter((m) =>
          targetCodes.includes(m.metricCode)
        );
      } catch (error) {
        // 에러 발생 시 에러 메시지와 빈 배열
        console.error("fetchBodyCompositionMetrics error:", error);
        this.metrics = [];
        this.selectionMetrics = [];
      }
    },
    addSeries(list) {
      this.series = [...list];
    },
    addLastest(list) {
      this.lastest = [...list];
    },
    clearSeries() {
      this.series = [];
    },
    clearMetrics() {
      this.metrics = [];
    },
  },

  persist: true,
});
