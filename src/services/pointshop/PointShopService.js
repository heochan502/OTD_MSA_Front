import axios from '@/services/httpRequester'

const PointShopService = {
  // [GET] 전체 아이템 목록 (카테고리, 페이지네이션 포함)
  async getAllItems(categoryId = null, page = 0, size = 20) {
    try {
      const params = { page, size }
      if (categoryId && categoryId !== 'all') {
        params.pointCategoryId = categoryId
      }

      const res = await axios.get('/pointshop/list', { params })
      const data = res?.data?.data
      if (Array.isArray(data)) return data
      if (data?.content && Array.isArray(data.content)) return data.content
      return []
    } catch (err) {
      console.error('[PointShopService] 아이템 목록 조회 실패:', err)
      return []
    }
  },

  // [GET] 키워드 검색
  async getItemsByKeyword(keyword) {
    try {
      const res = await axios.get('/pointshop/keyword', { params: { keyword } });
      const data = res?.data?.data;
      if (Array.isArray(data)) return data;
      if (data?.content && Array.isArray(data.content)) return data.content;
      return [];
    } catch (err) {
      console.error('[PointShopService] 키워드 검색 실패:', err);
      return [];
    }
  },

  // [GET] 전체 카테고리 목록
  async getAllCategories() {
    try {
      const res = await axios.get('/pointshop/category/list')
      const data = res?.data?.data
      return Array.isArray(data) ? data : []
    } catch (err) {
      console.error('[PointShopService] 카테고리 목록 조회 실패:', err)
      return []
    }
  },

  // [POST] 포인트 아이템 등록 (관리자 전용)
  async addItem(formData) {
    try {
      const res = await axios.post('/pointshop/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return {
        success: true,
        message: '아이템 등록 성공',
        data: res.data?.data ?? res.data ?? null,
      }
    } catch (err) {
      console.error('[PointShopService] 아이템 등록 실패:', err)
      return {
        success: false,
        message: err.response?.data?.message || '아이템 등록 실패',
        data: null,
      }
    }
  },
}

export default PointShopService
