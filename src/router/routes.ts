import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      // Al estar aquí adentro, se renderizan en el <router-view /> del Layout
      { path: '', redirect: '/inicio' },
      { path: 'inicio', component: () => import('pages/IndexPage.vue') },
      {
        path: 'bascula',
        meta: { permiso: 'Recepción de Granos - Báscula' },
        component: () => import('pages/recepcion/BasculaPage.vue'),
      },
      {
        path: 'analisis',
        meta: { permiso: 'Recepción de Granos - Análisis' },
        component: () => import('pages/analisis/AnalisisPage.vue'),
      },
      {
        path: 'precio',
        meta: { permiso: 'Recepción de Granos - Precio' },
        component: () => import('pages/precio/PrecioPage.vue'),
      },
      {
        path: 'boleta',
        meta: { permiso: 'Recepción de Granos - Boleta' },
        component: () => import('pages/boleta/BoletaPage.vue'),
      },
      {
        path: 'volcado',
        meta: { permiso: 'Recepción de Granos - Volcado' },
        component: () => import('pages/volcado/VolcadoPage.vue'),
      },
      {
        path: 'preliquidacion',
        meta: { permiso: 'Recepción de Granos - Pre-liquidación' },
        component: () => import('pages/preliquidacion/PreliquidacionPage.vue'),
      },
      {
        path: 'facturas',
        meta: { permiso: 'Recepción de Facturas' },
        component: () => import('pages/facturacion/FacturacionPage.vue'),
      },
      {
        path: 'productores',
        meta: { permiso: 'Pagos - Productores' },
        component: () => import('pages/pagos/PagosProductores.vue'),
      },
      {
        path: 'sede',
        meta: { permiso: 'Pagos - Pagos' },
        component: () => import('pages/pagos/PagosSede.vue'),
      },
      {
        path: 'produccion',
        meta: { permiso: 'Producción' },
        component: () => import('pages/produccion/ProduccionPage.vue'),
      },
      {
        path: 'configuracion',
        meta: { permiso: 'Configuración' },
        component: () => import('pages/configuracion/ParametrosGenerales.vue'),
      },
      // Ruta temporal para prueba de integración MBA3
      {
        path: 'prueba-mba3',
        component: () => import('pages/prueba/ClientesMBA3Page.vue'),
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
