<script setup>
import { ref, onMounted } from 'vue';
import PointRechargeService from '@/services/pointshop/PointRechargeService';

const rechargeHistory = ref([]);
const isLoading = ref(true);

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const pad = (n) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

const fetchRechargeHistory = async () => {
  try {
    const res = await PointRechargeService.getRechargeHistory();
    rechargeHistory.value = Array.isArray(res.data)
      ? res.data
      : res.data?.data || [];
  } catch (err) {
    console.error('[PointRechargeHistoryView] 서버 통신 실패:', err);
    alert('충전 이력을 불러올 수 없습니다.');
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchRechargeHistory);
</script>

<template>
  <div class="recharge-history">
    <h2 class="title">🔋 포인트 충전 이력</h2>

    <div v-if="isLoading" class="loading-message">불러오는 중입니다...</div>

    <table v-else>
      <thead>
        <tr>
          <th>충전일</th>
          <th>충전 금액</th>
          <th>잔액</th>
        </tr>
      </thead>

      <tbody v-if="rechargeHistory.length > 0">
        <tr v-for="item in rechargeHistory" :key="item.rechargeId || item.id">
          <td>{{ formatDate(item.rechargeTime || item.createdAt) }}</td>
          <td>{{ Number(item.amount || 0).toLocaleString() }} P</td>
          <td>{{ Number(item.pointBalance || 0).toLocaleString() }} P</td>
        </tr>
      </tbody>

      <tbody v-else>
        <tr>
          <td colspan="3" class="no-data">충전 이력이 없습니다.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.recharge-history {
  max-width: 800px;
  margin: 40px auto 0;
  padding: 20px;
  background-color: #fafafa;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}
.title {
  font-size: 1.3rem;
  font-weight: bold;
  color: #222;
  text-align: center;
  margin-bottom: 20px;
}
table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
}
th,
td {
  padding: 12px 10px;
  border-bottom: 1px solid #ddd;
  text-align: center;
  font-size: 0.95rem;
}
th {
  background-color: #f2f2f2;
  color: #444;
  font-weight: 600;
}
tr:hover td {
  background-color: #f9f9f9;
}
.loading-message,
.no-data {
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 0.95rem;
}
</style>
