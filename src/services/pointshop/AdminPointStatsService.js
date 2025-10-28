import axios from '@/services/httpRequester';

const AdminPointStatsService = {
  // [GET] 월별 요약 통계
  async getMonthlySummary() {
    try {
      const res = await axios.get('/admin/pointshop/stats/summary');
      return res?.data?.data || [];
    } catch (e) {
      console.error('[AdminPointStatsService] 월별 요약 조회 실패:', e);
      return [];
    }
  },

  // [GET] 카테고리별 구매 포인트 통계
  async getCategoryTotals() {
    try {
      const res = await axios.get('/admin/pointshop/stats/category');
      return res?.data?.data || [];
    } catch (e) {
      console.error('[AdminPointStatsService] 카테고리별 통계 조회 실패:', e);
      return [];
    }
  },

  // [GET] 인기 아이템
  async getPopularItems() {
    try {
      const res = await axios.get('/admin/pointshop/stats/popular');
      return res?.data?.data || [];
    } catch (e) {
      console.error('[AdminPointStatsService] 인기 아이템 조회 실패:', e);
      return [];
    }
  },

  // [GET] 사용자별 충전 TOP10
  async getTopRechargeUsers() {
    try {
      const res = await axios.get('/admin/pointshop/stats/top/recharge');
      return res?.data?.data || [];
    } catch (e) {
      console.error('[AdminPointStatsService] 충전 TOP10 조회 실패:', e);
      return [];
    }
  },

  // [GET] 사용자별 구매 TOP10
  async getTopPurchaseUsers() {
    try {
      const res = await axios.get('/admin/pointshop/stats/top/purchase');
      return res?.data?.data || [];
    } catch (e) {
      console.error('[AdminPointStatsService] 구매 TOP10 조회 실패:', e);
      return [];
    }
  },
};

export default AdminPointStatsService;