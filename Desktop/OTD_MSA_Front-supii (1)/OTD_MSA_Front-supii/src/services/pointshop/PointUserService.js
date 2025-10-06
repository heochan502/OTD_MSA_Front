import axios from 'axios';

axios.defaults.baseURL = '/api/OTD/pointshop/user';
axios.defaults.withCredentials = true;

export default {
  async getUserPoints() {
    try {
      const res = await axios.get('/balance');
      return res;
    } catch (e) {
      return e.response;
    }
  },

  async chargePoints(amount) {
    try {
      return await axios.post('/charge', { amount });
    } catch (e) {
      return e.response;
    }
  },

  async deductPoints(amount) {
    try {
      return await axios.post('/deduct', { amount });
    } catch (e) {
      return e.response;
    }
  }
};
