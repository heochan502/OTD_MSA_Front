import axios from '@/services/httpRequester';

const PointPurchaseService = {
  // [POST] 사용자 포인트 아이템 구매
  async purchaseItem(pointId) {
    try {
      const res = await axios.post(`/pointshop/purchase/${pointId}`);
      return res.data;
    } catch (err) {
      console.error('[PointPurchaseService] 구매 실패:', err);
      return {
        success: false,
        message: err.response?.data?.message || '구매 요청 실패',
        data: null,
      };
    }
  },

  // [GET] 사용자 본인 구매 내역 조회
  async getUserPurchaseHistory() {
    try {
      const res = await axios.get('/pointshop/purchase/history/user');
      return res.data;
    } catch (err) {
      console.error('[PointPurchaseService] 구매 이력 조회 실패:', err);
      return {
        success: false,
        message: err.response?.data?.message || '구매 이력 불러오기 실패',
        data: [],
      };
    }
  },
};

export default PointPurchaseService;