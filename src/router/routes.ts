import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      // Al estar aquí adentro, se renderizan en el <router-view /> del Layout
      { path: '', redirect: '/inicio' },
      { path: 'inicio', component: () => import('pages/IndexPage.vue') },
      { path: 'bascula', component: () => import('pages/recepcion/BasculaPage.vue') },
      { path: 'analisis', component: () => import('pages/analisis/AnalisisPage.vue') },
      { path: 'precio', component: () => import('pages/precio/PrecioPage.vue') },
      { path: 'boleta', component: () => import('pages/boleta/BoletaPage.vue') },
      { path: 'volcado', component: () => import('pages/volcado/VolcadoPage.vue') },
      {
        path: 'preliquidacion',
        component: () => import('pages/preliquidacion/PreliquidacionPage.vue'),
      },
      {
        path: 'facturas',
        component: () => import('pages/facturacion/FacturacionPage.vue'),
      },
      {
        path: 'productores',
        component: () => import('pages/pagos/PagosProductores.vue'),
      },
      {
        path: 'sede',
        component: () => import('pages/pagos/PagosSede.vue'),
      },
      {
        path: 'configuracion',
        component: () => import('pages/configuracion/ParametrosGenerales.vue'),
      },
    ],
  },
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'), // El login NO usa el MainLayout
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
