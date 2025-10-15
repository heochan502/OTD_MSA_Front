import axios from '@/services/httpRequester';

const PointRechargeService = {
  // [POST] (관리자) 특정 유저 포인트 충전
  async chargePoints({ userId, amount }) {
    try {
      const res = await axios.post('/pointshop/recharge/admin', { userId, amount });
      return res.data;
    } catch (err) {
      console.error('[PointRechargeService] 관리자 충전 실패:', err);
      return {
        success: false,
        message: err.response?.data?.message || '포인트 충전 실패',
        data: null,
      };
    }
  },

  // [GET] (관리자) 전체 충전 내역 조회
  async getAllRechargeHistories() {
    try {
      const res = await axios.get('/pointshop/recharge/admin/history');
      return res.data;
    } catch (err) {
      console.error('[PointRechargeService] 전체 충전 이력 조회 실패:', err);
      return { success: false, message: '조회 실패', data: [] };
    }
  },

  // [GET] (관리자) 특정 유저 충전 내역 조회
  async getRechargeHistoryByUserId(userId) {
    try {
      const res = await axios.get(`/pointshop/recharge/admin/history/user/${userId}`);
      return res.data;
    } catch (err) {
      console.error('[PointRechargeService] 유저 충전 이력 조회 실패:', err);
      return { success: false, message: '조회 실패', data: [] };
    }
  },

  // [GET] (사용자) 본인 충전 내역 조회
  async getRechargeHistory() {
    try {
      const res = await axios.get('/pointshop/recharge/history/my');
      return res.data;
    } catch (err) {
      console.error('[PointRechargeService] 사용자 충전 이력 조회 실패:', err);
      return { success: false, message: '조회 실패', data: [] };
    }
  },

  // [GET] (사용자) 내 포인트 잔액 조회
  async getMyBalance() {
    try {
      const res = await axios.get('/pointshop/recharge/balance');
      return res.data;
    } catch (err) {
      console.error('[PointRechargeService] 포인트 잔액 조회 실패:', err);
      return { success: false, message: '잔액 조회 실패', data: 0 };
    }
  },
};

export default PointRechargeService;