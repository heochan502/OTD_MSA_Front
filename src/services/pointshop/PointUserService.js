import axios from 'axios';

axios.defaults.baseURL = '/api/OTD/pointshop';
axios.defaults.withCredentials = true;

export default {
  async fetchPurchaseHistory() {
    try {
      return await axios.get('/user/purchases');
    } catch (e) {
      return e.response;
    }
  },

  async createPurchase(itemId) {
    try {
      return await axios.post(`/purchase/${pointItemName}`);
    } catch (e) {
      return e.response;
    }
  },

  async deletePurchase(purchaseId) {
    try {
      return await axios.delete(`/user/purchases/${purchaseId}`);
    } catch (e) {
      return e.response;
    }
  }
};