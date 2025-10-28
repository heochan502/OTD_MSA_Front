import axios from '@/services/httpRequester';

// 포인트 충전 관련 API
const PointRechargeService = {
  // [POST] 관리자 포인트 충전 
  async chargePoints({ userId, amount }) {
    try {
      const res = await axios.post(`/pointshop/recharge/${userId}`, { amount });
      return {
        success: true,
        message: '포인트 충전 성공',
        data: res.data?.data ?? res.data ?? null,
      };
    } catch (err) {
      console.error('[PointRechargeService] 관리자 충전 실패:', err);
      return {
        success: false,
        message: err.response?.data?.message || '포인트 충전 실패',
        data: null,
      };
    }
  },

  // [GET] 전체 충전 내역 조회
  async getAllRechargeHistories() {
    try {
      const res = await axios.get('/pointshop/recharge/admin/history');
      return {
        success: true,
        message: '전체 충전 이력 조회 성공',
        data: res.data?.data ?? res.data ?? [],
      };
    } catch (err) {
      console.error('[PointRechargeService] 전체 충전 이력 조회 실패:', err);
      return { success: false, message: '조회 실패', data: [] };
    }
  },

  // [GET] 특정 유저 충전 내역 조회
  async getRechargeHistoryByUserId(userId) {
    try {
      const res = await axios.get(`/pointshop/recharge/admin/history/user/${userId}`);
      return {
        success: true,
        message: '유저 충전 이력 조회 성공',
        data: res.data?.data ?? res.data ?? [],
      };
    } catch (err) {
      console.error('[PointRechargeService] 유저 충전 이력 조회 실패:', err);
      return { success: false, message: '조회 실패', data: [] };
    }
  },

  // [GET] 내 충전 내역
  async getRechargeHistory() {
    try {
      const res = await axios.get('/pointshop/recharge/history/my');
      return {
        success: true,
        message: '내 충전 이력 조회 성공',
        data: res.data?.data ?? res.data ?? [],
      };
    } catch (err) {
      console.error('[PointRechargeService] 사용자 충전 이력 조회 실패:', err);
      return { success: false, message: '조회 실패', data: [] };
    }
  },

  // [GET] 내 포인트 잔액 → RechargeController.getMyBalance()
  async getMyBalance() {
    try {
      const res = await axios.get('/pointshop/recharge/balance');
      return {
        success: true,
        message: res.data?.message || '포인트 잔액 조회 성공',
        data: res.data?.data ?? 0,
      };
    } catch (err) {
      console.error('[PointRechargeService] 포인트 잔액 조회 실패:', err);
      return { success: false, message: '잔액 조회 실패', data: 0 };
    }
  },
};

export default PointRechargeService;
