<script setup>
import { onMounted } from 'vue';
import { usePointshop } from '@/components/pointshop/usePointshop.js';

const {
  userPoints,
  allItems,
  pointHistory,
  purchasedItemIds,
  fetchUserPoints,
  fetchAllItems,
  fetchPurchasedItems,
  purchaseItem,
  isPurchased,
} = usePointshop();

// 🔹 초기 데이터 불러오기
onMounted(async () => {
  await Promise.all([
    fetchUserPoints(),
    fetchAllItems(),
    fetchPurchasedItems(),
  ]);
});
</script>

<template>
  <div class="point-dashboard">
    <!-- 포인트 상태 -->
    <section class="point-status">
      <h2>내 포인트</h2>
      <p class="balance">
        {{ (userPoints || 0).toLocaleString() }}
        <span class="unit">P</span>
      </p>
      <p class="notice">포인트를 충전할 권한이 없습니다.</p>
    </section>

    <!-- 아이템 목록 -->
    <section class="item-list">
      <h2>포인트 아이템 목록</h2>

      <div v-if="!allItems?.length" class="empty">등록된 아이템이 없습니다.</div>

      <ul v-else class="items">
        <li v-for="item in allItems" :key="item.pointId" class="item">
          <img
            v-if="item.imageUrl"
            :src="item.imageUrl"
            alt="item"
            class="item-image"
          />
          <div class="info">
            <h3>{{ item.pointItemName }}</h3>
            <p class="price">
              {{ Number(item.pointScore || 0).toLocaleString() }}P
            </p>
            <button
              :disabled="isPurchased(item.pointId)"
              @click="purchaseItem({ id: item.pointId, name: item.pointItemName, price: item.pointScore })"
            >
              {{ isPurchased(item.pointId) ? '구매 완료' : '구매하기' }}
            </button>
          </div>
        </li>
      </ul>
    </section>

    <!-- 구매 내역 -->
    <section class="history">
      <h2>구매 내역</h2>
      <div v-if="!pointHistory?.length" class="empty">내역이 없습니다.</div>
      <ul v-else>
        <li v-for="(h, idx) in pointHistory" :key="idx" class="history-item">
          <span class="type">{{ h.type || '거래' }}</span>
          <span class="amount">{{ Number(h.amount||0).toLocaleString() }} P</span>
          <span class="date">
            {{ new Date(h.createdAt).toLocaleDateString('ko-KR') }}
          </span>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.point-dashboard { max-width: 900px; margin: 40px auto; padding: 24px; border-radius: 12px; background: #fafafa; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); }
.point-status { text-align: center; margin-bottom: 32px; }
.balance { font-size: 2rem; font-weight: bold; color: #2c3e50; }
.unit { font-size: 1.2rem; color: #777; }
.notice { color: #888; margin-top: 8px; font-size: 0.9rem; }
.items { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
.item { background: #fff; border-radius: 10px; padding: 16px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08); text-align: center; }
.item-image { width: 120px; height: 120px; object-fit: cover; margin-bottom: 12px; border-radius: 8px; }
.history { margin-top: 40px; }
.history-item { display: flex; justify-content: space-between; background: #fff; padding: 10px 16px; border-radius: 8px; margin-bottom: 8px; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06); }
.empty { text-align: center; padding: 16px; color: #777; }
</style>