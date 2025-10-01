import axios from 'axios';

axios.defaults.baseURL = '/api/OTD/pointshop';
axios.defaults.withCredentials = true;

export default {
  async getAllItems() {
    try {
      return await axios.get('/items');
    } catch (e) {
      return e.response;
    }
  },
  
  async getUserPoints() {
    try {
      return await axios.get('/user/points');
    } catch (e) {
      return e.response;
    }
  },

  async redeemUserPoints(amount) {
    try {
      return await axios.post('/user/redeem', { amount });
    } catch (e) {
      return e.response;
    }
  }
};
