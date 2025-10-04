import { defineStore } from "pinia";
import {
  getLastestBodyComposition,
  getSeries,
} from "@/services/body_composition/bodyCompositionService";

export const useBodyCompositionStore = defineStore("bodyComposition", {
  state: () => ({
    lastest: {},
    series: [],
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
  },
  persist: true,
});
