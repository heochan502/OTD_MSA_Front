import axios from '@/services/httpRequester';

const PointPurchaseService = {
  // [POST] 포인트 아이템 구매
  async purchaseItem(pointId) {
    try {
      const res = await axios.post(`/pointshop/purchase/${pointId}`);
      return {
        success: true,
        message: res.data?.message || '구매 성공',
        data: res.data?.data ?? null,
      };
    } catch (err) {
      console.error('[PointPurchaseService] 구매 실패:', err);
      return {
        success: false,
        message: err.response?.data?.message || '구매 요청 실패',
        data: null,
      };
    }
  },

  // [POST] 포인트 직접 차감
  async usePoint(usedAmount, usageType = 'GENERAL_USE') {
    try {
      const res = await axios.post('/pointshop/purchase/use', null, {
        params: { usedAmount, usageType },
      });
      return {
        success: true,
        message: res.data?.message || '포인트 사용 성공',
        data: res.data?.data ?? null,
      };
    } catch (err) {
      console.error('[PointPurchaseService] 포인트 사용 실패:', err);
      return {
        success: false,
        message: err.response?.data?.message || '포인트 사용 실패',
        data: null,
      };
    }
  },

  // [GET] 내 구매 이력 조회
  async getUserPurchaseHistory() {
    try {
      const res = await axios.get('/pointshop/purchase/history/user');
      return {
        success: true,
        message: res.data?.message || '구매 이력 조회 성공',
        data: res.data?.data ?? [],
      };
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