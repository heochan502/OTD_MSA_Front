import axios from 'axios';

axios.defaults.baseURL = '/api/OTD/pointshop';
axios.defaults.withCredentials = true;

class PointService {
  // 아이템
  async getAllItems() {
    return axios.get('/items').catch((e) => e.response);
  }

  async searchItems(query) {
    return axios.get('/search', { params: { query } }).catch((e) => e.response);
  }

  async getItemsByCategory(categoryId) {
    return axios.get('/items', { params: { category: categoryId } }).catch((e) => e.response);
  }

  // 유저
  async getUserPoints() {
    return axios.get('/user/points').catch((e) => e.response);
  }

  async getUserPurchases() {
    return axios.get('/user/purchases').catch((e) => e.response);
  }

  // 구매
  async purchaseItem(itemId) {
    return axios.post(`/purchase/${itemId}`).catch((e) => e.response);
  }

  async cancelPurchase(purchaseId) {
    return axios.delete(`/user/purchases/${purchaseId}`).catch((e) => e.response);
  }

  // 포인트 사용/교환 관련
  async redeemPoints(amount) {
    return axios.post('/user/redeem', { amount }).catch((e) => e.response);
  }
}

export default new PointService();