<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-orange-8">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title class="row items-center">
          <q-img src="~assets/alazanLogo.png" style="height: 35px; width: 110px" fit="contain" />
        </q-toolbar-title>

        <q-space />

        <div v-if="authStore.isLoggedIn" class="row items-center q-gutter-sm q-mr-md">
          <q-icon name="place" size="xs" color="white" />

          <q-select
            v-if="authStore.esAdminGlobal"
            v-model="authStore.sedeActivaId"
            :options="authStore.listaSedes"
            option-value="id"
            option-label="nombre"
            emit-value
            map-options
            dark
            dense
            borderless
            label="Bodega"
            style="min-width: 180px"
            @update:model-value="alCambiarSede"
          >
            <q-tooltip>Cambiar sede de visualización</q-tooltip>
          </q-select>

          <div v-else class="text-white text-subtitle2 text-weight-bold">
            {{ authStore.nombreSedeActiva }}
          </div>
        </div>

        <div class="q-gutter-sm row items-center no-wrap">
          <q-btn
            v-if="authStore.tienePermiso('Configuración')"
            flat
            round
            dense
            icon="settings"
            to="/configuracion"
          >
            <q-tooltip>Configuración del Sistema</q-tooltip>
          </q-btn>

          <q-btn flat round dense icon="person">
            <q-menu transition-show="jump-down" transition-hide="jump-up" :offset="[0, 10]">
              <q-list style="min-width: 220px">
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="account_circle" color="primary" size="md" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label caption>Usuario</q-item-label>
                    <q-item-label class="text-weight-bold">
                      {{ authStore.user?.nombre_completo || 'Usuario' }}
                    </q-item-label>
                    <q-item-label caption>{{ authStore.user?.email }}</q-item-label>
                    <q-item-label caption class="text-uppercase text-primary text-weight-bolder">
                      {{ authStore.user?.nombre_rol }}
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-separator />

                <q-item clickable v-ripple @click="handleLogout" class="text-negative">
                  <q-item-section avatar>
                    <q-icon name="logout" color="negative" />
                  </q-item-section>
                  <q-item-section>Cerrar Sesión</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered style="background-color: #161c5c">
      <q-list padding class="text-white">
        <q-item-label header class="text-white text-weight-bold q-pb-md">
          MÓDULOS DEL SISTEMA
        </q-item-label>

        <q-item clickable to="/inicio" active-class="menu-item-active" class="text-menu-inactive">
          <q-item-section avatar><q-icon name="home" /></q-item-section>
          <q-item-section>Inicio</q-item-section>
        </q-item>

        <q-expansion-item
          v-if="verRecepcion"
          icon="scale"
          label="Recepción de Granos"
          header-class="text-menu-inactive"
          expand-icon-class="text-white"
          default-opened
        >
          <q-list class="q-pl-sm">
            <q-item
              v-if="authStore.tienePermiso('Recepción de Granos - Báscula')"
              clickable
              to="/bascula"
              active-class="menu-item-active"
              class="text-menu-inactive sub-menu-item"
            >
              <q-item-section>Báscula</q-item-section>
              <q-item-section side>
                <q-badge v-if="basculaPendientesTotal > 0" color="orange" floating>
                  {{ basculaPendientesTotal }}
                </q-badge>
              </q-item-section>
            </q-item>
            <q-item
              v-if="authStore.tienePermiso('Recepción de Granos - Análisis')"
              clickable
              to="/analisis"
              active-class="menu-item-active"
              class="text-menu-inactive sub-menu-item"
            >
              <q-item-section>Análisis</q-item-section>
              <q-item-section side>
                <q-badge v-if="analisisPendientesTotal > 0" color="orange" floating>
                  {{ analisisPendientesTotal }}
                </q-badge>
              </q-item-section>
            </q-item>
            <q-item
              v-if="authStore.tienePermiso('Recepción de Granos - Precio')"
              clickable
              to="/precio"
              active-class="menu-item-active"
              class="text-menu-inactive sub-menu-item"
            >
              <q-item-section>Precio</q-item-section>
              <q-item-section side>
                <q-badge v-if="precioPendientesTotal > 0" color="orange" floating>{{ precioPendientesTotal }}</q-badge>
              </q-item-section>
            </q-item>
            <q-item
              v-if="authStore.tienePermiso('Recepción de Granos - Boleta')"
              clickable
              to="/boleta"
              active-class="menu-item-active"
              class="text-menu-inactive sub-menu-item"
            >
              <q-item-section>Boleta</q-item-section>
              <q-item-section side>
                <q-badge v-if="boletaPendientesTotal > 0" color="orange" floating>{{ boletaPendientesTotal }}</q-badge>
              </q-item-section>
            </q-item>
            <q-item
              v-if="authStore.tienePermiso('Recepción de Granos - Volcado')"
              clickable
              to="/volcado"
              active-class="menu-item-active"
              class="text-menu-inactive sub-menu-item"
            >
              <q-item-section>Volcado</q-item-section>
              <q-item-section side>
                <q-badge v-if="volcadoPendientesTotal > 0" color="orange" floating>{{ volcadoPendientesTotal }}</q-badge>
              </q-item-section>
            </q-item>
            <q-item
              v-if="authStore.tienePermiso('Recepción de Granos - Pre-liquidación')"
              clickable
              to="/preliquidacion"
              active-class="menu-item-active"
              class="text-menu-inactive sub-menu-item"
            >
              <q-item-section>Pre-liquidación</q-item-section>
              <q-item-section side>
                <q-badge v-if="preliqPendientesTotal > 0" color="orange" floating>{{ preliqPendientesTotal }}</q-badge>
              </q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>
        <q-item
          v-if="authStore.tienePermiso('Recepción de Facturas')"
          clickable
          to="/facturas"
          active-class="menu-item-active"
          class="text-menu-inactive"
        >
          <q-item-section avatar><q-icon name="receipt_long" /></q-item-section>
          <q-item-section>Recepción de Facturas</q-item-section>
          <q-item-section side>
            <q-badge v-if="facturacionPendientesTotal > 0" color="orange" floating>{{ facturacionPendientesTotal }}</q-badge>
          </q-item-section>
        </q-item>

        <q-expansion-item
          v-if="verPagos"
          icon="payments"
          label="Pagos"
          header-class="text-menu-inactive"
          expand-icon-class="text-white"
        >
          <q-list class="q-pl-sm">
            <q-item
              v-if="authStore.tienePermiso('Pagos - Productores')"
              clickable
              to="/productores"
              active-class="menu-item-active"
              class="text-menu-inactive sub-menu-item"
            >
              <q-item-section>Productores</q-item-section>
            </q-item>
            <q-item
              v-if="authStore.tienePermiso('Pagos - Pagos')"
              clickable
              to="/sede"
              active-class="menu-item-active"
              class="text-menu-inactive sub-menu-item"
            >
              <q-item-section>Sede</q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>

        <q-expansion-item
          v-if="authStore.tienePermiso('Producción')"
          icon="precision_manufacturing"
          :label="produccionPendientesTotal > 0 ? `Producción (${produccionPendientesTotal})` : 'Producción'"
          header-class="text-menu-inactive"
          expand-icon-class="text-white"
          to="/produccion"
          exact
        >
          <q-list class="q-pl-sm">
            <q-item
              v-if="authStore.tienePermiso('Producción - Análisis de Calidad')"
              clickable
              :active="route.path === '/produccion' && route.query.seccion === 'analisis'"
              active-class="menu-item-active"
              class="text-menu-inactive sub-menu-item"
              @click="irAnalisisCalidad"
            >
              <q-item-section>Análisis de Calidad</q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer v-if="!isOnline" class="bg-red-10 text-white">
      <q-toolbar dense>
        <q-icon name="cloud_off" class="q-mr-sm" />
        <div class="text-weight-bold text-caption">
          MODO SIN CONEXIÓN
          <template v-if="basculaPendientesTotal > 0"> · {{ basculaPendientesTotal }} báscula</template>
          <template v-if="analisisPendientesTotal > 0"> · {{ analisisPendientesTotal }} análisis</template>
          <template v-if="precioPendientesTotal > 0"> · {{ precioPendientesTotal }} precio</template>
          <template v-if="boletaPendientesTotal > 0"> · {{ boletaPendientesTotal }} boleta</template>
          <template v-if="volcadoPendientesTotal > 0"> · {{ volcadoPendientesTotal }} volcado</template>
          <template v-if="preliqPendientesTotal > 0"> · {{ preliqPendientesTotal }} preliq.</template>
          <template v-if="facturacionPendientesTotal > 0"> · {{ facturacionPendientesTotal }} facturas</template>
          <template v-if="produccionPendientesTotal > 0"> · {{ produccionPendientesTotal }} producción</template>
          <span v-if="basculaPendientesTotal + analisisPendientesTotal + precioPendientesTotal + boletaPendientesTotal + volcadoPendientesTotal + preliqPendientesTotal + facturacionPendientesTotal + produccionPendientesTotal === 0"> — Sin pendientes</span>
        </div>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useOfflineStore } from 'src/stores/offlineStore';
import { api } from 'src/boot/axios';
import { Notify, useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';

const $q = useQuasar();
const offlineStore = useOfflineStore();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

function irAnalisisCalidad() {
  void router.push({ path: '/produccion', query: { seccion: 'analisis', _t: Date.now() } });
}
const leftDrawerOpen = ref(false);
const isOnline = ref(window.navigator.onLine);

const verRecepcion = computed(() =>
  [
    'Recepción de Granos - Báscula',
    'Recepción de Granos - Análisis',
    'Recepción de Granos - Precio',
    'Recepción de Granos - Boleta',
    'Recepción de Granos - Volcado',
    'Recepción de Granos - Pre-liquidación',
  ].some((p) => authStore.tienePermiso(p)),
);

const verPagos = computed(
  () => authStore.tienePermiso('Pagos - Productores') || authStore.tienePermiso('Pagos - Pagos'),
);

const basculaPendientesTotal = computed(() =>
  offlineStore.colaBascula.filter(r => r._syncStatus === 'pending').length
);

const analisisPendientesTotal = computed(() =>
  offlineStore.colaAnalisis.filter(a => a._syncStatus === 'pending').length
);
const precioPendientesTotal = computed(() =>
  offlineStore.colaPrecio.filter(p => p._syncStatus === 'pending').length
);
const boletaPendientesTotal = computed(() =>
  offlineStore.colaBoleta.filter(b => b._syncStatus === 'pending').length
);
const volcadoPendientesTotal = computed(() =>
  offlineStore.colaVolcado.filter(v => v._syncStatus === 'pending').length
);
const preliqPendientesTotal = computed(() =>
  offlineStore.colaPreliquidacion.filter(p => p._syncStatus === 'pending').length
);
const facturacionPendientesTotal = computed(() =>
  offlineStore.colaFacturacion.filter(f => f._syncStatus === 'pending').length
);
const produccionPendientesTotal = computed(() =>
  offlineStore.colaProduccion.filter(p => p._syncStatus === 'pending').length
);

// --- LÓGICA DE SEDES ---
function alCambiarSede(nuevaSedeId: number) {
  authStore.setSedeActiva(nuevaSedeId);
  Notify.create({
    message: `Cambiando a: ${authStore.nombreSedeActiva}`,
    color: 'orange-8',
    icon: 'place',
    timeout: 1000,
  });
  // Opcional: router.go(0) si quieres forzar recarga total de datos
}

// --- SINCRONIZACIÓN Y OFFLINE ---
const updateStatus = async () => {
  isOnline.value = window.navigator.onLine;

  if (isOnline.value && offlineStore.colaUsuarios.length > 0) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    if (!window.navigator.onLine) return;

    Notify.create({
      group: 'sync',
      message: 'Detectada conexión. Sincronizando...',
      color: 'purple',
      icon: 'sync',
      timeout: 0,
    });

    const pendientes = [...offlineStore.colaUsuarios];
    for (const u of pendientes) {
      try {
        const datosLimpios = JSON.parse(JSON.stringify(u));
        if (u.tipoOperacion === 'UPDATE') {
          await api.put(`/api/usuarios/${u.id}`, datosLimpios);
        } else {
          delete datosLimpios.id;
          delete datosLimpios.tipoOperacion;
          delete datosLimpios.fechaLocal;
          await api.post('/api/usuarios', datosLimpios);
        }
        offlineStore.colaUsuarios.shift();
      } catch (err) {
        console.error('Fallo sincronización:', err);
        return;
      }
    }

    Notify.create({
      group: 'sync',
      type: 'positive',
      message: 'Sincronización completa',
      icon: 'done_all',
      timeout: 2500,
    });
  }

  // ── SYNC BÁSCULA ──────────────────────────────────────────────────────────────
  if (isOnline.value && offlineStore.colaBascula.length > 0) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    if (!window.navigator.onLine) return;

    // PASO 1: Sync productores pendientes primero (son dependencias de báscula)
    if (offlineStore.colaProductores.length > 0) {
      Notify.create({ type: 'info', icon: 'sync', message: 'Sincronizando productores nuevos...' });
      const productoresPendientes = [...offlineStore.colaProductores];

      for (const prod of productoresPendientes) {
        try {
          const res = await api.post('/api/catalogos/productores', {
            nombre: prod.nombre,
            telefono: prod.telefono,
            tipo_persona: prod.tipo_persona,
            atiende: prod.atiende,
          });
          // Actualizar referencias en colaBascula antes de remover
          offlineStore.resolverProductorLocalId(prod._localId, res.data.id);
          offlineStore.removerProductor(prod._localId);
        } catch (err: unknown) {
          const axiosErr = err as { response?: { data?: { message?: string } } };
          const isNetworkError = !axiosErr.response;
          if (isNetworkError) break;
          offlineStore.marcarProductorError(prod._localId, axiosErr.response?.data?.message ?? 'Error al registrar productor');
        }
      }
    }

    // PASO 2: Sync entradas de báscula
    const basculaPendientesArr = offlineStore.colaBascula.filter(r => r._syncStatus === 'pending');

    if (basculaPendientesArr.length > 0) {
      Notify.create({ type: 'info', icon: 'sync', message: `Sincronizando ${basculaPendientesArr.length} registro(s) de báscula...` });
      let exitosos = 0;
      let errores = 0;

      /**
       * Obtiene el siguiente número de ticket disponible en el servidor.
       * Se llama justo antes de cada POST para evitar colisiones entre operadores.
       */
      async function obtenerSiguienteTicket(): Promise<number> {
        const res = await api.get('/api/bascula/ultimo-ticket');
        return Number(res.data) + 1;
      }

      for (const registro of basculaPendientesArr) {
        // Si su productor está en error, saltar este registro
        if (registro._productor_localId) {
          const prodPendiente = offlineStore.colaProductores.find(p => p._localId === registro._productor_localId);
          if (prodPendiente?._syncStatus === 'error') continue;
          if (!registro.productor_id) continue; // productor aún no resuelto
        }

        // Resolver el número de ticket:
        // Si es un OFL- (guardado offline), obtener el siguiente número real del servidor.
        // Si ya tiene un número real (poco probable pero defensivo), usarlo tal cual.
        let ticketNumero: string = registro.ticket_numero;
        if (ticketNumero.startsWith('OFL-')) {
          try {
            ticketNumero = String(await obtenerSiguienteTicket());
          } catch {
            // Sin red para obtener el ticket → detener sync
            break;
          }
        }

        // Construir payload limpio (sin campos _*)
        const payload = {
          ticket_numero: ticketNumero,
          fecha_hora: registro.fecha_hora,
          productor_id: registro.productor_id,
          chofer: registro.chofer,
          placas: registro.placas,
          peso_bruto_kg: registro.peso_bruto_kg,
          grano_id: registro.grano_id,
          origen_id: registro.origen_id,
          comprador_id: registro.comprador_id,
          status: registro.status,
          datos_adicionales: registro.datos_adicionales,
          boleta_numero: null,
          usuario_registro_id: registro.usuario_registro_id,
        };

        try {
          await api.post('/api/bascula/guardar', payload);
          offlineStore.removerBascula(registro._localId);
          exitosos++;
        } catch (err: unknown) {
          const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
          const isNetworkError = !axiosErr.response;
          if (isNetworkError) break;

          // 409: colisión de ticket — el número ya fue tomado mientras sincronizábamos.
          // Reintentar UNA vez con el siguiente número disponible.
          if (axiosErr.response?.status === 409 && ticketNumero && !ticketNumero.startsWith('OFL-')) {
            try {
              const ticketReintento = String(await obtenerSiguienteTicket());
              await api.post('/api/bascula/guardar', { ...payload, ticket_numero: ticketReintento });
              offlineStore.removerBascula(registro._localId);
              exitosos++;
            } catch {
              offlineStore.marcarBasculaError(registro._localId, 'Colisión de ticket — no se pudo asignar número');
              errores++;
            }
          } else {
            offlineStore.marcarBasculaError(registro._localId, axiosErr.response?.data?.message ?? 'Error al sincronizar');
            errores++;
          }
        }
      }

      if (exitosos > 0)
        Notify.create({ type: 'positive', icon: 'done_all', message: `Báscula: ${exitosos} registro(s) sincronizados` });
      if (errores > 0)
        Notify.create({ type: 'warning', icon: 'warning', message: `Báscula: ${errores} registro(s) con error — revisa los marcados en rojo` });
    }
  }

  // ── SYNC ANÁLISIS ──────────────────────────────────────────────────────────────
  if (isOnline.value && offlineStore.colaAnalisis.length > 0) {
    const analisisPendientes = offlineStore.colaAnalisis.filter(a => a._syncStatus === 'pending');

    if (analisisPendientes.length > 0) {
      Notify.create({ type: 'info', icon: 'sync', message: `Sincronizando ${analisisPendientes.length} análisis pendiente(s)...` });
      let exitososAnal = 0;
      let erroresAnal = 0;

      for (const analisis of analisisPendientes) {
        // Construir payload limpio (sin campos _*)
        const payloadAnal = {
          bascula_id: analisis.bascula_id,
          calibre: analisis.calibre,
          humedad: analisis.humedad,
          impurezas: analisis.impurezas,
          r1_danado_insecto: analisis.r1_danado_insecto,
          r2_quebrado: analisis.r2_quebrado,
          r2_manchado: analisis.r2_manchado,
          r2_arrugado: analisis.r2_arrugado,
          analista_usuario_id: analisis.analista_usuario_id,
          grano_id: analisis.grano_id,
          observaciones: analisis.observaciones,
          datos_adicionales: analisis.datos_adicionales,
        };

        try {
          if (analisis._esActualizacion) {
            await api.put(`/api/analisis/actualizar/${analisis.bascula_id}`, payloadAnal);
          } else {
            await api.post('/api/analisis/guardar', payloadAnal);
          }
          offlineStore.removerAnalisis(analisis._localId);
          exitososAnal++;
        } catch (err: unknown) {
          const axiosErr = err as { response?: { data?: { message?: string } } };
          const isNetworkError = !axiosErr.response;
          if (isNetworkError) break;
          offlineStore.marcarAnalisisError(analisis._localId, axiosErr.response?.data?.message ?? 'Error al sincronizar análisis');
          erroresAnal++;
        }
      }

      if (exitososAnal > 0)
        Notify.create({ type: 'positive', icon: 'done_all', message: `Análisis: ${exitososAnal} registro(s) sincronizados` });
      if (erroresAnal > 0)
        Notify.create({ type: 'warning', icon: 'warning', message: `Análisis: ${erroresAnal} registro(s) con error — revisa la cola offline` });
    }
  }

  // ── SYNC PRECIO ────────────────────────────────────────────────────────────────
  const preciosPendientes = offlineStore.colaPrecio.filter(p => p._syncStatus === 'pending');
  for (const p of preciosPendientes) {
    try {
      if (p.tipo === 'autorizar') {
        await api.post('/api/precio/autorizar', {
          boletaPrecioId: p.boletaPrecioId,
          precioAutorizado: p.precioAutorizado,
          observaciones: p.observaciones ?? '',
          tipoAutorizacion: p.tipoAutorizacion,
        });
      } else {
        await api.post('/api/precio/rechazar', {
          boletaPrecioId: p.boletaPrecioId,
          motivoRechazo: p.motivoRechazo ?? 'Rechazado por el productor',
        });
      }
      offlineStore.removerPrecio(p._localId);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      if (!axiosErr.response) break;
      offlineStore.marcarPrecioError(p._localId, axiosErr.response?.data?.message ?? 'Error al sincronizar precio');
    }
  }

  // ── SYNC BOLETA ────────────────────────────────────────────────────────────────
  const boletasPendientes = offlineStore.colaBoleta.filter(b => b._syncStatus === 'pending');
  for (const b of boletasPendientes) {
    try {
      await api.post('/api/boleta/confirmar-productor',
        { boletaId: b.boletaId, acepta: b.acepta, ...(b.motivoRechazo ? { motivoRechazo: b.motivoRechazo } : {}) },
        { params: { sedeId: b.sedeId } }
      );
      offlineStore.removerBoleta(b._localId);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      if (!axiosErr.response) break;
      offlineStore.marcarBoletaError(b._localId, axiosErr.response?.data?.message ?? 'Error al sincronizar boleta');
    }
  }

  // ── SYNC VOLCADO ───────────────────────────────────────────────────────────────
  const volcadosPendientes = offlineStore.colaVolcado.filter(v => v._syncStatus === 'pending');
  for (const v of volcadosPendientes) {
    try {
      if (v.tipo === 'asignar-silo') {
        await api.post('/api/volcado/asignar-silo',
          { boletaId: v.boletaId, siloId: v.siloId ?? null, siloCalibreId: v.siloCalibreId ?? null, siloPulmonId: v.siloPulmonId ?? null, bodegaId: v.bodegaId ?? null },
          { params: { sedeId: v.sedeId } }
        );
      } else {
        await api.post('/api/volcado/rechazar',
          { boletaId: v.boletaId, motivos: v.motivos ?? '', evidencia: v.evidencia ?? null },
          { params: { sedeId: v.sedeId } }
        );
      }
      offlineStore.removerVolcado(v._localId);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      if (!axiosErr.response) break;
      offlineStore.marcarVolcadoError(v._localId, axiosErr.response?.data?.message ?? 'Error al sincronizar volcado');
    }
  }

  // ── SYNC PRE-LIQUIDACIÓN ───────────────────────────────────────────────────────
  const preliqPendientes = offlineStore.colaPreliquidacion.filter(p => p._syncStatus === 'pending');
  for (const p of preliqPendientes) {
    try {
      if (p.tipo === 'guardar') {
        await api.post('/api/preliquidacion/guardar', {
          boletaId: p.boletaId, pesoTara: p.pesoTara, pesoNeto: p.pesoNeto,
          descuento: p.descuento, kgALiquidar: p.kgALiquidar, importeTotal: p.importeTotal,
          observaciones: p.observaciones ?? '', rt: p.rt ?? '', tipoSiembra: p.tipoSiembra ?? '',
          divisiones: p.divisiones ?? null,
        });
      } else {
        await api.post('/api/preliquidacion/guardar-foto', { boletaId: p.boletaId, foto: p.foto });
      }
      offlineStore.removerPreliquidacion(p._localId);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      if (!axiosErr.response) break;
      offlineStore.marcarPreliquidacionError(p._localId, axiosErr.response?.data?.message ?? 'Error al sincronizar pre-liquidación');
    }
  }

  // ── SYNC FACTURACIÓN ───────────────────────────────────────────────────────────
  const facturacionPendientes = offlineStore.colaFacturacion.filter(f => f._syncStatus === 'pending');
  for (const f of facturacionPendientes) {
    try {
      if (f.tipo === 'actualizar-rfc') {
        await api.put('/api/facturacion/actualizar-rfc', { tickets: f.tickets, nuevoRfc: f.nuevoRfc, sedeId: f.sedeId });
      } else {
        await api.put('/api/facturacion/actualizar-documentos-status', { tickets: f.tickets, tieneDocumentos: f.tieneDocumentos, tieneFacturaXml: f.tieneFacturaXml, sedeId: f.sedeId });
      }
      offlineStore.removerFacturacion(f._localId);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      if (!axiosErr.response) break;
      offlineStore.marcarFacturacionError(f._localId, axiosErr.response?.data?.message ?? 'Error al sincronizar facturación');
    }
  }

  // ── SYNC PRODUCCIÓN ────────────────────────────────────────────────────────────
  const produccionPendientes = offlineStore.colaProduccion.filter(p => p._syncStatus === 'pending');
  if (produccionPendientes.length > 0) {
    let exitosProd = 0; let errorsProd = 0;
    for (const p of produccionPendientes) {
      try {
        if (p.tipo === 'crear-orden') {
          await api.post('/api/produccion/ordenes', p.ordenPayload, { params: { sedeId: p.sedeId } });
        } else if (p.tipo === 'actualizar-orden') {
          await api.put(`/api/produccion/ordenes/${p.ordenId}`, p.ordenPayload, { params: { sedeId: p.sedeId } });
        } else {
          await api.post('/api/produccion/resultado', p.resultadoPayload);
        }
        offlineStore.removerProduccion(p._localId);
        exitosProd++;
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        if (!axiosErr.response) break;
        offlineStore.marcarProduccionError(p._localId, axiosErr.response?.data?.message ?? 'Error al sincronizar producción');
        errorsProd++;
      }
    }
    if (exitosProd > 0) Notify.create({ type: 'positive', icon: 'done_all', message: `Producción: ${exitosProd} registro(s) sincronizados` });
    if (errorsProd > 0) Notify.create({ type: 'warning', icon: 'warning', message: `Producción: ${errorsProd} registro(s) con error` });
  }
};

watch(isOnline, (nuevoEstado) => {
  if (nuevoEstado) void updateStatus();
});

const syncWrapper = () => {
  isOnline.value = window.navigator.onLine;
};

onMounted(async () => {
  window.addEventListener('online', syncWrapper);
  window.addEventListener('offline', syncWrapper);

  // Al montar, si ya hay usuario pero no hay sedes en el store, cargarlas
  if (authStore.isLoggedIn && authStore.listaSedes.length === 0) {
    await authStore.cargarSedes();
  }

  if (isOnline.value) void updateStatus();
});

onBeforeUnmount(() => {
  window.removeEventListener('online', syncWrapper);
  window.removeEventListener('offline', syncWrapper);
});

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

async function handleLogout() {
  const totalPendientes = offlineStore.colaBascula.filter(r => r._syncStatus === 'pending').length
    + offlineStore.colaProductores.filter(p => p._syncStatus === 'pending').length
    + offlineStore.colaAnalisis.filter(a => a._syncStatus === 'pending').length
    + offlineStore.colaPrecio.filter(p => p._syncStatus === 'pending').length
    + offlineStore.colaBoleta.filter(b => b._syncStatus === 'pending').length
    + offlineStore.colaVolcado.filter(v => v._syncStatus === 'pending').length
    + offlineStore.colaPreliquidacion.filter(p => p._syncStatus === 'pending').length
    + offlineStore.colaFacturacion.filter(f => f._syncStatus === 'pending').length
    + offlineStore.colaProduccion.filter(p => p._syncStatus === 'pending').length;

  if (totalPendientes > 0) {
    $q.dialog({
      title: 'Registros sin sincronizar',
      message: `Tienes ${totalPendientes} registro(s) guardados sin conexión. Si cierras sesión se perderán. ¿Deseas continuar?`,
      cancel: { label: 'Cancelar', flat: true },
      ok: { label: 'Cerrar sesión de todas formas', color: 'negative' },
    }).onOk(() => {
      offlineStore.$reset();
      authStore.logout();
      void router.push('/login');
    });
    return;
  }
  authStore.logout();
  await router.push('/login');
}
</script>

<style scoped>
.menu-item-active {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ff9800 !important; /* Color naranja para el activo */
  border-right: 4px solid #ff9800;
}
.text-menu-inactive {
  color: #e0e0e0;
}
.sub-menu-item {
  font-size: 0.9em;
  min-height: 40px;
}
</style>
