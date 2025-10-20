<script setup>
import { ref, onMounted } from 'vue';
import PointPurchaseService from '@/services/pointshop/PointPurchaseService';

const purchaseHistory = ref([]);
const isLoading = ref(true);

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, '0')}. ${String(
    d.getDate()
  ).padStart(2, '0')}.`;
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
    <link
      href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap"
      rel="stylesheet"
    />
    <h2 class="title">구매 내역</h2>

    <div v-if="isLoading" class="loading">불러오는 중...</div>

    <table v-else>
      <thead>
        <tr>
          <th>아이템명</th>
          <th>사용 포인트</th>
          <th>구매일</th>
        </tr>
      </thead>
      <tbody v-if="purchaseHistory.length">
        <tr v-for="item in purchaseHistory" :key="item.purchaseId">
          <td class="item-name">{{ item.pointItemName }}</td>
          <td class="amount">-{{ item.pointScore.toLocaleString() }}P</td>
          <td class="date">{{ formatDate(item.purchaseAt) }}</td>
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

/* 테이블 기본 설정 */
table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 8px;
  overflow: hidden;
  table-layout: fixed;
}

th,
td {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
}

th {
  background: #f6f6f6;
  font-weight: 600;
  color: #333;
  text-align: center;
}

/* 열별 정렬 */
th:nth-child(1),
td.item-name {
  width: 45%;
  text-align: left;
}

th:nth-child(2),
td.amount {
  width: 25%;
  text-align: right;
}

th:nth-child(3),
td.date {
  width: 30%;
  text-align: right;
}

/* 포인트 정렬 보정 */
td.amount {
  color: #d32f2f;
  font-weight: 700;
  font-family: 'JetBrains Mono', 'Roboto Mono', 'Courier New', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 0.95rem;
  letter-spacing: 0;
  white-space: nowrap;
  display: table-cell;
  text-align: right;
  position: relative;
}

/* 정렬선 고정용 가상 가이드라인 */
td.amount::after {
  content: "";
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 0;
  border-right: 1px dotted #eee; /* (디버깅용 가이드선: 실제 배포 시 삭제 가능) */
}

/* 날짜 고정폭 정렬 */
td.date {
  color: #555;
  font-size: 0.9rem;
  font-family: 'JetBrains Mono', 'Roboto Mono', 'Courier New', monospace;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  text-align: right;
}

/* hover 효과 */
tbody tr:hover {
  background: #fafafa;
  transition: background 0.2s;
}

/* 상태 */
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