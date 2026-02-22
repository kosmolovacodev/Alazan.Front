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
          v-if="authStore.tienePermiso('Recepción de Granos')"
          icon="scale"
          label="Recepción de Granos"
          header-class="text-menu-inactive"
          expand-icon-class="text-white"
          default-opened
        >
          <q-list class="q-pl-sm">
            <q-item
              clickable
              to="/bascula"
              active-class="menu-item-active"
              class="text-menu-inactive sub-menu-item"
            >
              <q-item-section>Báscula</q-item-section>
            </q-item>
            <q-item
              clickable
              to="/analisis"
              active-class="menu-item-active"
              class="text-menu-inactive sub-menu-item"
            >
              <q-item-section>Análisis</q-item-section>
            </q-item>
            <q-item
              clickable
              to="/precio"
              active-class="menu-item-active"
              class="text-menu-inactive sub-menu-item"
            >
              <q-item-section>Precio</q-item-section>
            </q-item>
            <q-item
              clickable
              to="/boleta"
              active-class="menu-item-active"
              class="text-menu-inactive sub-menu-item"
            >
              <q-item-section>Boleta</q-item-section>
            </q-item>
            <q-item
              clickable
              to="/volcado"
              active-class="menu-item-active"
              class="text-menu-inactive sub-menu-item"
            >
              <q-item-section>Volcado</q-item-section>
            </q-item>
            <q-item
              clickable
              to="/preliquidacion"
              active-class="menu-item-active"
              class="text-menu-inactive sub-menu-item"
            >
              <q-item-section>Pre-liquidación</q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>
        <q-item
          v-if="authStore.tienePermiso('Facturación')"
          clickable
          to="/facturas"
          active-class="menu-item-active"
          class="text-menu-inactive"
        >
          <q-item-section avatar><q-icon name="receipt_long" /></q-item-section>
          <q-item-section>Recepción de Facturas</q-item-section>
        </q-item>

        <q-expansion-item
          v-if="authStore.tienePermiso('Pagos')"
          icon="payments"
          label="Pagos"
          header-class="text-menu-inactive"
          expand-icon-class="text-white"
        >
          <q-list class="q-pl-sm">
            <q-item
              clickable
              to="/productores"
              active-class="menu-item-active"
              class="text-menu-inactive sub-menu-item"
            >
              <q-item-section>Productores</q-item-section>
            </q-item>
            <q-item
              clickable
              to="/sede"
              active-class="menu-item-active"
              class="text-menu-inactive sub-menu-item"
            >
              <q-item-section>Sede</q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>

        <q-item
          v-if="authStore.tienePermiso('Producción')"
          clickable
          to="/produccion"
          active-class="menu-item-active"
          class="text-menu-inactive"
        >
          <q-item-section avatar><q-icon name="precision_manufacturing" /></q-item-section>
          <q-item-section>Producción</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer v-if="!isOnline" class="bg-red-10 text-white">
      <q-toolbar dense>
        <q-icon name="cloud_off" class="q-mr-sm" />
        <div class="text-weight-bold">MODO SIN CONEXIÓN - Los cambios se guardarán localmente</div>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useOfflineStore } from 'src/stores/offlineStore';
import { api } from 'src/boot/axios';
import { Notify } from 'quasar';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';

const offlineStore = useOfflineStore();
const router = useRouter();
const authStore = useAuthStore();
const leftDrawerOpen = ref(false);
const isOnline = ref(window.navigator.onLine);

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
