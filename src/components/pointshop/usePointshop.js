import { ref } from 'vue';
import PointShopService from '@/services/pointshop/PointShopService';
import PointPurchaseService from '@/services/pointshop/PointPurchaseService';
import PointRechargeService from '@/services/pointshop/PointRechargeService';
import { useAuthenticationStore } from '@/stores/user/authentication';

export function usePointshop() {
  // 상태
  const userPoints = ref(0); // 사용자 포인트 잔액
  const allItems = ref([]); // 전체 포인트 아이템 목록
  const purchasedItems = ref([]); // 구매 내역
  const isLoading = ref(false); // 공통 로딩 상태
  const errorMessage = ref(''); // 에러 메시지
  const auth = useAuthenticationStore();

  // 내부 로딩 컨트롤
  const setLoading = (state) => { isLoading.value = state };

  // 포인트 동기화
  const refreshUserPoint = async () => {
    try {
      const res = await PointRechargeService.getMyBalance();
      if (res?.success && res?.data != null) {
        const balance = typeof res.data === 'number' ? res.data : res.data.point;
        userPoints.value = Number(balance);
        auth.setPoint(Number(balance));
      } else {
        userPoints.value = 0;
      }
    } catch (e) {
      console.error('[usePointshop] 포인트 갱신 실패', e);
      userPoints.value = 0;
    }
  };

  // [GET] 내 포인트 조회
  const fetchUserPoints = async () => {
    setLoading(true);
    try {
      await refreshUserPoint();
    } catch (e) {
      console.error('[usePointshop] 포인트 조회 실패', e);
    } finally {
      setLoading(false);
    }
  };

  // [GET] 전체 포인트 아이템 목록 조회
  const fetchAllItems = async () => {
    setLoading(true);
    try {
      const res = await PointShopService.getAllItems();
      const list = res?.data ?? [];
      allItems.value = Array.isArray(list)
        ? list.map((item) => ({
            ...item,
            imageUrl: item.pointItemImage
              ? `/pointshop/image/${item.pointItemImage}`
              : null,
          }))
        : getLocalDummyItems();
    } catch (e) {
      console.error('[usePointshop] 아이템 목록 오류:', e);
      allItems.value = getLocalDummyItems();
    } finally {
      setLoading(false);
    }
  };

  // [GET] 구매 내역 조회
  const fetchPurchasedItems = async () => {
    setLoading(true);
    try {
      const res = await PointPurchaseService.getUserPurchaseHistory();

      if (res.success && Array.isArray(res.data)) {
        purchasedItems.value = res.data.sort(
          (a, b) => new Date(b.purchaseAt) - new Date(a.purchaseAt)
        );
      } else {
        console.warn('[usePointshop] 구매 내역 서버 응답 실패 — 기존 목록 유지');
      }
    } catch (e) {
      console.error('[usePointshop] 구매 내역 오류:', e);
      // 절대 초기화하지 않음
    } finally {
      setLoading(false);
    }
  };

  // [POST] 포인트 아이템 구매
let isProcessing = false;

const purchaseItem = async (item) => {
  if (isProcessing) return;
  isProcessing = true;

  try {
    if (!item?.pointId) {
      alert('유효하지 않은 아이템입니다.');
      return;
    }

    // 서버 요청
    const res = await PointPurchaseService.purchaseItem(item.pointId);
    if (!res?.success) throw new Error(res?.message || '구매 실패');

    // 서버 응답에 구매 정보가 있다면 즉시 반영
    if (res.data) {
      purchasedItems.value.unshift({
        ...res.data,
        purchaseAt: new Date().toISOString(),
      });
    }

    // 포인트 즉시 반영
    await refreshUserPoint();

    // 0.3초 후 서버 기준으로 전체 재조회 (안정화)
    setTimeout(fetchPurchasedItems, 300);

    alert('구매가 완료되었습니다!');
  } catch (e) {
    console.error('[usePointshop] 구매 요청 실패:', e);
    alert('구매 중 오류가 발생했습니다.');
  } finally {
    isProcessing = false;
  }
};

    // [CHECK] 구매 여부 확인
  const isPurchased = (pointId) =>
    purchasedItems.value.some((p) => p.pointId === pointId);

  // 로컬 더미 아이템
  const getLocalDummyItems = () => [
    { pointId: 1, pointItemName: '스타벅스 아메리카노', pointScore: 4700, imageUrl: new URL('@/assets/img/pointshop/item_01_starbucks_4700.png', import.meta.url).href },
    { pointId: 2, pointItemName: '신세계 상품권', pointScore: 5000, imageUrl: new URL('@/assets/img/pointshop/item_02_shinsaegae_5000.png', import.meta.url).href },
    { pointId: 3, pointItemName: '맥도날드 빅맥 세트', pointScore: 7400, imageUrl: new URL('@/assets/img/pointshop/item_03_mcdonaldBickmac_7400.png', import.meta.url).href },
    { pointId: 4, pointItemName: '몬스터 울트라 캔', pointScore: 2300, imageUrl: new URL('@/assets/img/pointshop/item_04_monsterUltraCan_2300.png', import.meta.url).href },
    { pointId: 5, pointItemName: '맘스터치 싸이순살세트', pointScore: 9900, imageUrl: new URL('@/assets/img/pointshop/item_05_momstouchChicken_9900.png', import.meta.url).href },
    { pointId: 6, pointItemName: '다이소 상품권', pointScore: 5000, imageUrl: new URL('@/assets/img/pointshop/item_06_daiso_5000.png', import.meta.url).href },
    { pointId: 7, pointItemName: '파리바게뜨 에그샐러드', pointScore: 7100, imageUrl: new URL('@/assets/img/pointshop/item_07_paris_chickenEggSalad_7100.png', import.meta.url).href },
    { pointId: 8, pointItemName: '배스킨라빈스 아이스크림', pointScore: 7300, imageUrl: new URL('@/assets/img/pointshop/item_08_baskin_icecream_7300.png', import.meta.url).href },
    { pointId: 9, pointItemName: '크리스피도넛 오리지널', pointScore: 6200, imageUrl: new URL('@/assets/img/pointshop/item_09_crispydonut_6200.png', import.meta.url).href },
    { pointId: 10, pointItemName: '샌드위치 세트', pointScore: 7500, imageUrl: new URL('@/assets/img/pointshop/item_10_sandwitch_7500.png', import.meta.url).href },
  ];

  fetchUserPoints();
  fetchAllItems();
  fetchPurchasedItems();

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
    refreshUserPoint,
  };
}