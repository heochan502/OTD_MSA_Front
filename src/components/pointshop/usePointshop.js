import { ref } from 'vue';
import PointShopService from '@/services/pointshop/PointShopService';
import PointPurchaseService from '@/services/pointshop/PointPurchaseService';
import PointRechargeService from '@/services/pointshop/PointRechargeService';

export function usePointshop() {
  // 상태
  const userPoints = ref(0); // 사용자 포인트 잔액
  const allItems = ref([]); // 전체 포인트 아이템 목록
  const purchasedItems = ref([]); // 구매 내역
  const isLoading = ref(false); // 공통 로딩 상태
  const errorMessage = ref(''); // 에러 메시지

  // 내부 로딩 컨트롤
  const setLoading = (state) => {
    isLoading.value = state;
  };

  // [GET] 내 포인트 조회
  const fetchUserPoints = async () => {
    setLoading(true);
    try {
      const res = await PointRechargeService.getMyBalance();
      if (res?.success && typeof res.data === 'number') {
        userPoints.value = res.data;
      } else if (typeof res === 'number') {
        userPoints.value = res;
      } else {
        userPoints.value = Number(res?.data ?? 0);
      }
    } catch (e) {
      console.error('[usePointshop] 포인트 조회 오류:', e);
      userPoints.value = 0;
      errorMessage.value = '포인트 정보를 불러오지 못했습니다.';
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

      // 이미지 URL 처리 (백엔드 경로: /pointshop/**)
      allItems.value = Array.isArray(list)
        ? list.map((item) => ({
            ...item,
            imageUrl: item.pointItemImage?.[0]
              ? `/pointshop/${item.pointItemImage[0]}`
              : null,
          }))
        : getLocalDummyItems();
    } catch (e) {
      console.error('[usePointshop] 아이템 목록 오류:', e);
      errorMessage.value = '아이템 목록을 불러오지 못했습니다.';
      allItems.value = getLocalDummyItems();
    } finally {
      setLoading(false);
    }
  };

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

  // [GET] 구매 내역 조회
  const fetchPurchasedItems = async () => {
    setLoading(true);
    try {
      const res = await PointPurchaseService.getUserPurchaseHistory();
      const list = res?.data ?? [];
      purchasedItems.value = Array.isArray(list) ? list : [];
    } catch (e) {
      console.error('[usePointshop] 구매 내역 오류:', e);
      purchasedItems.value = [];
      errorMessage.value = '구매 내역을 불러오지 못했습니다.';
    } finally {
      setLoading(false);
    }
  };

  // [CHECK] 포인트 아이템 구매 여부 확인
  const isPurchased = (pointId) =>
    purchasedItems.value.some((p) => p.pointId === pointId);

  // [POST] 포인트 아이템 구매
  const purchaseItem = async (item) => {
    if (!item?.pointId) {
      alert('유효하지 않은 아이템입니다.');
      return;
    }

    const ok = confirm(`${item.pointItemName} (${item.pointScore.toLocaleString()}P)를 구매하시겠습니까?`);
    if (!ok) return;

    setLoading(true);
    try {
      const res = await PointPurchaseService.purchaseItem(item.pointId);
      if (res?.success) {
        alert('구매 완료!');
        await fetchUserPoints();
        await fetchPurchasedItems();
      } else {
        alert(res?.message || '구매에 실패했습니다.');
      }
    } catch (e) {
      console.error('[usePointshop] 구매 요청 실패:', e);
      if (e?.response?.data?.message?.includes('포인트 아이템을 찾을 수 없습니다')) {
        alert('서버에 해당 아이템이 존재하지 않습니다. (테스트용 아이템 등록 필요)');
      } else {
        alert('서버 오류로 구매를 진행할 수 없습니다.');
      }
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
