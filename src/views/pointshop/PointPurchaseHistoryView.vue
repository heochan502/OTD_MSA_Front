<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePointShop } from '@/components/pointshop/usePointShop';

const router = useRouter();

const {
  userPoints,
  purchasedItems,
  isLoading,
  fetchUserPoints,
  fetchPurchasedItems,
} = usePointShop();

// 날짜 포맷 변환
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(async () => {
  await Promise.all([fetchUserPoints(), fetchPurchasedItems()]);
});
</script>

<template>
  <div class="purchase-history-container">
    <h2 class="page-title">구매 내역</h2>

    <!-- 현재 포인트 표시 -->
    <div class="user-balance">
      내 보유 포인트:
      <strong>{{ userPoints.toLocaleString() }} P</strong>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="loading">로딩 중...</div>

    <!-- 구매 내역 리스트 -->
    <div v-else>
      <table v-if="purchasedItems.length > 0" class="history-table">
        <thead>
          <tr>
            <th>상품명</th>
            <th>가격</th>
            <th>구매일시</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in purchasedItems" :key="i">
            <td class="item-name">
            <img v-if="item.imageUrl" :src="item.imageUrl" alt="상품 이미지" class="item-image" />
            {{ item.name || item.pointItemName }}
          </td>
          <td>{{ (item.price || item.pointPrice || 0).toLocaleString() }} P</td>
          <td>{{ formatDate(item.purchaseAt || item.createdAt) }}</td>
          </tr>
        </tbody>
      </table>

      <div v-else class="empty">
        <p>아직 구매한 상품이 없습니다.</p>
        <button class="go-shop-btn" @click="router.push('/pointshop')">
          포인트샵으로 이동 →
        </button>
      </div>
    </div>
  </div>
</template>

<script>
function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}
</script>

<style scoped>
.purchase-history-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}
.page-title {
  text-align: center;
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 24px;
}
.user-balance {
  text-align: right;
  margin-bottom: 16px;
  font-size: 1.1rem;
}
.loading {
  text-align: center;
  padding: 40px;
  color: #555;
}
.history-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
}
.history-table th {
  background-color: var(--color-primary, #0078ff);
  color: #fff;
  padding: 12px;
  text-align: left;
  font-size: 0.95rem;
}
.history-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #eee;
  font-size: 0.9rem;
}
.history-table tr:hover td {
  background: #f9f9f9;
}
.item-name {
  display: flex;
  align-items: center;
  gap: 8px;
}
.item-image {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 6px;
}
.empty {
  text-align: center;
  color: #777;
  padding: 50px 0;
}
.go-shop-btn {
  background-color: var(--color-primary, #0078ff);
  color: #fff;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  margin-top: 12px;
  transition: background 0.2s;
}
.go-shop-btn:hover {
  background-color: var(--color-skyblue, #4aa8ff);
}
</style>