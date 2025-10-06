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
  actions: {
    async fetchLastestBodyComposition() {
      const res = await getLastestBodyComposition();
      this.lastest = res.data;
    },
    async fetchSeriesBodyComposition() {
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
