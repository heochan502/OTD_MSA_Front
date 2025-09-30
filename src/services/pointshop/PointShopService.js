import axios from 'axios';

axios.defaults.baseURL = '/api/OTD/pointshop';
axios.defaults.withCredentials = true;

class PointService {
  // 아이템
  async getItems(categoryId = null) {
    const params = categoryId ? { category: categoryId } : {};
    try {
      return await axios.get('/items', { params });
    } catch (e) {
      return e.response;
    }
  }

  async searchItems(query) {
    try {
      return axios.get('/search', { params: { query } });
    } catch(e) {
    return e.response;
    }
  }

  // 유저
  async getUserPoints() {
    try {
      return await axios.get('/user/points');
    } catch (e) {
      return e.response;
    }
  }

  async fetchPurchaseHistory() {
    try {
      return await axios.get('/user/purchases');
    } catch (e) {
      return e.response;
    }
  }

  // 구매
  async createPurchase(itemId) {
    try {
      return await axios.post(`/purchase/${itemId}`);
    } catch (e) {
      return e.response;
    }
  }

  async deletePurchase(purchaseId) {
    try {
      return await axios.delete(`/user/purchases/${purchaseId}`);
    } catch (e) {
      return e.response;
    }
  }

  // 포인트 사용/교환 관련
  async redeemUserPoints(amount) {
  try {
      return await axios.post('/user/redeem', { amount });
    } catch (e) {
      return e.response;
    }
  }
}

export default new PointService();