<script setup>
import { defineProps, ref, reactive, computed } from 'vue';

const allItems = ref([
  { id: 1, name: 'Item1', price: 100 }, 
  { id: 2, name: 'Item2', price: 200 }, 
  { id: 3, name: 'Item3', price: 300 },
  { id: 4, name: 'Item4', price: 400 },
  { id: 5, name: 'Item5', price: 500 },
  { id: 6, name: 'Item6', price: 600 },
]);

const state = reactive({
  search: '',
  searchList: [],
  showMessage: true,
});

const filteredItems = computed(() => {
  const query = state.search.trim().toLowerCase();
  if (!query) return allItems.value;
  return allItems.value.filter(item =>
    item.name.toLowerCase().includes(query)
  );
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
  state.searchList = allItems.value
  .filter(item => item.name.toLowerCase().includes(query))
  .map(item => item.name);
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

const purchase = (item) => {
  const ok = confirm(`${item.name} (${item.price}포인트)를 구매하시겠습니까?`);
  if (ok) {
    alert(`'${item.name}'을(를) 구매했습니다!`);
  }
};
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
    <div class="pointshop-item" v-for="item in filteredItems" :key="item.id">
      <img :src="`/image/pointshop/item${item.id}.png`" alt="Item Image" class="item-image" />
      <div class="item-details">
        <h5 class="item-name"> {{ item.name }}</h5>
        <p class="item-price">Price: {{ item.price }} Points</p>
        <b-button variant="primary" size="sm" @click="purchase(item)">구매</b-button>
        </div>
      </div>
    </div>

      <div v-if="filteredItems.length === 0" class="no-result-message">
      검색 결과가 없습니다.
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

.no-result-message {
  text-align: center;
  color: gray;
  font-size: 14px;
  margin-top: 20px;
}

</style>