import { route } from 'quasar/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import { getActivePinia } from 'pinia';
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
    const pinia = getActivePinia();

    if (!pinia) {
      next();
      return;
    }

    const publicPages = ['/login'];
    const authRequired = !publicPages.includes(to.path);
    const hasToken = !!localStorage.getItem('jwt');

    if (authRequired && !hasToken) {
      // Si el módulo (como preliquidación) requiere auth y no hay token, al login
      console.warn(`Acceso denegado a ${to.path}. Redirigiendo al login...`);
      next('/login');
    } else if (to.path === '/login' && hasToken) {
      // Si ya está logueado y quiere ir al login, lo mandamos al inicio
      next('/inicio');
    } else {
      // En cualquier otro caso (página pública o usuario logueado), adelante
      next();
    }
  });

  return Router;
});

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
