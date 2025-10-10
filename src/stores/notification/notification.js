import { defineStore } from 'pinia';
import { LocalNotificationProvider } from '@/services/notifications/provider.local';
// import { HttpNotificationProvider } from '@/services/notifications/provider.http'

const provider = LocalNotificationProvider;
// const provider = HttpNotificationProvider

function timeAgo(iso) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return `${Math.floor(s)}초 전`;
  const m = s / 60;
  if (m < 60) return `${Math.floor(m)}분 전`;
  const h = m / 60;
  if (h < 24) return `${Math.floor(h)}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    items: [],
    loading: false,
  }),
  getters: {
    unreadCount: (s) => s.items.filter((i) => !i.read).length,
    timeAgo: () => timeAgo,
  },
  actions: {
    async load() {
      this.loading = true;
      try {
        this.items = await provider.list();
      } finally {
        this.loading = false;
      }
    },
    async markRead(id) {
      await provider.markRead(id);
      const i = this.items.find((x) => x.id === id);
      if (i) i.read = true;
    },
    async markAllRead() {
      await provider.markAllRead();
      this.items.forEach((i) => (i.read = true));
    },
    async pushDemo(body = '운동 잘했다!') {
      await provider.pushMock?.({
        title: '커뮤니티',
        body,
        category: 'comment',
        createdAt: new Date().toISOString(),
        read: false,
      });
      await this.load();
    },
  },
  persist: true,
});
