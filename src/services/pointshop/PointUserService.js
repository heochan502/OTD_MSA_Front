import axios from '@/services/httpRequester';

const PointUserService = {
  // [GET] 사용자 포인트 조회
  async getUserPoints() {
    try {
      const res = await axios.get('/pointshop/user/points');
      return res;
    } catch (e) {
      console.error('[PointUserService] 포인트 조회 실패:', e);
      return e?.response || null;
    }
  },

  // [POST] 포인트 충전
  async chargePoints(amount) {
    try {
      const res = await axios.post('/pointshop/charge', { amount });
      return res;
    } catch (e) {
      console.error('[PointUserService] 포인트 충전 실패:', e);
      return e?.response || null;
    }
  },

  // [POST] 포인트 차감
  async deductPoints(amount) {
    try {
      const res = await axios.post('/pointshop/deduct', { amount });
      return res;
    } catch (e) {
      console.error('[PointUserService] 포인트 차감 실패:', e);
      return e?.response || null;
    }
  }
};

export default PointUserService;