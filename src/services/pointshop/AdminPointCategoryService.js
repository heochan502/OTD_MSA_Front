import axios from '@/services/httpRequester'

const AdminPointCategoryService = {
  // [GET] 전체 카테고리 목록
  async getAllCategories() {
    try {
      const res = await axios.get('/pointshop/category/list')
      return res?.data?.data || []
    } catch (e) {
      console.error('[AdminPointCategoryService] 카테고리 목록 조회 실패:', e)
      return []
    }
  },

  // [POST] 카테고리 등록
  async addCategory(categoryName) {
    try {
      const res = await axios.post('/pointshop/category/add', null, {
        params: { categoryName },
      })
      return res?.data
    } catch (e) {
      console.error('[AdminPointCategoryService] 카테고리 등록 실패:', e)
      throw e
    }
  },

  // [PUT] 카테고리 이름 수정
  async editCategory(categoryId, newName) {
    try {
      const res = await axios.put(`/pointshop/category/${categoryId}`, null, {
        params: { newName },
      })
      return res?.data
    } catch (e) {
      console.error('[AdminPointCategoryService] 카테고리 수정 실패:', e)
      throw e
    }
  },

  // [DELETE] 카테고리 삭제
  async deleteCategory(categoryId) {
    try {
      const res = await axios.delete(`/pointshop/category/${categoryId}`)
      return res?.data
    } catch (e) {
      console.error('[AdminPointCategoryService] 카테고리 삭제 실패:', e)
      throw e
    }
  },
}

export default AdminPointCategoryService
