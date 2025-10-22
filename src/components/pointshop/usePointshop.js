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
  const setLoading = (state) => { isLoading.value = state; };

  // 포인트 동기화
  const refreshUserPoint = async () => {
    try {
      const res = await PointRechargeService.getMyBalance();
      const balance =
        typeof res?.data === 'number'
          ? res.data
          : typeof res?.data?.data === 'number'
          ? res.data.data
          : typeof res?.data?.data?.point === 'number'
          ? res.data.data.point
          : res?.data?.point ?? 0;

      userPoints.value = Number(balance);
      auth.setPoint(Number(balance));
    } catch (err) {
      console.error('[usePointshop] 포인트 조회 실패:', err);
      userPoints.value = 0;
    }
  };

  // [GET] 내 포인트 조회
  const fetchUserPoints = async () => {
    setLoading(true);
    await refreshUserPoint();
    setLoading(false);
  };

  // [GET] 전체 포인트 아이템 목록 조회
  const fetchAllItems = async () => {
    setLoading(true);
    try {
      const list = await PointShopService.getAllItems();
      allItems.value = Array.isArray(list) && list.length
        ? list.map((item) => ({
            ...item,
            imageUrl: item.images?.length
              ? new URL(`@/assets/img/pointshop/${item.images[0].imageUrl}`, import.meta.url).href
              : item.pointItemImage
              ? new URL(`@/assets/img/pointshop/${item.pointItemImage}`, import.meta.url).href
              : new URL(`@/assets/img/pointshop/default.png`, import.meta.url).href,
          }))
        : getLocalDummyItems();
    } catch (e) {
      console.error('[usePointshop] 아이템 목록 조회 오류:', e);
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
      const data =
        Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];

      // ✅ 필드명 보정 및 정렬
      purchasedItems.value = data
        .map((p) => ({
          purchaseId: p.purchaseId ?? p.id ?? p.purchase_id ?? null,
          pointId: p.pointId ?? p.point_id ?? p.point?.pointId ?? null,
          pointItemName: p.pointItemName ?? p.point?.pointItemName ?? '상품명 없음',
          pointItemImage:
            p.pointItemImage ??
            p.point?.pointItemImage ??
            p.imageUrl ??
            p.images?.[0]?.imageUrl ??
            null,
          purchaseAt: p.purchaseAt ?? p.purchaseTime ?? p.createdAt ?? new Date().toISOString(),
          pointScore: p.pointScore ?? p.point?.pointScore ?? 0,
        }))
        .sort((a, b) => new Date(b.purchaseAt) - new Date(a.purchaseAt));
    } catch (err) {
      console.error('[usePointshop] 구매 내역 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  // [POST] 포인트 아이템 구매
  let isProcessing = false;
  const purchaseItem = async (item) => {
    if (isProcessing || !item?.pointId) return;
    isProcessing = true;
    try {
      const res = await PointPurchaseService.purchaseItem(item.pointId);
      if (!res?.success) throw new Error(res?.message || '구매 실패');

      if (res.data) {
        purchasedItems.value.unshift({
          ...res.data,
          purchaseAt: new Date().toISOString(),
        });
      }

      await refreshUserPoint();
      setTimeout(fetchPurchasedItems, 300);
      alert('구매가 완료되었습니다!');
    } catch (err) {
      console.error('[usePointshop] 구매 실패:', err);
      alert('구매 중 오류가 발생했습니다.');
    } finally {
      isProcessing = false;
    }
  };

  // [CHECK] 구매 여부 확인
  const isPurchased = (id) => purchasedItems.value.some((p) => p.pointId === id);

  // 로컬 더미 아이템
  const getLocalDummyItems = () => [
    { pointId: 2, pointItemName: '스타벅스 아메리카노', pointScore: 4700,
      imageUrl: new URL('../../assets/img/pointshop/item_01_starbucks_4700.png', import.meta.url).href },
    { pointId: 3, pointItemName: '신세계 상품권', pointScore: 5000,
      imageUrl: new URL('../../assets/img/pointshop/item_02_shinsegae_5000.png', import.meta.url).href },
    { pointId: 4, pointItemName: '맥도날드 빅맥 세트', pointScore: 7400,
      imageUrl: new URL('../../assets/img/pointshop/item_03_mcdonaldBickmac_7400.png', import.meta.url).href },
    { pointId: 5, pointItemName: '몬스터 울트라 캔', pointScore: 2300,
      imageUrl: new URL('../../assets/img/pointshop/item_04_monsterUltraCan_2300.png', import.meta.url).href },
    { pointId: 6, pointItemName: '맘스터치 싸이순살세트', pointScore: 9900,
      imageUrl: new URL('../../assets/img/pointshop/item_05_momstouchChicken_9900.png', import.meta.url).href },
    { pointId: 7, pointItemName: '다이소 상품권', pointScore: 5000,
      imageUrl: new URL('../../assets/img/pointshop/item_06_daiso_5000.png', import.meta.url).href },
    { pointId: 8, pointItemName: '파리바게뜨 에그샐러드', pointScore: 7100,
      imageUrl: new URL('../../assets/img/pointshop/item_07_parisChickenEggSalad_7100.png', import.meta.url).href },
    { pointId: 9, pointItemName: '배스킨라빈스 아이스크림', pointScore: 7300,
      imageUrl: new URL('../../assets/img/pointshop/item_08_baskinIcecream_7300.png', import.meta.url).href },
    { pointId: 10, pointItemName: '크리스피도넛 오리지널', pointScore: 6200,
      imageUrl: new URL('../../assets/img/pointshop/item_09_crispydonut_6200.png', import.meta.url).href },
    { pointId: 11, pointItemName: '샌드위치 세트', pointScore: 7500,
      imageUrl: new URL('../../assets/img/pointshop/item_10_sandwitch_7500.png', import.meta.url).href },
  ];

  // 초기 동기화
  const initialize = async () => {
    await Promise.allSettled([
      fetchUserPoints(),
      fetchAllItems(),
      fetchPurchasedItems(),
    ]);
  };

  // 구매 내역 초기화
  const initializePurchaseHistory = async () => {
    setLoading(true);
    try {
      await fetchUserPoints();
      await fetchPurchasedItems();
    } catch (err) {
      console.error('[usePointshop] 구매내역 초기화 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  // 구매내역 단일 호출
  const fetchUserPurchaseHistory = async () => {
    try {
      const res = await PointPurchaseService.getUserPurchaseHistory();
      if (res?.success && Array.isArray(res.data)) {
        purchasedItems.value = res.data;
      } else {
        console.warn('[usePointshop] 구매내역 응답이 비정상:', res);
      }
    } catch (err) {
      console.error('[usePointshop] 구매내역 불러오기 실패:', err);
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
    refreshUserPoint,
    fetchUserPurchaseHistory,
    initialize,
    initializePurchaseHistory,
  };
}
