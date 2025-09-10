import App from './App.vue';
import router from './router';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import VCalendar from 'v-calendar';
import 'v-calendar/style.css';
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
