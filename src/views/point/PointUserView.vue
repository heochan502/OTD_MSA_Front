<script setup>
import PointUserStatus from '@/components/pointshop/PointUserStatus.vue';
import PointUserPurchaseHistoryView from '@/components/pointshop/PointPurchaseHistoryTable.vue';
import { onMounted } from 'vue';
import { usePointShop } from '@/components/pointshop/usePointshop';

const {
  userPoints,
  purchasedItemIds,
  fetchUserPoints,
  fetchPurchasedItems
} = usePointShop();

onMounted(async () => {
  await Promise.all([
    fetchUserPoints(),
    fetchPurchasedItems()
  ]);
});
</script>

<template>
  <div class="user-view-wrapper">
    <PointUserStatus
      :userPoints="userPoints.value"
      :purchasedItemIds="purchasedItemIds"
    />
  </div>
</template>

<style scoped>
.user-view-wrapper {
  margin-top: 20px;
  padding: 0 16px;
}
</style>