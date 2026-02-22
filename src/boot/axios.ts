import { boot } from 'quasar/wrappers';
import axios, { type AxiosInstance } from 'axios';
import { useAuthStore } from 'src/stores/auth';
import { Notify } from 'quasar';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

const API_URL = process.env.DEV ? 'http://localhost:5183' : 'https://alazan-app.consul-tek.com/api';

const api = axios.create({ baseURL: API_URL });

// Bandera para evitar múltiples notificaciones y redirecciones simultáneas
let isRedirecting = false;

// --- INTERCEPTOR DE PETICIÓN (Request) ---
api.interceptors.request.use(
  (config) => {
    // 1. Obtener el token del LocalStorage
    const token = localStorage.getItem('jwt');

    // 2. Si existe el token, añadirlo a los headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const rutasExcluidas = ['auth/login'];
    const esRutaExcluida = rutasExcluidas.some((ruta) => config.url?.includes(ruta));
    const esUrlExterna = config.url?.startsWith('http');

    if (!esRutaExcluida && !esUrlExterna) {
      const authStore = useAuthStore();
      const sedeId = authStore.sedeActivaId ?? 0;

      config.params = {
        ...config.params,
        sedeId,
      };

      if (authStore.user?.nombre_completo) {
        config.headers['X-User-Email'] = authStore.user.nombre_completo;
      }
    }

    return config;
  },
  (error: unknown) => {
    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  },
);

// --- INTERCEPTOR DE RESPUESTA (Response) ---
api.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa, se devuelve tal cual
    return response;
  },
  async (error) => {
    // Si el servidor responde con 401 (Token caducado o inválido)
    if (error.response && error.response.status === 401) {
      // Solo ejecutamos la lógica de redirección si no hay una en curso
      if (!isRedirecting) {
        isRedirecting = true;

        const authStore = useAuthStore();

        // 1. Notificamos al usuario
        Notify.create({
          type: 'warning',
          message: 'Su sesión ha caducado. Por favor, ingrese de nuevo.',
          position: 'top',
          timeout: 2500,
        });

        // 2. Limpiar sesión y redirigir
        // Usamos la acción logout del store que ya configuramos anteriormente
        authStore.logout();

        // Reseteamos la bandera después de un tiempo prudente
        setTimeout(() => {
          isRedirecting = false;
        }, 5000);
      }
    }

    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  },
);

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };
