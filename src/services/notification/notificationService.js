// src/services/notification/notificationService.js
import axios from '@/services/httpRequester';

const BASE = '/notifications';

const withUser = (userId, extra = {}) => ({
  ...extra,
  'Content-Type': 'application/json',
  'X-User-Id': String(userId ?? 0), // 새 필터 호환
  'X-MEMBER-ID': String(userId ?? 0), // 구버전 호환
});

export const fetchNotifications = (userId) =>
  axios.get(BASE, { headers: withUser(userId) });

export const markRead = (id, userId) =>
  axios.patch(`${BASE}/${id}/read`, null, { headers: withUser(userId) });

export const markAllRead = (userId) =>
  axios.post(`${BASE}/mark-all-read`, null, { headers: withUser(userId) });
