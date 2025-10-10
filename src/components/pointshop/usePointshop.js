// src/composables/usePointShop.js
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import PointUserService from '@/services/pointshop/PointUserService';
import PointPurchaseService from '@/services/pointshop/PointPurchaseService';
import PointShopService from '@/services/pointshop/PointShopService';

const userPoints = ref(0);
const purchasedItemIds = ref([]);
const allItems = ref([]);

export function usePointShop() {
  const router = useRouter();

  // 전체 아이템 불러오기
  const fetchAllItems = async () => {
    try {
      const res = await PointShopService.getAllItems();
      if (res?.status === 200 && res.data?.success) {
      allItems.value = Array.isArray(res.data.data) ? res.data.data : [];
      } else {
        console.warn('[usePointShop] 아이템 목록 응답 오류:', res);
        allItems.value = [];
        alert('아이템 목록을 불러올 수 없습니다.');
      }
    } catch (err) {
      console.error('[usePointShop] 아이템 목록 요청 실패:', err);
      allItems.value = [];
      alert('서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  // 사용자 포인트 조회
  const fetchUserPoints = async () => {
    try {
      const res = await PointUserService.getUserPoints();
      if (res?.status === 200 && res.data?.success) {
        userPoints.value = res.data.data;
      } else {
        console.warn('[usePointShop] 포인트 정보 응답 오류:', res);
        alert('포인트 정보를 불러올 수 없습니다.');
      }
    } catch (err) {
      console.error('[usePointShop] 포인트 조회 실패:', err);
      alert('서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  // 구매 내역 조회
  const fetchPurchasedItems = async () => {
    try {
      const res = await PointPurchaseService.getUserPurchaseHistory();
      if (res?.status === 200 && res.data?.success) {
        purchasedItemIds.value = res.data.data.map(item => item.pointId);
      } else {
        console.warn('[usePointShop] 구매 내역 응답 오류:', res);
        alert('구매 내역을 불러올 수 없습니다.');
      }
    } catch (err) {
      console.error('[usePointShop] 구매 내역 요청 실패:', err);
      alert('서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  // 아이템 구매
  const purchaseItem = async (item) => {
    try {
      const ok = confirm(`${item.name} (${item.price}포인트)를 구매하시겠습니까?`);
      if (!ok) return;

      // 중복 구매 방지
      if (purchasedItemIds.value.includes(item.id)) {
        alert('이미 구매한 아이템입니다.');
        return;
      }

      // 포인트 부족 확인
    const itemPrice = parseInt(item.price.toString().replace(/,/g, ''), 10);
    if (userPoints.value < itemPrice) {
      alert('포인트가 부족합니다.');
      const move = confirm('포인트 충전 페이지로 이동할까요?');
      if (move) router.push('/challenge');
      return;
    }

    // 구매 요청
    const res = await PointPurchaseService.createPurchase(item.id);
      if (res?.status === 200) {
        purchasedItemIds.value.push(item.id);
        userPoints.value -= itemPrice;
        alert('구매가 완료되었습니다.');
      } else {
        console.warn('[usePointShop] 구매 응답 오류:', res);
        alert('구매 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('[usePointShop] 구매 요청 실패:', err);
      alert('서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  // 아이템 구매 여부 확인
  const isPurchased = (itemId) => {
    return purchasedItemIds.value.includes(itemId);
  };

  return {
    userPoints,
    purchasedItemIds,
    allItems,
    fetchAllItems,
    fetchUserPoints,
    fetchPurchasedItems,
    purchaseItem,
    isPurchased,
  };
}