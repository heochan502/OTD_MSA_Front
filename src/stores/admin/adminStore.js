import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';

export const useAdminStore = defineStore(
  'admin',
  () => {
    const state = reactive({
      selectedUser: {},
      selectedQna: {},
      selectedPostId: 0,
      selectedQnaId: 0,
    });

    const setSelectedUser = (data) => (state.selectedUser = data);
    const setSelectedPostId = (data) => (state.selectedPostId = data);
    const setSelectedQnaId = (data) => (state.selectedQnaId = data);

    return {
      state,
      setSelectedUser,
      setSelectedPostId,
      setSelectedQnaId,
    };
  },
  {
    persist: true,
  }
);
