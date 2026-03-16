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

// En DEV: baseURL vacío → las peticiones van a /api/... relativo al host actual
// Vite proxy intercepta /api → http://localhost:5183 (funciona desde cualquier dispositivo en la red)
// En PROD: URL absoluta del servidor desplegado
const API_URL = process.env.DEV ? '' : 'https://alazan-app.consul-tek.com/api';

const api = axios.create({ baseURL: API_URL });

// Bandera para evitar múltiples notificaciones y redirecciones simultáneas
let isRedirecting = false;

/**
 * Decodifica el claim `exp` del JWT sin librerías externas.
 * Retorna true si el token ya venció (o si no se puede decodificar, false para no bloquear).
 */
function isJwtExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1] ?? ''));
    if (typeof payload.exp !== 'number') return false;
    // Margen de 10 segundos para absorber diferencias de reloj
    return Date.now() >= (payload.exp - 10) * 1000;
  } catch {
    return false;
  }
}

function handleSessionExpired() {
  if (isRedirecting) return;
  isRedirecting = true;
  const authStore = useAuthStore();
  Notify.create({
    type: 'warning',
    message: 'Su sesión ha caducado. Por favor, ingrese de nuevo.',
    position: 'top',
    timeout: 2500,
  });
  authStore.logout();
  setTimeout(() => { isRedirecting = false; }, 5000);
}

// --- INTERCEPTOR DE PETICIÓN (Request) ---
api.interceptors.request.use(
  (config) => {
    // 1. Obtener el token del LocalStorage
    const token = localStorage.getItem('jwt');

    // 2. Verificar expiración ANTES de enviar — evita el round-trip inútil
    if (token && isJwtExpired(token)) {
      handleSessionExpired();
      return Promise.reject(new Error('jwt_expired'));
    }

    // 3. Si existe el token, añadirlo a los headers
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
      handleSessionExpired();
    }

    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  },
);

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };
