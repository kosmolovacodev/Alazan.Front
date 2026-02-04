import { boot } from 'quasar/wrappers';
import axios, { type AxiosInstance } from 'axios';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// Cambia esta URL por la de tu API (la que configuramos en appsettings.json)
// const api = axios.create({ baseURL: 'http://192.168.0.251:5183' });
  const api = axios.create({ baseURL: '/' });

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };
