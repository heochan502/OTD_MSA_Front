<script setup>
import { ref, onMounted } from 'vue';
import PointPurchaseService from '@/services/pointshop/PointPurchaseService';

const purchaseHistory = ref([]);
const isLoading = ref(true);

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}
          ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const fetchPurchaseHistory = async () => {
  try {
    isLoading.value = true;
    const res = await PointPurchaseService.getUserPurchaseHistory();
    const list = res?.data ?? res?.data?.data ?? [];

    if (Array.isArray(list)) {
      purchaseHistory.value = list.sort(
        (a, b) => new Date(b.purchaseAt) - new Date(a.purchaseAt)
      );
    } else {
      purchaseHistory.value = [];
    }
  } catch (err) {
    console.error('[PointPurchaseHistoryTable] 구매 이력 조회 실패:', err);
    purchaseHistory.value = [];
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchPurchaseHistory);
</script>

<template>
  <div class="purchase-history">
    <h2 class="title">구매 이력</h2>

    <div v-if="isLoading" class="loading">불러오는 중...</div>

    <table v-else>
      <thead>
        <tr>
          <th>구매일</th>
          <th>아이템명</th>
          <th>사용 포인트</th>
        </tr>
      </thead>
      <tbody v-if="purchaseHistory.length">
        <tr v-for="item in purchaseHistory" :key="item.purchaseId">
          <td>{{ formatDate(item.purchaseAt) }}</td>
          <td>{{ item.pointItemName }}</td>
          <td>{{ item.pointScore.toLocaleString() }} P</td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr><td colspan="3" class="no-data">구매 이력이 없습니다.</td></tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.purchase-history {
  max-width: 700px;
  margin: 0 auto;
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}
.title {
  text-align: center;
  font-weight: bold;
  font-size: 1.3rem;
  margin-bottom: 16px;
}
table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 8px;
  overflow: hidden;
}
th, td {
  padding: 10px;
  text-align: center;
  border-bottom: 1px solid #eee;
}
th {
  background: #f6f6f6;
  font-weight: 600;
  color: #333;
}
.no-data {
  text-align: center;
  padding: 20px;
  color: #777;
}
.loading {
  text-align: center;
  color: #666;
  padding: 20px;
}
</style>
