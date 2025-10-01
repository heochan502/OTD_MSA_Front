import axios from 'axios';

axios.defaults.baseURL = '/api/OTD/pointshop';
axios.defaults.withCredentials = true;

const PointPurchaseService = {
  // [GET] 사용자 구매 내역 조회
  async fetchPurchaseHistory() {
    try {
      return await axios.get('/user/purchases');
    } catch (e) {
      return e.response;
    }
  },

  // [POST] 아이템 구매 요청
  async createPurchase(pointItemName) {
    try {
      return await axios.post(`/purchase/${pointItemName}`);
    } catch (e) {
      return e.response;
    }
  },

  // [DELETE] 구매 취소
  async deletePurchase(purchaseId) {
    try {
      return await axios.delete(`/user/purchases/${purchaseId}`);
    } catch (e) {
      return e.response;
    }
  }
};

export default PointPurchaseService;