<script setup>
import { computed, reactive, onMounted, ref } from 'vue';
import { usePointShop } from './components/pointshop/usePointShop.js';
import PointItemCard from '@/components/pointshop/PointItemCard.vue';
import PointShopStatus from '@/components/pointshop/PointUserStatus.vue';

const isMountedOnce = ref(false);

const {
  userPoints,
  allItems,
  purchasedItemIds,
  fetchUserPoints,
  fetchAllItems,
  fetchPurchasedItems,
  purchaseItem,
  isPurchased
} = usePointShop();

onMounted(async () => {
  if (isMountedOnce.value) return;
  isMountedOnce.value = true;

  try {
    await Promise.all([
      fetchUserPoints(),
      fetchAllItems(),
      fetchPurchasedItems()
    ]);
  } catch (err) {
    console.error('[PointShopListView] 데이터 로딩 중 오류:', err);
    alert('서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
  }
});

const state = reactive({
  search: '',
  showMessage: true
});

const filteredItems = computed(() => {
  if (!Array.isArray(allItems.value)) return [];
  const query = state.search.trim().toLowerCase();
  return query === ''
    ? allItems.value
    : allItems.value.filter(item =>
        item.name.toLowerCase().includes(query)
      );
});

const searchList = computed(() => {
  if (!Array.isArray(filteredItems.value)) return [];
  const names = filteredItems.value.map(item => item.name);
  return [...new Set(names)].slice(0, 5); // 중복 제거
});

const showNoticeMessage = computed(() => {
  return state.showMessage;
});

const onTyping = () => {
  state.showMessage =  state.search.trim() === '';
};

const purchase = async (item) => {
  try {
    await purchaseItem(item);
  } catch (err) {
    console.error('[PointShopListView] 구매 중 오류:', err);
    alert('구매 처리 중 문제가 발생했습니다. 다시 시도해주세요.');
  }
};

</script>

<template>
  <div v-if="isMountedOnce" class="pointshop-wrapper">
    <div class="search-bar-wrapper">
      <div class="input-container">
        <input
          class="form-control"
          autocomplete="off"
          type="text"
          list="search-list-id"
          @input="onTyping"
          v-model="state.search"
        />
        <span v-if="showNoticeMessage" class="input-overlay">검색어를 입력해주세요.</span>
      </div>

      <datalist id="search-list-id" v-if="searchList.length > 0">
        <option v-for="item in searchList" :key="item">{{ item }}</option>
      </datalist>
    </div>

    <div class="point-display-global">
      보유 포인트:
      {{ userPoints.value ? userPoints.value.toLocaleString() : '0' }} P
    </div>

    <div class="pointshop-container">
      <PointItemCard
        v-for="item in (Array.isArray(filteredItems) ? filteredItems : [])"
        :key="item.id"
        :item="item"
        :userPoints="userPoints.value"
        :isPurchased="isPurchased"
        :onPurchase="purchase"
      />
    </div>

    <div v-if="filteredItems.length === 0" class="no-result-message">
      검색 결과가 없습니다.
    </div>

    <PointShopStatus
      :userPoints="userPoints.value"
      :purchasedItemIds="purchasedItemIds"
    />
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
  padding: 20px 20px 0px;
  margin: 0 auto;
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

.point-display-global {
  text-align: right;
  margin: 10px 30px 0 0;
  font-weight: bold;
  font-size: 12px;
  color: #333;
}

.pointshop-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  padding: 20px;
}

.item-name {
  font-weight: bold;
  font-size: 14px;
  margin: 0;
  text-align: left;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 100%;
}

.item-price {
  font-size: 11px;
  color: #555;
  margin: 5px 0;
}

.item-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 150px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.b-button {
  font-size: 12px;
  padding: 5px 10px;
  margin-top: 10px;
  border-radius: 5px;
  background-color: #555;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
  color: #fff;
  width: 100%;
  text-align: center;
}
.b-button:hover {
  background-color: #333;
  color: #fff;
}

.b-button:disabled {
  background-color: #ddd;
  color: #999;
  font-weight: bold;
}

.item-image {
  width: 100px;
  height: 100px;
  object-fit: contain;
  margin-bottom: 10px;
}

.no-result-message {
  text-align: center;
  color: gray;
  font-size: 14px;
  margin-top: 20px;
}

.pointshop_main_margin {
  overflow: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
}
.point-display-global {
  text-align: right;
  margin: 10px 30px 0 0;
  font-weight: bold;
  font-size: 12px;
  color: #333;
}

</style>