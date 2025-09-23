import { defineStore } from 'pinia';
import { reactive, computed } from 'vue';

export const useChallengeStore = defineStore(
  'challenge',
  () => {
    const state = reactive({
      progressChallenge: {
        weeklyCount : 0,
        competitionCount : 0,
        personalCOunt : 0,
      },
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
    });

    const addChallenge = () => {

    };

    const setChallengeCount = (data) => (state.progressChallenge = data);

    return {
      state,
      setChallengeCount,
    };
  }
  // {
  //   persist: {
  //     // true만 써도 전체 state가 localStorage에 저장됨
  //     enabled: true,
  //     strategies: [
  //       {
  //         key: 'reminder', // localStorage에 저장될 이름
  //         storage: localStorage, // 기본값이 이거임 (생략 가능)
  //         paths: ['state.fullReminder', 'state.currentYear', 'state.currentMonth', 'state.selectedDate'], // 저장할 속성
  //       },
  //     ],
  //   },
  // }
);
