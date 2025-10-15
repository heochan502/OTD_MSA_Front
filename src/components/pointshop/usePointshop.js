import { ref } from 'vue';
import PointShopService from '@/services/pointshop/PointShopService';
import PointPurchaseService from '@/services/pointshop/PointPurchaseService';
import PointRechargeService from '@/services/pointshop/PointRechargeService';

export function usePointshop() {
  // 🔹 상태
  const userPoints = ref(0); // 사용자 포인트 잔액
  const allItems = ref([]); // 전체 포인트 아이템 목록
  const purchasedItems = ref([]); // 구매 내역
  const isLoading = ref(false); // 공통 로딩 상태
  const errorMessage = ref(''); // 에러 메시지 (문자열)

  // 내부 로딩 컨트롤
  const setLoading = (state) => {
    isLoading.value = state;
  };

  // [GET] 내 포인트 조회
  const fetchUserPoints = async () => {
    setLoading(true);
    try {
      const res = await PointRechargeService.getMyBalance();

      if (res?.success) {
        userPoints.value = res.data || 0;
      } else if (res?.status === 200 && typeof res.data === 'number') {
        userPoints.value = res.data;
      } else {
        console.warn('[usePointShop] 포인트 조회 실패:', res);
      }
    } catch (e) {
      console.error('[usePointShop] 포인트 조회 오류:', e);
      errorMessage.value = '포인트 정보를 불러오지 못했습니다.';
    } finally {
      setLoading(false);
    }
  };

  // [GET] 전체 아이템 목록 조회
  const fetchAllItems = async () => {
    setLoading(true);
    try {
      const res = await PointShopService.getAllItems();

      if (res?.success) {
        allItems.value = res.data || [];
      } else if (res?.status === 200 && Array.isArray(res.data)) {
        allItems.value = res.data;
      } else {
        console.warn('[usePointShop] 아이템 목록 조회 실패:', res);
        errorMessage.value = '아이템 목록을 불러올 수 없습니다.';
      }
    } catch (e) {
      console.error('[usePointShop] 아이템 목록 오류:', e);
      errorMessage.value = '서버 연결 오류가 발생했습니다.';
    } finally {
      setLoading(false);
    }
  };

  // [GET] 구매 내역 조회
  const fetchPurchasedItems = async () => {
    setLoading(true);
    try {
      const res = await PointPurchaseService.getUserPurchaseHistory();

      if (res?.success) {
        purchasedItems.value = res.data || [];
      } else if (res?.status === 200 && Array.isArray(res.data)) {
        purchasedItems.value = res.data;
      } else {
        console.warn('[usePointShop] 구매 내역 조회 실패:', res);
        purchasedItems.value = [];
      }
    } catch (e) {
      console.error('[usePointShop] 구매 내역 오류:', e);
      errorMessage.value = '구매 이력을 불러오지 못했습니다.';
      purchasedItems.value = [];
    } finally {
      setLoading(false);
    }
  };

  // [CHECK] 포인트 아이템 구매 여부 확인
  const isPurchased = (pointId) => {
    return purchasedItems.value.some((p) => p.pointId === pointId);
  };

  // [POST] 포인트 아이템 구매
  const purchaseItem = async (item) => {
    const pointId = item.pointId || item.id;
    const name = item.pointItemName || item.name;
    const price = item.pointScore || item.price;

    if (!pointId) {
      alert('유효하지 않은 아이템입니다.');
      console.warn('[usePointShop] 잘못된 아이템 데이터:', item);
      return;
    }

    const formattedPrice = Number(price || 0).toLocaleString();
    const confirmBuy = confirm(`${name} (${formattedPrice}P)를 구매하시겠습니까?`);
    if (!confirmBuy) return;

    setLoading(true);
    try {
      const res = await PointPurchaseService.purchaseItem(pointId);

      if (res?.success) {
        alert('구매 완료!');
        await Promise.all([fetchUserPoints(), fetchPurchasedItems()]);
      } else {
        console.warn('[usePointShop] 구매 실패 응답:', res);
        alert(res?.message || '구매 실패');
      }
    } catch (e) {
      console.error('[usePointShop] 구매 요청 실패:', e);
      alert('서버 오류로 구매를 진행할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  return {
    // 상태
    userPoints,
    allItems,
    purchasedItems,
    isLoading,
    errorMessage,

    // 메서드
    fetchUserPoints,
    fetchAllItems,
    fetchPurchasedItems,
    purchaseItem,
    isPurchased,
  };
}