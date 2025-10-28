const KEY = 'demo_notifications';

function genId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID)
    return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}
function save(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export const LocalNotificationProvider = {
  async list() {
    const a = load();
    return a.sort((x, y) => +new Date(y.createdAt) - +new Date(x.createdAt));
  },
  async markRead(id) {
    const a = load().map((x) => (x.id === id ? { ...x, read: true } : x));
    save(a);
  },
  async markAllRead() {
    save(load().map((x) => ({ ...x, read: true })));
  },
  async pushMock(n) {
    const a = load();
    a.unshift({
      id: n?.id || uuid(),
      title: n?.title || '알림',
      body: n?.body || '',
      category: n?.category || 'system',
      createdAt: n?.createdAt || new Date().toISOString(),
      read: false,
    });
    save(a);
  },
};
