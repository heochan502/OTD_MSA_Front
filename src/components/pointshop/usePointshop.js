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
    const res = await PointShopService.getAllItems();
    if (res?.status === 200) {
      allItems.value = res.data;
    } else {
      alert('아이템 목록을 불러오지 못했습니다.');
    }
  };

  // 사용자 포인트 조회
  const fetchUserPoints = async () => {
    const res = await PointUserService.getUserPoints();
    if (res?.status === 200) {
      userPoints.value = res.data.pointBalance;
    } else {
      alert('포인트 정보를 불러올 수 없습니다.');
    }
  };

  // 구매 내역 조회
  const fetchPurchasedItems = async () => {
    const res = await PointPurchaseService.getUserPurchaseHistory();
    if (res?.status === 200) {
      purchasedItemIds.value = res.data.map(p => p.itemId);
    } else {
      alert('구매 내역을 불러올 수 없습니다.');
    }
  };

  // 아이템 구매
  const purchaseItem = async (item) => {
    const ok = confirm(`${item.name} (${item.price}포인트)를 구매하시겠습니까?`);
    if (!ok) return;

    if (purchasedItemIds.value.includes(item.id)) {
      alert('이미 구매한 아이템입니다.');
      return;
    }

    const itemPrice = parseInt(item.price.toString().replace(/,/g, ''), 10);
    if (userPoints.value < itemPrice) {
      alert('포인트가 부족합니다.');
      const move = confirm('포인트 충전 페이지로 이동할까요?');
      if (move) router.push('/challenge');
      return;
    }

    const res = await PointPurchaseService.createPurchase(item.id);
    if (res?.status === 200) {
      purchasedItemIds.value.push(item.id);
      userPoints.value -= itemPrice;
      alert('구매가 완료되었습니다.');
    } else {
      alert('구매 중 오류가 발생했습니다.');
    }
  };

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