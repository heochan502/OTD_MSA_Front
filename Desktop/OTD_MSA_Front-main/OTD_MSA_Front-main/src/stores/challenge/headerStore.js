import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useHeaderStore = defineStore('header', () => {
  const detailName = ref('');
  const setDetailName = (name) => {
    detailName.value = name;
  };
  return { detailName, setDetailName };
});
