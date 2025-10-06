import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';

export const useAdminStore = defineStore(
  'admin',
  () => {
    const state = reactive({
      selectedUser: {
      },
    });

    const setSelectedUser = (data) => (state.selectedUser = data);

    return {
      state,
      setSelectedUser,
    };
  },
  {
    persist: true,
  }
);
