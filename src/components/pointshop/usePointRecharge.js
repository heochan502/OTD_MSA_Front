import { ref } from 'vue';
import PointUserService from '@/services/pointshop/PointUserService';

export function usePointRecharge() {
  const userPoints = ref(0);
  const chargeAmount = ref(0);
  const isCharging = ref(false);

  // 현재 포인트 조회
  const fetchUserPoints = async () => {
    try {
      const res = await PointUserService.getUserPoints();
      if (res?.status === 200 && res.data?.pointBalance != null) {
        userPoints.value = res.data.pointBalance;
      } else {
        alert('포인트 정보를 불러올 수 없습니다.');
      }
    } catch (err) {
      console.error('[usePointRecharge] 포인트 조회 실패:', err);
      alert('서버 연결에 문제가 있습니다.');
    }
  };

  // 포인트 충전
  const chargePoints = async () => {
    if (!chargeAmount.value || chargeAmount.value < 100) {
      alert('100포인트 이상 입력해주세요.');
      return;
    }

    const confirmCharge = confirm(`${chargeAmount.value.toLocaleString()}P를 충전하시겠습니까?`);
    if (!confirmCharge) return;

    isCharging.value = true;
    try {
      const res = await PointUserService.chargePoints(chargeAmount.value);
      if (res?.status === 200) {
        alert('충전이 완료되었습니다!');
        chargeAmount.value = 0;
        await fetchUserPoints();
        router.push('/pointshop');
      } else {
        alert('충전 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('[usePointRecharge] 포인트 충전 실패:', err);
      alert('서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      isCharging.value = false;
    }
  };

  return {
    userPoints,
    chargeAmount,
    isCharging,
    fetchUserPoints,
    chargePoints,
  };
}
