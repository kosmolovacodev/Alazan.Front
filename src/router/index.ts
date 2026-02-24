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
      console.warn(`Acceso denegado a ${to.path}. Redirigiendo al login...`);
      next('/login');
      return;
    }

    if (to.path === '/login' && hasToken) {
      next('/inicio');
      return;
    }

    // Verificar permiso de pantalla si la ruta lo requiere
    const permiso = to.meta?.permiso as string | undefined;
    if (permiso && hasToken) {
      try {
        const user = JSON.parse(localStorage.getItem('alazan_user') || 'null');
        if (user && user.nombre_rol !== 'ADMIN') {
          const lista: string[] = JSON.parse(user.permisos_json || '[]');
          if (!lista.includes(permiso)) {
            console.warn(`Sin permiso para ${to.path} (requiere: ${permiso})`);
            next('/inicio');
            return;
          }
        }
      } catch {
        next('/inicio');
        return;
      }
    }

    next();
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
