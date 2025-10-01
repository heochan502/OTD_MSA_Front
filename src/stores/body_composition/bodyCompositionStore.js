import { defineStore } from "pinia";
import { getLastestBodyComposition } from "@/services/body_composition/bodyCompositionService";
export const useBodyCompositionStore = defineStore("bodyComposition", {
  state: () => ({
    lastest: {},
  }),
  actions: {
    async fetchLastestBodyComposition() {
      const res = await getLastestBodyComposition();
      this.lastest = res.data;
    },
  },
});
