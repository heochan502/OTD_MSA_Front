<script setup>
import { ref, onMounted } from 'vue';
import PointPurchaseService from '@/services/pointshop/PointPurchaseService';

// 구매 이력 목록
const purchaseHistory = ref([]);

// 데이터 로딩 상태
const isLoading = ref(true);

// 날짜 포맷 함수 (YYYY-MM-DD HH:mm)
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes()
  ).padStart(2, '0')}`;
};

// 구매 이력 불러오기
const fetchPurchaseHistory = async () => {
  try {
    isLoading.value = true;
    const res = await PointPurchaseService.getUserPurchaseHistory();

    // [1] 응답 검증
    if (res?.success && Array.isArray(res.data)) {
      // 최신순 정렬
      purchaseHistory.value = [...res.data].sort(
        (a, b) => new Date(b.purchaseTime) - new Date(a.purchaseTime)
      );
    } else if (res?.status === 200 && Array.isArray(res.data)) {
      // fallback: success 필드 없는 일반 응답
      purchaseHistory.value = [...res.data].sort(
        (a, b) => new Date(b.purchaseTime) - new Date(a.purchaseTime)
      );
    } else {
      console.warn('[PointPurchaseHistoryTable] 응답 오류:', res);
      alert('구매 이력을 불러올 수 없습니다.');
      purchaseHistory.value = [];
    }
  } catch (err) {
    console.error('[PointPurchaseHistoryTable] 서버 통신 실패:', err);
    alert('서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
    purchaseHistory.value = [];
  } finally {
    isLoading.value = false;
  }
};

// 최초 로딩
onMounted(fetchPurchaseHistory);
</script>

<template>
  <div class="purchase-history">
    <h2 class="title">구매 이력</h2>

    <div v-if="isLoading" class="loading-message">
      불러오는 중입니다...
    </div>

    <table v-else>
      <thead>
        <tr>
          <th>구매일</th>
          <th>아이템명</th>
          <th>포인트</th>
        </tr>
      </thead>

      <tbody v-if="purchaseHistory.length > 0">
        <tr v-for="item in purchaseHistory" :key="item.purchaseId">
          <td>{{ formatDate(item.purchaseTime) }}</td>
          <td>{{ item.pointItemName }}</td>
          <td>{{ item.pointScore?.toLocaleString() }} P</td>
        </tr>
      </tbody>

      <tbody v-else>
        <tr>
          <td colspan="3" class="no-data">구매 이력이 없습니다.</td>
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
  background-color: #fafafa;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

/* 제목 */
.title {
  font-size: 1.4rem;
  font-weight: bold;
  color: #222;
  text-align: center;
  margin-bottom: 20px;
}

/* 테이블 */
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

/* 로딩 / 공백 메시지 */
.loading-message,
.no-data {
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 0.95rem;
}
</style>