<script setup>
import { ref, onMounted } from 'vue';
import PointPurchaseService from '@/services/pointshop/PointPurchaseService';

const purchaseHistory = ref([]);

onMounted(async () => {
  const res = await PointPurchaseService.getUserPurchaseHistory();
  if (res?.status === 200) {
    purchaseHistory.value = res.data;
  } else {
    alert('구매 내역을 불러올 수 없습니다.');
  }
});
</script>

<template>
  <div class="purchase-history">
    <h2>구매 이력</h2>
    <table>
      <thead>
        <tr>
          <th>구매일</th>
          <th>아이템명</th>
          <th>포인트</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in purchaseHistory" :key="item.purchaseId">
          <td>{{ item.purchaseDate }}</td>
          <td>{{ item.itemName }}</td>
          <td>{{ item.price.toLocaleString() }}P</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.purchase-history {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  padding: 12px;
  border-bottom: 1px solid #ddd;
  text-align: center;
}
</style>
