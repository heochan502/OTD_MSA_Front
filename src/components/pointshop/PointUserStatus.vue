<script setup>
import { computed } from 'vue';

const props = defineProps({
  userPoints: { type: Number, default: 0 },
  purchasedItemIds: { type: Array, default: () => [] },
});

const purchasedItemCount = computed(() => props.purchasedItemIds.length);
const formattedPoints = computed(() => props.userPoints.toLocaleString() || '0');
</script>

<template>
  <div class="point-user-status">
    <div class="status-item">
      <span class="label">보유 포인트</span>
      <strong class="value primary">{{ formattedPoints }}</strong>
      <span class="unit">P</span>
    </div>

    <div class="divider"></div>

    <div class="status-item">
      <span class="label">구매한 아이템</span>
      <strong class="value">{{ purchasedItemCount }}</strong>
      <span class="unit">개</span>
    </div>
  </div>
</template>

<style scoped>
.point-user-status {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  padding: 14px 20px;
  max-width: 420px;
  margin: 0 auto 20px;
  gap: 24px;
}
.status-item {
  display: flex;
  align-items: baseline;
  gap: 5px;
}
.label {
  color: #555;
  font-size: 14px;
}
.value {
  font-weight: 700;
  font-size: 1.1rem;
}
.value.primary {
  color: var(--color-primary, #0078ff);
}
.unit {
  font-size: 0.9rem;
  color: #777;
}
.divider {
  width: 1px;
  height: 22px;
  background: #ddd;
}
</style>
