<script setup>
import { ref } from 'vue';
import PointRechargeService from '@/services/pointshop/PointRechargeService';

const userId = ref('');
const amount = ref(0);
const isProcessing = ref(false);

const submitCharge = async () => {
  if (!userId.value || amount.value <= 0) {
    alert('회원 ID와 충전 금액을 입력하세요.');
    return;
  }

  isProcessing.value = true;
  try {
    const res = await PointRechargeService.chargePoints({
      userId: Number(userId.value),
      amount: Number(amount.value),
    });

    if (res.success) {
      alert(res.message || '포인트 충전 완료');
      userId.value = '';
      amount.value = 0;
    } else {
      alert(res.message || '충전 실패');
    }
  } catch (err) {
    console.error('[AdminPointChargeView] 충전 실패:', err);
    alert('서버 오류로 충전 실패');
  } finally {
    isProcessing.value = false;
  }
};
</script>

<template>
  <div class="admin-point-charge">
    <h2>포인트 충전 (관리자)</h2>

    <form @submit.prevent="submitCharge">
      <div class="form-row">
        <label>회원 ID</label>
        <input type="number" v-model="userId" placeholder="회원 ID 입력" />
      </div>

      <div class="form-row">
        <label>충전 금액 (P)</label>
        <input type="number" v-model="amount" placeholder="포인트 입력" />
      </div>

      <button type="submit" :disabled="isProcessing">
        {{ isProcessing ? '처리 중...' : '충전하기' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.admin-point-charge {
  max-width: 500px; margin: 60px auto; background: #fff;
  padding: 30px; border-radius: 12px; box-shadow: 0 3px 10px rgba(0,0,0,0.1);
}
h2 { text-align: center; margin-bottom: 24px; }
.form-row { margin-bottom: 16px; display: flex; flex-direction: column; }
label { margin-bottom: 4px; font-weight: bold; color: #333; }
input { padding: 8px 10px; border: 1px solid #ccc; border-radius: 6px; }
button {
  width: 100%; background-color: #1976d2; color: white;
  border: none; padding: 10px; border-radius: 8px; cursor: pointer;
}
button:hover:not(:disabled) { background-color: #125ea7; }
button:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
