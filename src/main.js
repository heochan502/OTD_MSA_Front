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
