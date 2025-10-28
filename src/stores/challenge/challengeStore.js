import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';

export const useChallengeStore = defineStore(
  'challenge',
  () => {
    const state = reactive({
      progressChallenge: {
        weeklyCount: 0,
        competitionCount: 0,
        personalCOunt: 0,
      },
      lastMonthCheck: '',
      lastWeekCheck: '',
      // monthlySettlement: [],
      // weeklySettlement: [],
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
    });

    const addChallenge = () => {};

    const setChallengeCount = (data) => (state.progressChallenge = data);

    return {
      state,
      setChallengeCount,
    };
  },
  {
    persist: true,
  }
);
