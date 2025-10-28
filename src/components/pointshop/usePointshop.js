import { ref, nextTick } from 'vue';
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

    // 이미지 사전 로드 (Vite 정적 import로 안정화)
  const imageModules = import.meta.glob('@/assets/img/pointshop/*', {
    eager: true,
    import: 'default',
  });

  const resolveImage = (fileName) => {
    if (!fileName) return imageModules['/src/assets/img/pointshop/default.png'];

    const exact = `/src/assets/img/pointshop/${fileName}`;
    if (imageModules[exact]) return imageModules[exact];

    const found = Object.entries(imageModules).find(([path]) =>
      path.includes(fileName.replace(/\.[^/.]+$/, ''))
    );
    return found ? found[1] : imageModules['/src/assets/img/pointshop/default.png'];
  };

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

  // [GET] 전체 포인트 아이템 목록 조회
  const fetchAllItems = async () => {
  setLoading(true);
  try {
    const list = await PointShopService.getAllItems();

    allItems.value = Array.isArray(list) && list.length
      ? list.map((item) => {
          let category = item.category || '기타';
          const name = item.pointItemName?.toLowerCase() || '';

          // 이름 기반 카테고리 자동 분류
          if (name.match(/커피|음료|아메리카노|스타벅스|몬스터/)) {
            category = '커피/음료';
          } else if (name.match(/맥도날드|맘스터치|버거/)) {
            category = '패스트푸드';
          } else if (name.match(/상품권|기프트|이마트|다이소/)) {
            category = '상품권';
          } else if (name.match(/파리바게뜨|베이커리|크리스피|도넛|배스킨/)) {
            category = '디저트';
          }

          return {
            ...item,
            category,
            imageUrl: resolveImage(
              item.images?.[0]?.imageUrl ||
              item.pointItemImage ||
              'default.png'
            ),
          };
        })
      : getLocalDummyItems();
  } catch (e) {
    console.error('[usePointshop] 아이템 목록 조회 오류:', e);
    allItems.value = getLocalDummyItems();
  } finally {
    setLoading(false);
  }
};

  // [GET] 내 포인트 조회
  const fetchUserPoints = async () => {
    setLoading(true);
    await refreshUserPoint();
    setLoading(false);
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

      purchasedItems.value = data
        .map((p) => ({
          purchaseId: p.purchaseId ?? p.id ?? p.purchase_id ?? null,
          pointId: p.pointId ?? p.point_id ?? p.point?.pointId ?? null,
          pointItemName: p.pointItemName ?? p.point?.pointItemName ?? '상품명 없음',
          pointItemImage: p.pointItemImage ?? p.point?.pointItemImage ?? p.imageUrl ?? p.images?.[0]?.imageUrl ?? null,
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

  // [CHECK] 구매 여부 확인 — 항상 false (중복 구매 허용)
  const isPurchased = () => false;

  // 로컬 더미 아이템
  const getLocalDummyItems = () => [
    { pointId: 2, pointItemName: '스타벅스 아메리카노', pointScore: 4700, imageUrl: resolveImage('item_01_starbucks_4700.png') },
    { pointId: 3, pointItemName: '신세계 상품권', pointScore: 5000, imageUrl: resolveImage('item_02_shinsegae_5000.png') },
    { pointId: 4, pointItemName: '맥도날드 빅맥 세트', pointScore: 7400, imageUrl: resolveImage('item_03_mcdonaldBickmac_7400.png') },
    { pointId: 5, pointItemName: '몬스터 울트라 캔', pointScore: 2300, imageUrl: resolveImage('item_04_monsterUltraCan_2300.png') },
    { pointId: 6, pointItemName: '맘스터치 싸이순살세트', pointScore: 9900, imageUrl: resolveImage('item_05_momstouchChicken_9900.png') },
    { pointId: 7, pointItemName: '다이소 상품권', pointScore: 5000, imageUrl: resolveImage('item_06_daiso_5000.png') },
    { pointId: 8, pointItemName: '파리바게뜨 에그샐러드', pointScore: 7100, imageUrl: resolveImage('item_07_parisChickenEggSalad_7100.png') },
    { pointId: 9, pointItemName: '배스킨라빈스 아이스크림', pointScore: 7300, imageUrl: resolveImage('item_08_baskinIcecream_7300.png') },
    { pointId: 10, pointItemName: '크리스피도넛 오리지널', pointScore: 6200, imageUrl: resolveImage('item_09_crispydonut_6200.png') },
    { pointId: 11, pointItemName: '샌드위치 세트', pointScore: 7500, imageUrl: resolveImage('item_10_sandwitch_7500.png') },
  ];

  // 초기 동기화
  const initialize = async () => {
    await nextTick();
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
    userPoints,
    allItems,
    purchasedItems,
    isLoading,
    errorMessage,
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