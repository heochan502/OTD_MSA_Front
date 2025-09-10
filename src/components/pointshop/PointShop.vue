<script setup>
import { defineProps, ref, reactive, computed } from 'vue';

const allItems = ref(['Item1', 'Item2', 'Item3']);

const state = reactive({
  search: '',
  searchList: [],
  showMessage: true,
});

const onTyping = () => {
  state.showMessage = state.search.trim() === '';

  if(state.search.trim() === '') {
    state.searchList = [];
    return;
  }
  pointData();
};

const pointData = () => {
  const query = state.search.toLowerCase().trim();
  if (!query) {
    state.searchList = [];
    return;
  }
  state.searchList = allItems.value.filter(item =>
    item.toLowerCase().includes(query)
  );
};

const showNoticeMessage = computed(() => {
  return state.showMessage && state.searchList.length === 0;
});

const props = defineProps
({
  id: 0,
  image: '',
  name: '',
});
</script>

<template>
  <div class="search-bar-wrapper">
    <div class="input-container">
    <input class="form-control"
      autocomplete="off"
      type="text"
      list="search-list-id"
      @input="onTyping"
      @keyup.enter="pointData"
      v-model="state.search"
    />
      <span v-if="showNoticeMessage" class="input-overlay">검색어를 입력해주세요.</span>
    </div>
    
    <datalist id="search-list-id" v-if="state.searchList.length > 0">
      <option v-for="item in state.searchList" :key="item">{{ item }}</option>
    </datalist>

    <b-button variant="outline-secondary" class="ms-2" size="sm" @click="pointData">
      Search
    </b-button>
  </div>

  <div class="pointshop-container">
    <div class="pointshop-item" v-for="item in 6" :key="item">
      <img :src="`/image/pointshop/item${item}.png`" alt="Item Image" class="item-image" />
      <div class="item-details">
        <h5 class="item-name">Item {{ item }}</h5>
        <p class="item-price">Price: {{ item * 100 }} Points</p>
        <b-button variant="primary" size="sm">구매하기</b-button>
        </div>
      </div>
    </div>
</template>

<style scoped>
.search-bar-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  width: 90%;
  max-width: 500px;
  margin: 30px auto;
}

.input-container {
  position: relative;
  width: 100%;
  flex-grow: 1;
}

.input-container input {
  width: 100%;
}

.input-overlay {
  position: absolute;
  top: 50%;
  left: 12px;
  transform: translateY(-50%);
  color: gray;
  font-size: 13px;
  pointer-events: none;
  opacity: 0.6;
}

.pointshop-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  padding: 20px;
}
</style>