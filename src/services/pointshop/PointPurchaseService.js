import axios from '@/services/httpRequester';

const PointPurchaseService = {
  // [GET] 사용자 구매 내역 조회
  async getUserPurchaseHistory() {
    try {
      const res = await axios.get('/pointshop/purchase/history');
      return res;
    } catch (e) {
      console.error('[PointPurchaseService] 구매 이력 조회 실패:', e);
      return e?.response || null;
    }
  },

  // [POST] 아이템 구매 요청
  async createPurchase(pointId) {
    try {
      const res = await axios.post(`/pointshop/purchase/${pointId}`);
      return res;
    } catch (e) {
      console.error('[PointPurchaseService] 구매 요청 실패:', e);
      return e?.response || null;
    }
  },

  // [DELETE] 구매 취소
  async deletePurchase(purchaseId) {
    try {
      const res = await axios.delete(`/pointshop/purchase/${purchaseId}`);
      return res;
    } catch (e) {
      console.error('[PointPurchaseService] 구매 취소 실패:', e);
      return e?.response || null;
    }
  }
};

export default PointPurchaseService;