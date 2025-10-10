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
  }),
  // getters: {
  //   // 메인 화면 토글로 사용할 항목
  //   filteredMetrics: (state) => {
  //     const targetCodes = [
  //       "weight",
  //       "percent_body_fat",
  //       "skeletal_muscle_mass",
  //     ];
  //     // console.log("맞나", state.metrics);
  //     return state.metrics.filter((m) => targetCodes.includes(m.metricCode));
  //   },
  // },

  actions: {
    // 가장 최근 데이터
    // async fetchLastestBodyComposition() {
    //   const res = await getLastestBodyComposition();
    //   console.log("getLastestBodyComposition : ", res.data);
    //   this.lastest = res.data;
    // },

    // 그래프에 사용할 전체 데이터
    // async fetchSeriesBodyComposition() {
    //   // console.log("fetchSeriesBodyComposition : ");
    //   try {
    //     const res = await getSeries();
    //     this.series = res.data;
    //   } catch (error) {
    //     // 에러 발생 시 에러 메시지와 빈 배열
    //     console.log("fetchSeriesBodyComposition error: ", error);
    //     this.series = [];
    //   }
    //   // console.log("체성분 series", this.series);
    // },

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
    addLastest() {
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
