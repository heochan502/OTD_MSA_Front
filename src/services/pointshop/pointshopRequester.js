import axios from 'axios';

const pointshopRequester = axios.create({
  baseURL: 'http://localhost:8082/api/OTD/pointshop',
  withCredentials: true,
});

export default pointshopRequester;