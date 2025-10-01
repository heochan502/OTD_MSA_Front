<script setup>
import { ref, onMounted } from 'vue';
import PointPurchaseService from '@/services/pointshop/PointPurchaseService';

const purchaseHistory = ref([]);

onMounted(async () => {
  const res = await PointPurchaseService.getUserPurchaseHistory();
  if (res?.status === 200) {
    purchaseHistory.value = res.data;
  } else {
    alert('구매 이력을 불러오지 못했습니다.');
  }
});
</script>

<template>
  <div class="purchase-history-container">
    <h2 class="history-title">나의 구매 이력</h2>

    <ul v-if="purchaseHistory.length > 0" class="history-list">
      <li v-for="item in purchaseHistory" :key="item.id" class="history-item">
        <span class="item-name">{{ item.itemName }}</span>
        <span class="item-price">{{ item.price.toLocaleString() }}P</span>
        <span class="item-date">{{ formatDate(item.purchasedAt) }}</span>
      </li>
    </ul>

    <p v-else class="no-history-message">구매한 내역이 없습니다.</p>
  </div>
</template>

<script>
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}
</script>

<style scoped>
.purchase-history-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.history-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.history-list {
  list-style: none;
  padding: 0;
}

.history-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #e0e0e0;
  font-size: 14px;
}

.item-name {
  flex: 1;
}

.item-price {
  flex: 0 0 100px;
  text-align: right;
  color: #333;
}

.item-date {
  flex: 0 0 160px;
  text-align: right;
  color: #888;
  font-size: 12px;
}

.no-history-message {
  text-align: center;
  font-size: 14px;
  color: #888;
  padding: 20px 0;
}
</style>
