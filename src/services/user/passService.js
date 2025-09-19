import axios from '@/services/httpRequester';

const path = '/pass';

export const verifyPassAuth = (data) => axios.post(`${path}/verify`, data);
