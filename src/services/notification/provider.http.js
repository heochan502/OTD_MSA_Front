import axios from 'axios';

export const HttpNotificationProvider = {
  async list() {
    const { data } = await axios.get('/api/notifications');
    return Array.isArray(data) ? data : [];
  },
  async markRead(id) {
    await axios.post('/api/notifications/read', { id });
  },
  async markAllRead() {
    await axios.post('/api/notifications/read-all');
  },
};
