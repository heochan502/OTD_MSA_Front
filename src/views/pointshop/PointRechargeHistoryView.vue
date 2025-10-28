<script setup>
import { ref, onMounted } from 'vue'
import PointRechargeService from '@/services/pointshop/PointRechargeService'

const rechargeHistory = ref([])
const isLoading = ref(true)

// 공통 날짜 포맷
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  const pad = (n) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`
}

// 충전 내역 가져오기
const fetchRechargeHistory = async () => {
  try {
    const res = await PointRechargeService.getRechargeHistory()
    const list = res?.data?.data ?? res?.data ?? []
    rechargeHistory.value = Array.isArray(list) ? list : []
  } catch (err) {
    console.error('[PointRechargeHistoryView] 충전 내역 조회 실패:', err)
    alert('충전 이력을 불러올 수 없습니다.')
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchRechargeHistory)
</script>

<template>
  <div class="history-container">
    <h2 class="page-title">🔋 포인트 충전 이력</h2>

    <div v-if="isLoading" class="loading">불러오는 중입니다...</div>

    <table v-else-if="rechargeHistory.length > 0" class="history-table">
      <thead>
        <tr>
          <th>충전일</th>
          <th>충전 금액</th>
          <th>잔액</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in rechargeHistory" :key="item.rechargeId || item.id">
          <td>{{ formatDate(item.rechargeTime || item.createdAt) }}</td>
          <td>{{ Number(item.amount || 0).toLocaleString() }} P</td>
          <td>{{ Number(item.pointBalance || 0).toLocaleString() }} P</td>
        </tr>
      </tbody>
    </table>

    <div v-else class="empty">
      <p>충전 이력이 없습니다.</p>
    </div>
  </div>
</template>

<style scoped>
.history-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
  background: #fafafa;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
.page-title {
  text-align: center;
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 24px;
  color: #222;
}
.loading {
  text-align: center;
  padding: 40px;
  color: #777;
}
.history-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}
th {
  background-color: var(--color-primary, #0078ff);
  color: #fff;
  padding: 12px;
  text-align: center;
  font-size: 0.95rem;
}
td {
  padding: 10px 12px;
  border-bottom: 1px solid #eee;
  font-size: 0.9rem;
  text-align: center;
}
tr:hover td {
  background: #f9f9f9;
}
.empty {
  text-align: center;
  color: #777;
  padding: 50px 0;
}
</style>
