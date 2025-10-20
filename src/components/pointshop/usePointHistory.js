import { ref } from 'vue';
import PointPurchaseService from '@/services/pointshop/PointPurchaseService';

const purchaseHistory = ref([]);
const isLoading = ref(false);
const errorMessage = ref('');

export function usePointHistory() {
  // [GET] 구매 내역 불러오기
  const fetchPurchaseHistory = async () => {
    isLoading.value = true;
    try {
      const res = await PointPurchaseService.getUserPurchaseHistory();
      if (res?.success) {
        purchaseHistory.value = Array.isArray(res.data) ? res.data : [];
      } else {
        purchaseHistory.value = [];
        errorMessage.value = res?.message || '구매 이력 불러오기 실패';
      }
    } catch (err) {
      console.error('[usePointHistory] 구매 이력 요청 실패:', err);
      purchaseHistory.value = [];
      errorMessage.value = '서버 오류로 구매 내역을 불러올 수 없습니다.';
    } finally {
      isLoading.value = false;
    }
  };

  return {
    purchaseHistory,
    isLoading,
    errorMessage,
    fetchPurchaseHistory,
  };
}