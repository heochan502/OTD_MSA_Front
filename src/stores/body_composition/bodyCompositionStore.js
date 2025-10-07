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
    filteredMetrics: (state) => {
      const targetCodes = ["weight", "percentBodyFat", "skeletalMuscleMass"];
      return state.metrics.filter((m) => targetCodes.includes(m.metricCode));
    },
  },

  actions: {
    async fetchLastestBodyComposition() {
      console.log("getLastestBodyComposition : ");
      const res = await getLastestBodyComposition();
      console.log("getLastestBodyComposition : ", res.data);
      this.lastest = res.data;
    },
    async fetchSeriesBodyComposition() {
      console.log("fetchSeriesBodyComposition : ");
      const res = await getSeries();
      this.series = res.data;
    },
    async fetchBodyCompositionMetrics() {
      const res = await getMetrics();
      this.metrics = res.data;
    },
    clearSeries() {
      this.series = [];
    },
  },
  persist: true,
});
