// src/stores/notification/notification.js
import { defineStore } from 'pinia';
import {
  fetchNotifications,
  markRead,
  markAllRead,
} from '@/services/notification/notificationService';
import { useAuthenticationStore } from '@/stores/user/authentication';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    items: [],
    loading: false,
    error: null,
  }),
  getters: {
    unreadCount: (s) => s.items.filter((it) => !it.read).length,
  },
  actions: {
    async load() {
      this.loading = true;
      this.error = null;
      try {
        const auth = useAuthenticationStore();
        const userId = auth.state.signedUser?.userId;
        const { data } = await fetchNotifications(userId);
        // createdAt/created_at 대응
        this.items = (data || []).map((it) => ({
          ...it,
          createdAt: it.createdAt || it.created_at,
          read:
            typeof it.read === 'boolean'
              ? it.read
              : it.is_read === 1 || it.is_read === true || it.is_read === '1',
        }));
      } catch (e) {
        this.error = e;
        this.items = [];
      } finally {
        this.loading = false;
      }
    },
    async markRead(id) {
      try {
        const auth = useAuthenticationStore();
        const userId = auth.state.signedUser?.userId;
        await markRead(id, userId);
        const idx = this.items.findIndex((it) => it.id === id);
        if (idx !== -1) this.items[idx] = { ...this.items[idx], read: true };
      } catch (e) {
        console.error(e);
      }
    },
    async markAllRead() {
      try {
        const auth = useAuthenticationStore();
        const userId = auth.state.signedUser?.userId;
        await markAllRead(userId);
        this.items = this.items.map((it) => ({ ...it, read: true }));
      } catch (e) {
        console.error(e);
      }
    },
  },
});
