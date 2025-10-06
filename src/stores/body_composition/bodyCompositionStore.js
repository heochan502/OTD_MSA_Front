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
       console.log("getLastestBodyComposition : ");
      const res = await getLastestBodyComposition();
         console.log("getLastestBodyComposition : ",res.data);
      this.lastest = res.data;
    },
    async fetchSeriesBodyComposition() {
        console.log("fetchSeriesBodyComposition : ");
      const res = await getSeries();
      this.series = res.data;
    },
  },
  persist: true,
});
