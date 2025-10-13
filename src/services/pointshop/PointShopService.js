import axios from '@/services/httpRequester';

const PointShopService = {
  // [GET] 전체 아이템 목록 조회
  async getAllItems() {
    try {
      const res = await axios.get('/pointshop/list');
      return res;
    } catch (e) {
      console.error('[PointShopService] 아이템 목록 요청 실패:', e);
      return e?.response || null;
    }
  },

  // [GET] 사용자 포인트 조회 (중복 방지 위해 이름 구분)
  async getUserPoints() {
    try {
      const res = await axios.get('/pointshop/user/points');
      return res;
    } catch (e) {
      console.error('[PointShopService] 포인트 조회 실패:', e);
      return e?.response || null;
    }
  },

  // [POST] 포인트 차감 (아이템 구매 후 서버 포인트 차감용)
  async redeemUserPoints(amount) {
    try {
      const res = await axios.post('/pointshop/user/redeem', { amount });
      return res;
    } catch (e) {
      console.error('[PointShopService] 포인트 차감 실패:', e);
      return e?.response || null;
    }
  }
};

export default PointShopService;