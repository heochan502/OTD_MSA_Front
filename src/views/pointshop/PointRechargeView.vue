<script setup>
import { ref } from 'vue';
import { usePointRecharge } from '@/components/pointshop/usePointRecharge.js';

const { userPoints, chargeAmount, isCharging, fetchUserPoints, chargePoints } = usePointRecharge();

fetchUserPoints();

const onSubmit = async () => {
  await chargePoints();
};
</script>

<template>
  <div class="recharge-container">
    <h2 class="recharge-title">💰 포인트 충전</h2>

    <div class="current-point">
      현재 포인트:
      <strong>{{ userPoints.value?.toLocaleString() || '0' }}</strong> P
    </div>

    <div class="form-group">
      <label for="amount">충전 금액</label>
      <input
        id="amount"
        type="number"
        min="100"
        step="100"
        v-model.number="chargeAmount.value"
        placeholder="예: 1000"
      />
    </div>

    <button class="charge-button" :disabled="isCharging.value" @click="onSubmit">
      {{ isCharging.value ? '충전 중...' : '충전하기' }}
    </button>
  </div>
</template>

<style scoped>
.recharge-container {
  max-width: 400px;
  margin: 60px auto;
  padding: 24px;
  border-radius: 12px;
  background: #f8f8f8;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.recharge-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
}

.current-point {
  margin-bottom: 24px;
  font-size: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

input[type='number'] {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  text-align: right;
}

.charge-button {
  width: 100%;
  background-color: #1e88e5;
  color: #fff;
  padding: 12px;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.charge-button:hover {
  background-color: #1565c0;
}
</style>