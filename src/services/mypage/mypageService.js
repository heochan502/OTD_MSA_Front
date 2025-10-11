import axios from '@/services/httpRequester';

const path = `/community/my`;

export const getMyPosts = (page = 0, size = 10) => 
  axios.get(`${path}/posts`, { params: { page, size } });

export const getMyLikedPosts = (page = 0, size = 10) => 
  axios.get(`${path}/liked-posts`, { params: { page, size } });

export const getMyComments = (page = 0, size = 10) => 
  axios.get(`${path}/comments`, { params: { page, size } });

export const getMyStats = () => 
  axios.get(`${path}/stats`);