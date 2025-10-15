<script setup>
import { computed } from 'vue';

const props = defineProps({
  userPoints: { type: Number, default: 0 },
  purchasedItemIds: { type: Array, default: () => [] },
});

// 구매한 아이템 수 계산
const purchasedItemCount = computed(() => props.purchasedItemIds.length);

// 포인트 단위 변환
const formattedPoints = computed(() =>
  props.userPoints?.toLocaleString?.() || '0'
);
</script>

<template>
  <div class="point-user-status">
    <div class="status-item">
      <span class="label">보유 포인트</span>
      <strong class="value primary">{{ formattedPoints }}</strong>
      <span class="unit">P</span>
    </div>

    <div class="status-divider"></div>

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
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
  padding: 14px 22px;
  border-radius: 12px;
  margin: 16px auto;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  max-width: 420px;
  gap: 24px;
  flex-wrap: wrap;
}

.status-item {
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-size: 15px;
  color: #333;
}

.label {
  font-weight: 500;
  color: #555;
}

.value {
  font-weight: 700;
  font-size: 1.1rem;
  color: #000;
}

.value.primary {
  color: var(--color-primary, #0078ff);
}

.unit {
  font-size: 0.9rem;
  color: #777;
}

.status-divider {
  width: 1px;
  height: 22px;
  background-color: #ddd;
}
</style>