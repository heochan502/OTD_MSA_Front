<script setup>
import { computed } from 'vue';

const props = defineProps({
  userPoints: { type: Number, default: 0 },
  purchasedItemIds: { type: Array, default: () => [] }
});

const purchasedCount = computed(() => props.purchasedItemIds.length);
</script>

<template>
  <div class="point-user-status">
    <p>
  현재 포인트:
  <strong>{{ userPoints ? userPoints.toLocaleString() : '0' }}</strong> P
</p>
    <p>구매한 아이템: <strong>{{ purchasedCount }}</strong>개</p>
    <!-- <button @click="$router.push('/challenge')">포인트 충전</button> -->
  </div>
</template>

<style scoped>
.point-user-status {
  background-color: #f6f6f6;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  margin: 10px 20px;
  color: #333;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}
.point-user-status strong {
  color: #222;
}
</style>
