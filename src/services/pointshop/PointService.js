import axios from 'axios';

axios.defaults.baseURL = '/api/OTD/pointshop';

export const getPointData = () => {
  return axios.get().catch((e) => e.response);
};

export const searchItems = (query) => {
  return axios
    .get('/search', { params: { query } })
    .catch((e) => e.response);
};
export const purchaseItem = (itemId) => {
  return axios
    .post(`/purchase/${itemId}`)
    .catch((e) => e.response);
};
export const getUserPoints = () => {
  return axios.get('/user/points').catch((e) => e.response);
}
export const getUserPurchases = () => {
  return axios.get('/user/purchases').catch((e) => e.response);
}
export const cancelPurchase = (purchaseId) => {
  return axios.delete(`/user/purchases/${purchaseId}`).catch((e) => e.response);
}
export const getItemDetails = (itemId) => {
  return axios.get(`/items/${itemId}`).catch((e) => e.response);
}
