import App from './App.vue';
import router from './router';

// 전역 스타일
import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

// Vuetify & 관련 아이콘
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';

// Pinia 상태 유지
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

// v-calendar
import VCalendar from 'v-calendar';
import 'v-calendar/style.css';

// Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

// ✅ 기본 아바타 이미지(프로젝트 경로에 맞게 조정)
import fallbackAvatar from '@/assets/img/community/default-profile.png';

window.addEventListener('load', () => {
  localStorage.removeItem('authentication');
});
// 모든 <img> 에러를 전역에서 잡아 기본 아바타로 교체
window.addEventListener(
  'error',
  (e) => {
    const el = e.target;
    if (!el || el.tagName !== 'IMG') return;
    const img = el; // HTMLImageElement
    if (img._fallbackApplied) return;
    img._fallbackApplied = true;
    img.src = fallbackAvatar;
  },
  true
);

const app = createApp(App);
const pinia = createPinia();
const vuetify = createVuetify();

pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(vuetify);
app.use(router);
app.use(VCalendar, {
  componentPrefix: 'vc', // 모든 컴포넌트 이름 앞에 vc- 붙음
});
app.mount('#app');
