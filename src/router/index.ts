// src/router/index.ts
import { route } from 'quasar/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import { getActivePinia } from 'pinia';
import { useAuthStore } from 'src/stores/auth';
import routes from './routes';

export default route(function (/* { store } */) {
  const createHistory = processEnv.SERVER
    ? createMemoryHistory
    : processEnv.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(processEnv.VUE_ROUTER_BASE ? processEnv.VUE_ROUTER_BASE : ''),
  });

  Router.beforeEach((to, from, next) => {
    // IMPORTANTE: No usar el parámetro store directamente
    // En su lugar, usar getActivePinia() que buscará la instancia activa
    const pinia = getActivePinia();

    if (!pinia) {
      // Si Pinia no está inicializado aún, permitir la navegación
      // La protección se hará en el componente o en un hook posterior
      console.warn('Pinia no está inicializado aún');
      next();
      return;
    }

    const authStore = useAuthStore(pinia);

    const publicPages = ['/login', '/register', '/forgot-password']; // Ajusta según tus rutas públicas
    const authRequired = !publicPages.includes(to.path);

    if (authRequired && !authStore.isLoggedIn) {
      next('/login');
    } else if (to.path === '/login' && authStore.isLoggedIn) {
      // Redirigir al home si ya está autenticado
      next('/');
    } else {
      next();
    }
  });

  return Router;
});

// Necesitas estas variables de entorno tipadas
declare global {
  const processEnv: {
    SERVER?: boolean;
    VUE_ROUTER_MODE?: 'history' | 'hash';
    VUE_ROUTER_BASE?: string;
  };
}

const processEnv = {
  SERVER: typeof process !== 'undefined' && process.env?.SERVER === 'true',
  VUE_ROUTER_MODE:
    typeof process !== 'undefined'
      ? (process.env?.VUE_ROUTER_MODE as 'history' | 'hash')
      : undefined,
  VUE_ROUTER_BASE: typeof process !== 'undefined' ? process.env?.VUE_ROUTER_BASE : undefined,
};
