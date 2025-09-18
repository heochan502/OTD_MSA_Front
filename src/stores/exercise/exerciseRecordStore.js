import { defineStore } from "pinia";
import { reactive } from "vue";
import {
  getDateString,
  getYesterdayDateString,
  filterExerciseLogsByDate,
} from "@/utils/exerciseUtils";

export const useExerciseRecordStore = defineStore("exerciseRecord", {
  state: () => ({
    exerciseList: [],
    loaded: false,
    today: [], // 오늘 기록
    yesterday: [], // 어제 기록
    recordList: [], // 페이징처리한 리스트
    records: [],
  }),
  actions: {
    async fetchExercises() {
      if (this.loaded) return;
      const res = await getExercise();
      this.exerciseList = res.data;
      this.loaded = true;
    },

    addCalendarDate(list) {
      this.calendarDate.push(...list);
    },
    clearCalendarDate() {
      this.calendarDate = [];
    },
    addRecordList(list) {
      this.recordList.push(...list);

      const todayStr = getDateString(); // 오늘 날짜
      const yesterdayStr = getYesterdayDateString(); // 어제 날짜

      // 오늘 기록
      const todayRecords = filterExerciseLogsByDate(this.recordList, todayStr);

      // 어제 기록
      const yesterdayRecords = filterExerciseLogsByDate(
        this.recordList,
        yesterdayStr
      );

      this.addToday(todayRecords);
      this.addYesterDay(yesterdayRecords);
    },
    clearRecordList() {
      this.recordList = [];
    },
    addToday(list) {
      const newRecords = list.filter(
        (record) =>
          !this.today.some(
            (t) => t.exerciseRecordId === record.exerciseRecordId
          )
      );
      this.today.push(...newRecords);
    },

    addYesterDay(list) {
      const newRecords = list.filter(
        (record) =>
          !this.yesterday.some(
            (t) => t.exerciseRecordId === record.exerciseRecordId
          )
      );
      this.yesterday.push(...newRecords);
    },
  },

  persist: true,
});
