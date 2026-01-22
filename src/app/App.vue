<template>
  <!-- LOGIN -->
  <div v-if="!isLoggedIn" class="bg-grey-2" style="min-height: 100vh">
    <q-header elevated class="bg-orange-5 text-white">
      <q-toolbar>
        <q-toolbar-title>
          <div class="row items-center q-gutter-sm">
            <q-img :src="alazanLogo" style="height: 32px; width: auto" fit="contain" />
          </div>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <div class="row items-center justify-center q-pa-md" style="min-height: calc(100vh - 56px)">
      <q-card class="q-pa-lg" style="width: 420px; max-width: 95vw">
        <div class="row justify-center q-mb-lg">
          <q-img :src="alazanLogo" style="height: 80px; width: auto" fit="contain" />
        </div>

        <div class="text-h6 text-grey-8 text-center q-mb-md">Iniciar Sesión</div>

        <q-form @submit.prevent="handleLogin">
          <q-input
            v-model="loginData.email"
            type="email"
            label="Correo Electrónico"
            outlined
            dense
            class="q-mb-md"
            required
          />
          <q-input
            v-model="loginData.password"
            type="password"
            label="Contraseña"
            outlined
            dense
            class="q-mb-lg"
            required
          />
          <q-btn type="submit" color="orange-5" unelevated class="full-width" label="Ingresar" />
        </q-form>
      </q-card>
    </div>
  </div>

  <!-- APP -->
  <q-layout v-else view="hHh Lpr lff">
    <!-- HEADER -->
    <q-header elevated class="bg-orange-5 text-white">
      <q-toolbar>
        <q-btn flat round icon="menu" @click="drawerOpen = !drawerOpen" />

        <q-toolbar-title>
          <div class="row items-center q-gutter-sm">
            <q-img :src="alazanLogo" style="height: 32px; width: auto" fit="contain" />
          </div>
        </q-toolbar-title>

        <q-space />

        <q-btn flat round icon="person" @click="showUserMenu = !showUserMenu" />
        <q-btn flat round icon="settings" @click="showConfiguracion = true" />

        <q-btn
          dense
          unelevated
          color="orange-7"
          class="q-ml-sm"
          label="🗄️ BD"
          title="Gestión de Base de Datos"
          @click="showGestionBD = true"
        />

        <!-- menú usuario (simple) -->
        <q-menu v-model="showUserMenu" anchor="bottom right" self="top right">
          <q-list style="min-width: 260px">
            <q-item>
              <q-item-section>
                <div class="text-caption text-grey-6">Correo</div>
                <div class="text-body2">{{ loginData.email }}</div>
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup @click="handleLogout">
              <q-item-section class="text-negative">Cerrar Sesión</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-toolbar>
    </q-header>

    <!-- SIDEBAR -->
    <q-drawer
      v-model="drawerOpen"
      show-if-above
      bordered
      class="bg-indigo-10 text-white"
      :width="220"
    >
      <q-list separator>
        <q-item-label header class="text-white">Menú</q-item-label>

        <template v-for="item in menuItems" :key="item">
          <q-item
            clickable
            :active="isMenuActive(item)"
            active-class="bg-white text-indigo-10"
            @click="onClickMainMenu(item)"
          >
            <q-item-section>{{ item }}</q-item-section>
          </q-item>

          <!-- Submenu Recepción -->
          <q-slide-transition>
            <div
              v-if="item === 'Recepción de Granos' && showAdminRecepcionMenu"
              class="bg-indigo-9"
            >
              <q-item
                v-for="sub in adminRecepcionSubItems"
                :key="sub"
                clickable
                class="q-pl-lg"
                :active="activeMenu === sub"
                active-class="bg-white text-indigo-10"
                @click="onClickSubMenu(sub)"
              >
                <q-item-section>{{ sub }}</q-item-section>
              </q-item>
            </div>
          </q-slide-transition>

          <!-- Submenu Pagos -->
          <q-slide-transition>
            <div v-if="item === 'Pagos' && showPagosMenu" class="bg-indigo-9">
              <q-item
                v-for="sub in pagosSubItems"
                :key="sub"
                clickable
                class="q-pl-lg"
                :active="activeMenu === sub"
                active-class="bg-white text-indigo-10"
                @click="activeMenu = sub"
              >
                <q-item-section>{{ sub }}</q-item-section>
              </q-item>
            </div>
          </q-slide-transition>
        </template>
      </q-list>
    </q-drawer>

    <!-- CONTENT -->
    <q-page-container class="bg-grey-2">
      <!-- Configuración -->
      <q-page v-if="showConfiguracion" class="q-pa-md">
        <div class="row items-center q-gutter-sm q-mb-md">
          <q-btn flat round icon="arrow_back" @click="showConfiguracion = false" />
          <div class="text-h5 text-grey-8">Configuración del Sistema</div>
        </div>

        <q-card bordered flat>
          <q-tabs
            v-model="activeConfigTab"
            dense
            class="text-grey-8"
            active-color="orange-7"
            indicator-color="orange-7"
            align="left"
            narrow-indicator
          >
            <q-tab v-for="t in configTabs" :key="t" :name="t" :label="t" />
          </q-tabs>

          <q-separator />

          <q-card-section>
            <ParametrosGenerales v-if="activeConfigTab === 'Parámetros Generales'" />

            <ReglasPrecio
              v-else-if="activeConfigTab === 'Reglas de Precio'"
              v-model:precioBaseUSD="precioBaseUSD"
              v-model:tipoCambioFIX="tipoCambioFIX"
              v-model:fechaFIX="fechaFIX"
              v-model:urlTipoCambio="urlTipoCambio"
              v-model:tablaCalibre="tablaCalibre"
              v-model:tablaPrecio="tablaPrecio"
              v-model:tablaExportacion="tablaExportacion"
            />

            <ConfigRecepcionGranos
              v-else-if="activeConfigTab === 'Recepción de Granos'"
              v-model:catalogoOrigenes="catalogoOrigenes"
              v-model:catalogoCompradores="catalogoCompradores"
              v-model:catalogoGranos="catalogoProductos"
              v-model:camposBascula="camposBascula"
            />

            <ConfiguracionRecepcionFacturas
              v-else-if="activeConfigTab === 'Recepción de Facturas'"
            />
            <ConfiguracionPagos v-else-if="activeConfigTab === 'Pagos'" />

            <div v-else-if="activeConfigTab === 'Bitácoras'">
              <div class="text-h6 q-mb-sm">📝 Configuración de Bitácoras</div>
              <div class="text-grey-7 q-mb-md">Contenido pendiente de implementar</div>
              <q-banner class="bg-yellow-2 text-yellow-10" rounded>⚠️ Contenido pendiente</q-banner>
            </div>

            <div v-else-if="activeConfigTab === 'Consultas'">
              <div class="text-h6 q-mb-sm">🔎 Configuración de Consultas</div>
              <div class="text-grey-7 q-mb-md">Contenido pendiente de implementar</div>
              <q-banner class="bg-yellow-2 text-yellow-10" rounded>⚠️ Contenido pendiente</q-banner>
            </div>
          </q-card-section>
        </q-card>
      </q-page>

      <!-- Principal -->
      <q-page v-else class="q-pa-md">
        <!-- INICIO -->
        <div
          v-if="activeMenu === 'Inicio'"
          class="row items-center justify-center"
          style="min-height: 70vh"
        >
          <q-img :src="alazanLogo" style="max-width: 420px; width: 90%" fit="contain" />
        </div>

        <!-- BÁSCULA -->
        <BasculaScreen
          v-else-if="activeMenu === 'Báscula'"
          :registros="registrosBascula"
          :campos-config="camposBascula"
          :lista-productores="listaProductores"
          :catalogo-origenes="catalogoOrigenes"
          :catalogo-compradores="catalogoCompradores"
          :catalogo-granos="catalogoProductos"
          @back="activeMenu = 'Recepción de Granos'"
          @guardar-registro="(r: any) => registrosBascula.push(r)"
          @nuevo-registro="onNuevoRegistroBascula"
          @ver-detalle="onVerDetalleBascula"
        />

        <!-- ANÁLISIS -->
        <AnalisisScreen
          v-else-if="activeMenu === 'Análisis'"
          :registros-bascula="registrosBascula"
          :calibres-disponibles="tablaCalibre.map((c) => c.calibre)"
          :granos-disponibles="catalogoProductos"
          @guardar-analisis="onGuardarAnalisis"
        />

        <!-- PRECIO -->
        <PrecioScreen
          v-else-if="activeMenu === 'Precio'"
          :boletas-precios="boletasPrecios"
          :tick-tiempo="tickTiempo"
          :tiempo-autorizacion-automatica="tiempoAutorizacionAutomatica"
          @seleccionar-boleta="onSeleccionarBoletaPrecio"
        />

        <!-- BOLETA -->
        <BoletaFlow
          v-else-if="activeMenu === 'Boleta' && !showRenegociar"
          v-model:boleta-step="boletaStep"
          v-model:boleta-data="boletaData"
          v-model:boletas-precios="boletasPrecios"
          :precio-base-usd="precioBaseUSD"
          :tipo-cambio-fix="tipoCambioFIX"
          :tabla-calibre="tablaCalibre"
          @set-active-menu="(m: string) => (activeMenu = m)"
          @set-precio-aceptado="(v: boolean | null) => (precioAceptado = v)"
          @solicitar-renegociacion="
            (registro: any) => {
              showRenegociar = true;
              registroRenegociar = registro;
            }
          "
        />

        <RenegociarPrecio
          v-else-if="activeMenu === 'Boleta' && showRenegociar"
          :registro="registroRenegociar"
          :precios-disponibles="
            calcularPreciosDisponibles(registroRenegociar?.calibre || calibreSeleccionado)
          "
          @autorizar="onAutorizarRenegociacion"
          @rechazar="onRechazarRenegociacion"
          @back="showRenegociar = false"
        />

        <!-- VOLCADO -->
        <VolcadoFlow
          v-else-if="activeMenu === 'Volcado'"
          :boletas-precios="boletasPrecios"
          :silos-pulmon="silosPulmon"
          v-model:boletas-con-silo="boletasConSilo"
          @back="activeMenu = 'Recepción de Granos'"
          @enviar-a-pagos="onEnviarAPagos"
        />

        <!-- PRELIQ -->
        <PreliquidacionFlow
          v-else-if="activeMenu === 'Pre-liquidación'"
          :boletas-con-silo="boletasConSilo"
          :boletas-precios="boletasPrecios"
          :registros-bascula="registrosBascula"
          @back="activeMenu = 'Recepción de Granos'"
          @update-peso-neto="handleUpdatePesoNeto"
        />

        <!-- FACTURAS -->
        <RecepcionFacturasFlow
          v-else-if="activeMenu === 'Recepción de Facturas'"
          :boletas-precios="boletasPrecios"
          :registros-bascula="registrosBascula"
          @back="activeMenu = 'Inicio'"
          @navigate-to-pagos="onNavigateToPagos"
          @update-rfc="handleUpdateRfc"
          @update-documentos-status="handleUpdateDocumentosStatus"
        />

        <!-- PAGOS -->
        <PagosProductoresFlow
          v-else-if="activeMenu === 'Productores'"
          :tickets-pendientes="ticketsPagos"
          :sede-actual="sedeActual"
          :tope-diario="topeDiarioActual"
          @back="activeMenu = 'Pagos'"
        />

        <PagosSedeFlow
          v-else-if="activeMenu === 'Sede'"
          :topes-pagos-sede="topesPagosSede"
          @back="activeMenu = 'Pagos'"
        />

        <!-- OTROS -->
        <div v-else class="row items-center justify-center" style="min-height: 70vh">
          <div class="text-center">
            <div class="text-h4 text-grey-8 q-mb-sm">{{ activeMenu }}</div>
            <div class="text-grey-6">Contenido en construcción</div>
          </div>
        </div>
      </q-page>
    </q-page-container>

    <!-- MODAL BD -->
    <q-dialog v-model="showGestionBD">
      <q-card style="width: 980px; max-width: 95vw">
        <q-card-section class="row items-center">
          <div class="text-h6">Gestión de Base de Datos</div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section>
          <GestionBD @close="showGestionBD = false" />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- MODAL PRECIO DETALLE: lo dejo como TODO porque en React era muy largo -->
    <q-dialog v-model="showPrecioDetalle" maximized>
      <q-card>
        <q-card-section class="row items-center bg-orange-5 text-white">
          <div class="text-h6">Autorización de Precio</div>
          <q-space />
          <q-btn flat round icon="close" v-close-popup @click="selectedBoleta = null" />
        </q-card-section>
        <q-separator />
        <q-card-section>
          <!-- Aquí migras el modal grande de React a Quasar (QTable/QCard/QInput/QBtn).
               Por ahora: placeholder para no romper el flujo -->
          <q-banner class="bg-yellow-2 text-yellow-10" rounded>
            ⚠️ Pendiente migrar el modal detallado de autorización de precio (estaba inline en
            App.tsx). Ya tienes la selección en <strong>selectedBoleta</strong> y el cálculo de
            precios disponible.
          </q-banner>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup lang="ts">
import axios from 'axios';
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { Notify } from 'quasar';

/**
 * Assets
 * En React venían de figma:asset. En Vue debes colocar los PNG en /src/assets/ y ajustar el import.
 */
import alazanLogo from '@/assets/alazanLogo.png'; // ajusta esta ruta real

/**
 * Componentes (deben existir como .vue).
 * Si todavía no los convertiste, crea placeholders para compilar.
 */
import { BoletaFlow } from './app/components/BoletaFlow';
import { RenegociarPrecio } from './app/components/RenegociarPrecio';
import { VolcadoFlow } from './app/components/VolcadoFlow';
import { PreliquidacionFlow } from './app/components/PreliquidacionFlow';
import { BasculaScreen } from './app/components/BasculaScreen';
import { RecepcionFacturasFlow } from './app/components/RecepcionFacturasFlow';
import { PagosProductoresFlow } from './app/components/PagosFlow';
import { PagosSedeFlow } from './app/components/PagosSedeFlow';
import { ConfigRecepcionGranos } from './app/components/ConfigRecepcionGranos';
import { GestionBD } from './app/components/GestionBD';
import { ParametrosGenerales } from './app/components/ParametrosGenerales';
import { PrecioScreen } from './app/components/PrecioScreen';
import { AnalisisScreen } from './app/components/AnalisisScreen';
import { ReglasPrecio } from './app/components/ReglasPrecio';
import { ConfiguracionRecepcionFacturas } from './app/components/ConfiguracionRecepcionFacturas';
import { ConfiguracionPagos } from './app/components/ConfiguracionPagos';

type TabPrecio = 'autorizar' | 'renegociar';
type BoletaStep = 'preliminar' | 'confirmacion' | 'final' | null;

const isLoggedIn = ref(false);
const showUserMenu = ref(false);
const showAdminRecepcionMenu = ref(false);
const showPagosMenu = ref(false);
const showConfiguracion = ref(false);
const activeConfigTab = ref('Parámetros Generales');

const drawerOpen = ref(true);

const currentRegistroIndex = ref(0);
const analisisSaved = ref(false);
const uploadedPhotos = ref<string[]>([]);

const showPrecioDetalle = ref(false);
const selectedBoleta = ref<any>(null);
const selectedPrecio = ref('');
const justificacion = ref('');
const precioTab = ref<TabPrecio>('autorizar');

const boletaStep = ref<BoletaStep>(null);
const precioAceptado = ref<boolean | null>(null);
const showRenegociar = ref(false);
const registroRenegociar = ref<any>(null);

const showGestionBD = ref(false);
const ticketsPagos = ref<string[]>([]);

const topesPagosSede = ref([
  { id: 1, sede: 'Navojoa', topeDiario: 5000000, activo: true },
  { id: 2, sede: 'Hermosillo', topeDiario: 3000000, activo: true },
  { id: 3, sede: 'Guaymas', topeDiario: 2000000, activo: true },
]);
const sedeActual = ref('Navojoa');
const topeDiarioActual = computed(
  () => topesPagosSede.value.find((t) => t.sede === sedeActual.value)?.topeDiario || 5000000,
);

// Reglas precio
const precioBaseUSD = ref('1200.00');
const tipoCambioFIX = ref('20.50');
const fechaFIX = ref('2025-01-15');
const calibreSeleccionado = ref('44-46');
const urlTipoCambio = ref('https://api.exchangerate-api.com/v4/latest/USD');

const api = axios.create({
  baseURL: 'http://localhost:5183/api',
});

const useSQL = ref(true);

const cargarTicketsDesdeSQL = async () => {
  try {
    const response = await api.get('/bascula/pendientes');
    registrosBascula.value = response.data;
    console.log('✅ Datos cargados desde SQL Server');
  } catch (error) {
    console.error('❌ Error al conectar con C#, usando datos de prueba:', error);
    // Aquí podrías cargar datos de prueba si la API falla
  }
};

onMounted(() => {
  if (useSQL.value) {
    cargarTicketsDesdeSQL();
  }
});

const silosPulmon = ref<string[]>([
  'Silo Pulmón TL1 - Tren de Limpia 1',
  'Silo Pulmón TL2 - Tren de Limpia 2',
  'Silo Pulmón TL3 - Tren de Limpia 3',
]);

const boletasConSilo = ref<
  Array<{
    noBoleta: string;
    siloAsignado: string;
    tipoSilo: 'normal' | 'pulmon';
    fechaAsignacion: string;
  }>
>([]);

// Config campos báscula (persistencia localStorage)
const camposBascula = ref<
  Record<string, { habilitado: boolean; nombre: string; obligatorio: boolean; orden: number }>
>(
  (() => {
    const saved = localStorage.getItem('camposBasculaConfig');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      ticket: { habilitado: true, nombre: 'No. Ticket', obligatorio: true, orden: 1 },
      fechaHora: { habilitado: true, nombre: 'Fecha y Hora', obligatorio: true, orden: 2 },
      grano: { habilitado: true, nombre: 'Grano', obligatorio: true, orden: 3 },
      productor: { habilitado: true, nombre: 'Productor', obligatorio: true, orden: 4 },
      tProductor: { habilitado: true, nombre: 'T. Productor', obligatorio: false, orden: 5 },
      atienda: { habilitado: true, nombre: 'Atiende', obligatorio: false, orden: 6 },
      celular: { habilitado: true, nombre: 'Celular', obligatorio: false, orden: 7 },
      origen: { habilitado: true, nombre: 'Origen', obligatorio: false, orden: 8 },
      chofer: { habilitado: true, nombre: 'Chofer', obligatorio: false, orden: 9 },
      placas: { habilitado: true, nombre: 'Placas', obligatorio: false, orden: 10 },
      tonAprox: { habilitado: true, nombre: 'Ton. Aprox', obligatorio: false, orden: 11 },
      has: { habilitado: false, nombre: 'HAS', obligatorio: false, orden: 12 },
      comprador: { habilitado: true, nombre: 'Comprador', obligatorio: false, orden: 13 },
      observaciones: { habilitado: false, nombre: 'Observaciones', obligatorio: false, orden: 14 },
      pesoBruto: { habilitado: true, nombre: 'Peso Bruto', obligatorio: true, orden: 15 },
    };
  })(),
);

watch(
  camposBascula,
  (v) => {
    localStorage.setItem('camposBasculaConfig', JSON.stringify(v));
  },
  { deep: true },
);

// Tablas (editables)
const tablaCalibre = ref([
  { codigo: 'DC1', calibre: '44.01-46.00', descuento: 0 },
  { codigo: 'DC2', calibre: '46.01-48.00', descuento: 500 },
  { codigo: 'DC3', calibre: '48.01-50.00', descuento: 2000 },
  { codigo: 'DC4', calibre: '50.01-52.00', descuento: 3000 },
  { codigo: 'DC5', calibre: '52.01-54.00', descuento: 3500 },
]);

const tablaPrecio = ref([
  { codigo: 'DP1', descuento: 0 },
  { codigo: 'DP2', descuento: 200 },
  { codigo: 'DP3', descuento: 700 },
  { codigo: 'DP4', descuento: 150 },
  { codigo: 'DP5', descuento: 1550 },
]);

const catalogoOrigenes = ref([
  'Mocorito',
  'Est. Naranjo',
  'La Noría Moc',
  'Puebla',
  'Guamúchil',
  'Salvador Alvarado',
]);
const catalogoCompradores = ref(['Abelardo', 'Edgar', 'Roberto', 'Carlos']);
const catalogoProductos = ref(['Garbanzo', 'Frijol']);

const tablaExportacion = ref<Array<any>>([
  { nivel: 'P1', porcentaje: 80, descuento: 'DP1', precioTope: 'SÍ', vigente: 'SÍ' },
  { nivel: 'P2', porcentaje: 79, descuento: 'DP2', precioTope: 'NO', vigente: 'SÍ' },
  { nivel: 'P3', porcentaje: 78, descuento: 'DP2', precioTope: 'NO', vigente: 'SÍ' },
  { nivel: 'P4', porcentaje: 77, descuento: 'DP2', precioTope: 'NO', vigente: 'SÍ' },
  { nivel: 'P5', porcentaje: 76, descuento: 'DP2', precioTope: 'NO', vigente: 'SÍ' },
  { nivel: 'P6', porcentaje: 75, descuento: 'DP2', precioTope: 'NO', vigente: 'SÍ' },
  { nivel: 'P7', porcentaje: 74, descuento: 'DP3', precioTope: 'NO', vigente: 'SÍ' },
  { nivel: 'P8', porcentaje: 73, descuento: 'DP2', precioTope: 'NO', vigente: 'SÍ' },
  { nivel: 'P9', porcentaje: 72, descuento: 'DP2', precioTope: 'NO', vigente: 'SÍ' },
  { nivel: 'P10', porcentaje: 71, descuento: 'DP2', precioTope: 'NO', vigente: 'SÍ' },
  { nivel: 'P11', porcentaje: 70, descuento: 'DP4', precioTope: 'NO', vigente: 'SÍ' },
  { nivel: 'P12', porcentaje: 69, descuento: 'DP4', precioTope: 'NO', vigente: 'SÍ' },
  { nivel: 'P13', porcentaje: 68, descuento: 'DP4', precioTope: 'NO', vigente: 'SÍ' },
  { nivel: 'P14', porcentaje: 67, descuento: 'DP4', precioTope: 'NO', vigente: 'SÍ' },
  { nivel: 'P15', porcentaje: 66, descuento: 'DP4', precioTope: 'NO', vigente: 'SÍ' },
  { nivel: 'P16', porcentaje: 65, descuento: 'DP4', precioTope: 'NO', vigente: 'SÍ' },
  { nivel: 'P17', porcentaje: 64, descuento: 'DP4', precioTope: 'NO', vigente: 'SÍ' },
  { nivel: 'P18', porcentaje: 63, descuento: 'DP4', precioTope: 'NO', vigente: 'SÍ' },
  { nivel: 'P19', porcentaje: 62, descuento: 'DP4', precioTope: 'NO', vigente: 'SÍ' },
  { nivel: 'P20', porcentaje: 61, descuento: 'DP4', precioTope: 'NO', vigente: 'SÍ' },
  { nivel: 'P21', porcentaje: 60, descuento: 'DP4', precioTope: 'NO', vigente: 'SÍ' },
  { nivel: 'P22', porcentaje: 59, descuento: 'DP5', precioTope: 'NO', vigente: 'SÍ' },
  { nivel: 'P23', porcentaje: 58, descuento: 'DP1', precioTope: 'NO', vigente: 'SÍ' },
  { nivel: 'P24', porcentaje: 57, descuento: 'DP1', precioTope: 'NO', vigente: 'SÍ' },
  { nivel: 'P25', porcentaje: 56, descuento: 'DP1', precioTope: 'NO', vigente: 'SÍ' },
  { nivel: 'P26', porcentaje: 55, descuento: 'DP1', precioTope: 'NO', vigente: 'SÍ' },
  { nivel: 'P27', porcentaje: '<54', descuento: 'DP1', precioTope: 'NO', vigente: 'SÍ' },
]);

const nextBoletaNumber = ref(1000);

const tiempoAutorizacionAutomatica = ref(4);
const tickTiempo = ref(0);

const boletaData = ref<any>({
  folio: '',
  productor: '',
  telefono: '',
  comprador: '',
  origen: '',
  fechaHora: '',
  tProductor: '',
  descuento: '',
  humedad: '',
  producto: '',
  precio: '',
  denominacion: '',
  cosecha: '',
  totalGranos: '',
  exportacion: '',
  calidadB2: '',
});

const rolesPermisos = ref<any[]>([
  {
    id: 1,
    puesto: 'Gerente',
    rol: 'Admin',
    menus: [
      'Báscula Recepción',
      'Recepción de Granos',
      'Facturación',
      'Pagos',
      'Producción',
      'Bodega',
      'Instrucciones de Embarque',
      'Bitácoras',
      'Consultas',
    ],
  },
  {
    id: 2,
    puesto: 'Supervisor',
    rol: 'Supervisor',
    menus: ['Báscula Recepción', 'Recepción de Granos', 'Producción', 'Bodega', 'Bitácoras'],
  },
  {
    id: 3,
    puesto: 'Operador',
    rol: 'Operativo',
    menus: ['Báscula Recepción', 'Recepción de Granos', 'Producción'],
  },
]);

const loginData = reactive({ email: '', password: '' });
const activeMenu = ref('Inicio');

const registrosBascula = ref<any[]>([]);
const boletasPrecios = ref<any[]>([]);

const listaProductores = ref<any[]>([]);

onMounted(async () => {
  const res = await api.get('/catalogos/productores');
  listaProductores.value = res.data;
});

/** Cálculos de precio (misma lógica base) */
function obtenerDescuentoPorCalibre(calibre: string) {
  const item = tablaCalibre.value.find((c) => c.calibre === calibre);
  return item ? item.descuento : 0;
}

function getPrecioBaseNumerico() {
  const usd = parseFloat(String(precioBaseUSD.value).replace(/,/g, ''));
  const tc = parseFloat(String(tipoCambioFIX.value).replace(/,/g, ''));
  if (!isNaN(usd) && !isNaN(tc) && usd > 0 && tc > 0) return usd * tc;
  return 0;
}

function calcularPrecioAutomatico(exportacion: number, calibre: string) {
  const precioBase = getPrecioBaseNumerico();
  const descuentoCalibre = obtenerDescuentoPorCalibre(calibre) || 0;

  let nivelPrecioEncontrado = tablaExportacion.value[0];
  let indicePrecio = 0;

  for (let i = 0; i < tablaExportacion.value.length; i++) {
    if (exportacion >= tablaExportacion.value[i].porcentaje) {
      nivelPrecioEncontrado = tablaExportacion.value[i];
      indicePrecio = i;
      break;
    }
  }

  let precioTonelada = precioBase - descuentoCalibre;

  for (let i = 0; i <= indicePrecio; i++) {
    const codigoDescuento = tablaExportacion.value[i].descuento;
    const descuentoNivel =
      tablaPrecio.value.find((dp) => dp.codigo === codigoDescuento)?.descuento || 0;
    precioTonelada -= descuentoNivel;
  }

  const precioKilo = precioTonelada / 1000;

  return {
    precioSugerido: precioKilo.toFixed(2),
    precioSugeridoCodigo: nivelPrecioEncontrado.nivel,
    descuento: 0,
  };
}

function calcularPreciosDisponibles(calibreBoleta: string = '44-46') {
  const precioBase = getPrecioBaseNumerico();
  const descuentoCalibre = obtenerDescuentoPorCalibre(calibreBoleta) || 0;

  let precioAcumulado = precioBase - descuentoCalibre;

  return tablaExportacion.value.map((fila, index) => {
    const descuentoNivel =
      tablaPrecio.value.find((dp) => dp.codigo === fila.descuento)?.descuento || 0;
    precioAcumulado -= descuentoNivel;
    const precioKilo = precioAcumulado / 1000;
    return { codigo: fila.nivel, valor: precioKilo };
  });
}

/** Menús */
const menuItems = [
  'Inicio',
  'Recepción de Granos',
  'Recepción de Facturas',
  'Pagos',
  'Producción',
  'Bodega',
  'Instrucciones de Embarque',
  'Bitácoras',
  'Consultas',
];
const adminRecepcionSubItems = [
  'Báscula',
  'Análisis',
  'Precio',
  'Boleta',
  'Volcado',
  'Pre-liquidación',
];
const pagosSubItems = ['Productores', 'Sede'];
const configTabs = [
  'Parámetros Generales',
  'Reglas de Precio',
  'Recepción de Granos',
  'Recepción de Facturas',
  'Pagos',
  'Bitácoras',
  'Consultas',
];

function isMenuActive(item: string) {
  if (activeMenu.value === item) return true;
  if (item === 'Recepción de Granos' && adminRecepcionSubItems.includes(activeMenu.value))
    return true;
  if (item === 'Pagos' && pagosSubItems.includes(activeMenu.value)) return true;
  return false;
}

function onClickMainMenu(item: string) {
  if (item === 'Recepción de Granos') {
    showAdminRecepcionMenu.value = !showAdminRecepcionMenu.value;
    showPagosMenu.value = false;
    return;
  }
  if (item === 'Pagos') {
    showPagosMenu.value = !showPagosMenu.value;
    showAdminRecepcionMenu.value = false;
    return;
  }
  activeMenu.value = item;
  showAdminRecepcionMenu.value = false;
  showPagosMenu.value = false;
}

function onClickSubMenu(sub: string) {
  activeMenu.value = sub;
}

/** Auto-expand submenús */
watch(activeMenu, (m) => {
  if (adminRecepcionSubItems.includes(m)) showAdminRecepcionMenu.value = true;
  if (pagosSubItems.includes(m)) showPagosMenu.value = true;
});

/** Login */
function handleLogin() {
  // aquí conectas auth real
  isLoggedIn.value = true;
  Notify.create({ type: 'positive', message: 'Sesión iniciada' });
}

function handleLogout() {
  isLoggedIn.value = false;
  showUserMenu.value = false;
  loginData.email = '';
  loginData.password = '';
}

/** Timers (equivalentes a useEffect intervals) */
let intervalAutoAuth: any = null;
let intervalTick: any = null;

watch(tiempoAutorizacionAutomatica, () => {
  // no hace nada extra; el intervalo usa el valor actual
});

watch(activeMenu, (m) => {
  if (m === 'Precio') {
    if (intervalTick) clearInterval(intervalTick);
    intervalTick = setInterval(() => tickTiempo.value++, 1000);
  } else {
    if (intervalTick) clearInterval(intervalTick);
    intervalTick = null;
  }
});

onMounted(() => {
  intervalAutoAuth = setInterval(() => {
    const ahora = Date.now();
    const limite = tiempoAutorizacionAutomatica.value * 60 * 1000;

    boletasPrecios.value = boletasPrecios.value.map((b) => {
      if (
        b?.origenBoleta === 'analisis' &&
        b?.estatus === 'Pendiente por Autorizar' &&
        b?.fechaCreacion &&
        ahora - b.fechaCreacion >= limite
      ) {
        return { ...b, estatus: 'Autorizado CC' };
      }
      return b;
    });
  }, 30000);
});

onBeforeUnmount(() => {
  if (intervalAutoAuth) clearInterval(intervalAutoAuth);
  if (intervalTick) clearInterval(intervalTick);
});

/** Handlers: Báscula */
function onNuevoRegistroBascula() {
  // en tu TSX: setBasculaConectada(true); setModoManual(false); setShowBasculaForm(true);
  Notify.create({ type: 'info', message: 'Nuevo registro (báscula)' });
}

function onVerDetalleBascula(registro: any) {
  const registroConAnalisis = boletasPrecios.value.find((b) => b.ticket === registro.ticket);

  if (!registroConAnalisis) {
    Notify.create({
      type: 'warning',
      message: `No tiene No. Boleta (falta análisis). Ticket: ${registro.ticket}`,
    });
    return;
  }
  if (registroConAnalisis.estatus === 'Pendiente por Autorizar') {
    Notify.create({
      type: 'info',
      message: `Análisis completo. Falta precio. Ticket: ${registro.ticket}`,
    });
    return;
  }
  if (
    registroConAnalisis.estatus === 'Autorizado CC' &&
    (!registro.boleta || registro.boleta === '-')
  ) {
    Notify.create({
      type: 'info',
      message: `Precio autorizado. Generar boleta preliminar. Ticket: ${registro.ticket}`,
    });
    return;
  }
  Notify.create({ type: 'positive', message: `Registro: ${registro.ticket}` });
}

/** Handlers: Análisis */
function onGuardarAnalisis(data: any) {
  const precioCalculado = calcularPrecioAutomatico(data.exportacion, data.calibre);
  const pesoNeto = data.pesoBruto - data.tara;
  const tonsAprox = parseFloat((pesoNeto / 1000).toFixed(2));

  const noBoleta = String(nextBoletaNumber.value);
  nextBoletaNumber.value++;

  const nuevaBoleta = {
    noBoleta,
    fecha: new Date().toLocaleDateString('es-MX'),
    comprador: data.comprador || 'Pendiente',
    tonsAprox,
    descuento: data.impurezas ? parseFloat((data.impurezas * 10).toFixed(2)) : 0,
    precioSugerido: parseFloat(precioCalculado.precioSugerido),
    precioSugeridoCodigo: precioCalculado.precioSugeridoCodigo,
    estatus: 'Pendiente por Autorizar',
    ticket: data.ticket,
    productor: data.productor,
    telefono: data.telefono,
    origen: data.origen,
    calibre: data.calibre,
    humedad: data.humedad,
    exportacion: data.exportacion,
    totalDanos: data.totalDanos,
    impurezas: data.impurezas,
    r1: data.r1,
    sumaR2: data.sumaR2,
    pesoBruto: data.pesoBruto,
    tara: data.tara,
    chofer: data.chofer || '',
    placas: data.placas || '',
    fechaCreacion: Date.now(),
    tiempoRegistro: new Date(),
    origenBoleta: 'analisis',
    fotos: data.fotos || [],
    cafesLisos: data.cafesLisos || 0,
    manchados: data.manchados || 0,
    quebMxc: data.quebMxc || 0,
    helados: data.helados || 0,
    alimonados: data.alimonados || 0,
    revolcados: data.revolcados || 0,
    r2: data.r2 || 0,
    tProductor: data.tProductor || 'N/A',
  };

  boletasPrecios.value.push(nuevaBoleta);

  // asignar boleta a registro de báscula
  registrosBascula.value = registrosBascula.value.map((reg) =>
    reg.ticket === data.ticket ? { ...reg, boleta: noBoleta } : reg,
  );

  Notify.create({
    type: 'positive',
    message: `Boleta ${noBoleta} creada (Precio sugerido: ${precioCalculado.precioSugeridoCodigo})`,
  });
}

/** Handlers: Precio */
function onSeleccionarBoletaPrecio(boleta: any) {
  selectedBoleta.value = boleta;
  showPrecioDetalle.value = true;
  selectedPrecio.value = boleta?.precioSugeridoCodigo || '';
  justificacion.value = '';
}

/** Handlers: Volcado / Pagos */
function onEnviarAPagos(tickets: string[]) {
  ticketsPagos.value.push(...tickets);
  showPagosMenu.value = true;
  activeMenu.value = 'Productores';
}

function onNavigateToPagos(tickets: string[]) {
  ticketsPagos.value.push(...tickets);
  showPagosMenu.value = true;
  activeMenu.value = 'Productores';
}

/** Renegociación */
function onAutorizarRenegociacion(nuevoPrecio: string, justi: string) {
  Notify.create({
    type: 'positive',
    message: `Precio ${nuevoPrecio} autorizado. ${justi ? 'Con justificación.' : ''}`,
  });
  showRenegociar.value = false;
  activeMenu.value = 'Boleta';
}

function onRechazarRenegociacion() {
  Notify.create({ type: 'warning', message: 'Registro rechazado' });
  showRenegociar.value = false;
  activeMenu.value = 'Recepción de Granos';
}

/** Updates “simulados” (en TSX estaban como handlers) */
async function handleUpdatePesoNeto(ticket: string, pesoNeto: string) {
  registrosBascula.value = registrosBascula.value.map((r) =>
    r.ticket === ticket ? { ...r, pesoNeto } : r,
  );
}

function handleUpdateRfc(tickets: string[], nuevoRfc: string) {
  boletasPrecios.value = boletasPrecios.value.map((b) =>
    tickets.includes(b.ticket) ? { ...b, rfc: nuevoRfc } : b,
  );
}

function handleUpdateDocumentosStatus(
  tickets: string[],
  tieneDocumentos: boolean,
  tieneFacturaXML: boolean,
) {
  boletasPrecios.value = boletasPrecios.value.map((b) =>
    tickets.includes(b.ticket) ? { ...b, tieneDocumentos, tieneFacturaXML } : b,
  );
}
</script>

<style scoped>
/* Opcional: puedes migrar aquí estilos globales si ocupas */
</style>
