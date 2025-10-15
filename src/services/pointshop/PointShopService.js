import axios from '@/services/httpRequester';

const PointShopService = {
  // [GET] 전체 아이템 목록 조회
  async getAllItems() {
    try {
      const res = await axios.get('/pointshop/list');
      return res.data;
    } catch (err) {
      console.error('[PointShopService] 아이템 목록 요청 실패:', err);
      return { success: false, message: '아이템 목록 불러오기 실패', data: [] };
    }
  },

  // [GET] 키워드 기반 아이템 검색
  async getItemsByKeyword(keyword) {
    try {
      const res = await axios.get('/pointshop/keyword', { params: { keyword } });
      return res.data;
    } catch (err) {
      console.error('[PointShopService] 키워드 검색 실패:', err);
      return { success: false, message: '검색 실패', data: [] };
    }
  },

  // [POST] 아이템 등록 (관리자)
  async addItem(formData) {
    try {
      const res = await axios.post('/pointshop/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (err) {
      console.error('[PointShopService] 아이템 등록 실패:', err);
      return {
        success: false,
        message: err.response?.data?.message || '아이템 등록 실패',
        data: null,
      };
    }
  },
};

export default PointShopService;