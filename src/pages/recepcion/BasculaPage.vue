<template>
  <q-page padding class="bg-grey-2">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 text-grey-8 text-weight-bold">
        <q-icon name="scale" class="q-mr-sm" size="md" />
        Báscula - Recepción de Granos
      </div>

      <q-btn
        color="primary"
        unelevated
        icon="filter_alt"
        :label="mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'"
        @click="mostrarFiltros = !mostrarFiltros"
      >
        <q-icon
          :name="mostrarFiltros ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
          class="q-ml-sm"
        />
      </q-btn>
    </div>

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card bordered flat class="bg-blue-1 border-blue">
          <q-card-section>
            <div class="text-caption text-blue-9 text-weight-medium">Total del Día</div>
            <div class="text-h4 text-weight-bold text-blue-9">{{ registrosBascula.length }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card bordered flat class="bg-green-1 border-green">
          <q-card-section>
            <div class="text-caption text-green-9 text-weight-medium">Con Peso Neto</div>
            <div class="text-h4 text-weight-bold text-green-9">{{ conPesoNeto }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card bordered flat class="bg-yellow-1 border-yellow">
          <q-card-section>
            <div class="text-caption text-amber-9 text-weight-medium">Sin Peso Neto</div>
            <div class="text-h4 text-weight-bold text-amber-9">{{ sinPesoNeto }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card bordered flat class="bg-purple-1 border-purple">
          <q-card-section>
            <div class="text-caption text-purple-9 text-weight-medium">Total Toneladas</div>
            <div class="text-h4 text-weight-bold text-purple-9">{{ totalToneladas }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-card v-show="mostrarFiltros" bordered flat class="q-pa-md q-mb-md shadow-1 border-grey">
      <div class="text-subtitle2 q-mb-md text-grey-8 text-center text-uppercase">
        Filtros de Búsqueda
      </div>

      <div class="row q-col-gutter-md q-mb-sm">
        <div class="col-12 col-md-2">
          <q-input v-model="filtros.ticket" outlined dense label="Captura Ticket" clearable />
        </div>
        <div class="col-12 col-md-2">
          <q-input v-model="filtros.boleta" outlined dense label="Captura Boleta" clearable />
        </div>
        <div class="col-12 col-md-2">
          <q-input v-model="filtros.origen" outlined dense label="Captura Origen" clearable />
        </div>
        <div class="col-12 col-md-3">
          <q-input v-model="filtros.productor" outlined dense label="Captura Productor" clearable />
        </div>
        <div class="col-12 col-md-3">
          <q-input v-model="filtros.comprador" outlined dense label="Captura Comprador" clearable />
        </div>
      </div>

      <div class="row q-col-gutter-md items-center">
        <div class="col-auto">
          <q-checkbox v-model="filtros.hoy" label="Hoy" color="primary" />
        </div>
        <div class="col-12 col-md-6 row items-center q-gutter-sm">
          <span class="text-grey-7">Rango:</span>
          <q-input
            v-model="filtros.fechaInicio"
            outlined
            dense
            type="date"
            label="Inicio"
            class="col"
          />
          <span class="text-grey-7">al</span>
          <q-input v-model="filtros.fechaFin" outlined dense type="date" label="Fin" class="col" />
        </div>
        <div class="col row justify-end">
          <q-btn
            color="positive"
            unelevated
            icon="description"
            label="Exportar Excel"
            @click="exportarExcel"
          />
        </div>
      </div>
    </q-card>

    <q-banner v-if="basculaPendientes > 0 && !isOnline" class="bg-orange-1 text-orange-9 q-mb-md" rounded>
      <template #avatar><q-icon name="wifi_off" color="orange" /></template>
      {{ basculaPendientes }} registro(s) guardados sin conexión. Se sincronizarán al recuperar red.
    </q-banner>

    <q-banner v-if="basculaErrores > 0" class="bg-red-1 text-red-9 q-mb-md" rounded>
      <template #avatar><q-icon name="error" color="red" /></template>
      {{ basculaErrores }} registro(s) no pudieron sincronizarse. Revisa los marcados en rojo.
    </q-banner>

    <!-- Con rowsPerPage : 0 quita la paginación -->
    <q-card bordered flat class="shadow-1 border-grey">
      <q-table
        :rows="registrosFiltrados"
        :columns="columns"
        row-key="id"
        flat
        :pagination="{ rowsPerPage: 0 }"
        :loading="loading"
        :row-class="(row: any) => {
          if (row._esOffline && row._syncStatus === 'error') return 'bg-red-1'
          if (row._esOffline) return 'bg-orange-1'
          return ''
        }"
      >
        <template v-slot:body-cell-idx="props">
          <q-td :props="props" class="text-grey-7">
            {{ props.rowIndex + 1 }}
          </q-td>
        </template>

        <template v-slot:body-cell-ticket="props">
          <q-td :props="props">
            {{ props.value }}
            <q-badge v-if="props.row._esOffline && props.row._syncStatus === 'pending'"
              color="orange" label="OFFLINE" class="q-ml-xs" />
            <q-badge v-if="props.row._esOffline && props.row._syncStatus === 'error'"
              color="red" label="ERROR" class="q-ml-xs" />
          </q-td>
        </template>

        <template v-slot:body-cell-pesoNeto="props">
          <q-td :props="props" class="text-weight-bold">
            <q-badge
              :color="props.value > 0 ? 'green-1' : 'yellow-1'"
              :text-color="props.value > 0 ? 'green-9' : 'amber-9'"
            >
              {{ props.value > 0 ? props.value.toLocaleString() + ' kg' : 'Pendiente' }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn
              flat
              round
              dense
              icon="visibility"
              color="grey-8"
              @click="verDetalle(props.row)"
            />
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width row flex-center q-pa-xl text-grey-6">
            <q-icon name="scale" size="md" class="q-mr-sm" />
            No hay registros. Haz clic en el botón <strong>+</strong> para crear uno.
          </div>
        </template>
      </q-table>
    </q-card>

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="black" @click="handleNuevoRegistro" />
    </q-page-sticky>

    <q-dialog v-model="showFormulario" persistent maximized>
      <BasculaFormulario
        :ultimoTicket="ultimoTicket + 1"
        :catalogoGranos="catalogoGranos"
        :catalogoOrigenes="catalogoOrigenes"
        :catalogoCompradores="catalogoCompradores"
        :catalogoChoferes="catalogoChoferes"
        :listaProductores="listaProductores"
        :ultimoGranoId="ultimoGranoId"
        :campos-config="camposBasculaConfig"
        :isOnline="isOnline"
        @save="handleGuardarRegistro"
        @close="showFormulario = false"
        @refresh-productores="cargarProductores"
      />
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, reactive, watch } from 'vue';
import { api } from 'src/boot/axios';
import { Notify, useQuasar, exportFile } from 'quasar';
import type { QTableProps } from 'quasar';
import BasculaFormulario from './BasculaFormulario.vue';
import { useAuthStore } from 'src/stores/auth';
import { useOfflineStore } from 'src/stores/offlineStore';
import type { RegistroBasculaPendiente } from 'src/stores/offlineStore';

const $q = useQuasar();
const offlineStore = useOfflineStore();
const isOnline = ref(window.navigator.onLine);

// --- INTERFACES ---
interface RegistroBascula {
  id?: number | string;
  ticket: number | string;
  ticket_numero?: number | string;
  status: string; // 'PENDIENTE', 'ANALIZADO', etc.
  boleta?: string | null;
  fecha: string;
  fecha_hora?: string;
  origen_nombre: string;
  productor: string;
  comprador: string;
  pesoNeto?: number;
  pesoBruto: number;
  peso_bruto_kg?: number;
  datos_adicionales?: string;
  humedad?: number;
  impurezas?: number;
  r1_danado_insecto?: number;
  r2_arrugado?: number;
  r2_manchado?: number;
  r2_quebrado?: number;
  calibre?: string;
  usuario_registro_id?: number | null;
  productor_id?: number | null;
  grano_id?: number | null;
  origen_id?: number | null;
  comprador_id?: string | null;
  chofer?: string;
  placas?: string;
  // Campos offline metadata (opcionales)
  _esOffline?: boolean;
  _syncStatus?: 'pending' | 'error';
  _syncError?: string;
}

interface DatosCalidad {
  impurezas?: number | string;
  r1_danado_insecto?: number | string;
  r2_arrugado?: number | string;
  r2_manchado?: number | string;
  r2_quebrado?: number | string;
}

// --- ESTADO ---
const registrosBascula = ref<RegistroBascula[]>([]);
const catalogoGranos = ref([]);
const showFormulario = ref(false);
const mostrarFiltros = ref(true);
const loading = ref(false);

const catalogoOrigenes = ref([]);
const catalogoCompradores = ref([]);
const catalogoChoferes = ref<{ chofer: string; placas: string }[]>([]);
const ultimoGranoId = ref<number | null>(null);
const listaProductores = ref<
  { id: number; nombre: string; telefono: string; telefono2?: string; atiende?: string; rfc?: string; correo?: string; origen: 'LOCAL'; origenDb?: string }[]
>([]);

// Configuración de campos por pantalla (BASCULA)
interface CampoConfig {
  id: number;
  pantalla: string;
  claveCampo: string;
  nombreMostrar: string;
  orden: number;
  visible: boolean;
  obligatorio: boolean;
  esSistema: boolean;
}
const camposBasculaConfig = ref<CampoConfig[]>([]);

const cargarCamposConfig = async () => {
  try {
    const { data } = await api.get('/api/configuracion-recepcion');
    if (data.campos) {
      camposBasculaConfig.value = (data.campos as CampoConfig[])
        .filter((c: CampoConfig) => c.pantalla === 'BASCULA')
        .map((c: CampoConfig) => ({ ...c, visible: !!c.visible, obligatorio: !!c.obligatorio }));
    }
  } catch (error) {
    console.error('Error al cargar configuración de campos:', error);
  }
};

const cargarProductores = async () => {
  try {
    const sedeId = authStore.sedeActivaId ?? 0;
    const { data } = await api.get('/api/catalogos/productores', {
      params: { sedeId, page: 1, pageSize: 10000 },
    });
    const items = data.items ?? data;
    listaProductores.value = (items as Record<string, unknown>[]).map((p) => ({
      id: p['id'] as number,
      nombre: (p['nombre'] as string) ?? '',
      telefono: (p['telefono'] as string) ?? '',
      ...(p['telefono2'] ? { telefono2: p['telefono2'] as string } : {}),
      ...(p['atiende']   ? { atiende:   p['atiende']   as string } : {}),
      ...(p['rfc']       ? { rfc:       p['rfc']       as string } : {}),
      ...(p['correo']    ? { correo:    p['correo']    as string } : {}),
      origen: 'LOCAL' as const,
      ...(p['origen']    ? { origenDb:  p['origen']   as string } : {}),
    }));
  } catch {
    console.error('Error al cargar lista de productores');
  }
};

const cargarCatalogosPrincipales = async () => {
  try {
    const [resOri, resComp] = await Promise.all([
      api.get('/api/catalogos/origenes'),
      api.get('/api/catalogos/compradores'),
    ]);
    catalogoOrigenes.value = resOri.data;
    catalogoCompradores.value = resComp.data;
  } catch {
    console.error('Error cargando catálogos secundarios');
  }
};

const ultimoTicket = ref(0);

const filtros = reactive({
  ticket: '',
  boleta: '',
  origen: '',
  productor: '',
  comprador: '',
  hoy: false,
  fechaInicio: '',
  fechaFin: '',
  buscar: '',
});

// --- PROPIEDADES COMPUTADAS ---

// Mapear registros offline al shape de la tabla del servidor
const registrosOfflineMapeados = computed(() =>
  offlineStore.colaBascula
    .filter(r => r.sede_id === authStore.sedeActivaId)
    .map(r => ({
      id: r._localId,
      ticket: r.ticket_numero,
      fecha: r.fecha_hora,
      productor: r._productor_nombre,
      comprador: r._comprador_nombre,
      origen_nombre: r._origen_nombre,
      grano: r._grano_nombre,
      pesoBruto: r.peso_bruto_kg,
      pesoNeto: 0,
      status: r.status,
      boleta: null,
      _esOffline: true,
      _syncStatus: r._syncStatus,
      _syncError: r._syncError,
    }))
);

// Unir: offline primero (al tope), luego del servidor
const registrosCombinados = computed(() => [
  ...registrosOfflineMapeados.value,
  ...registrosBascula.value,
]);

const basculaPendientes = computed(() =>
  offlineStore.colaBascula.filter(r => r.sede_id === authStore.sedeActivaId && r._syncStatus === 'pending').length
);
const basculaErrores = computed(() =>
  offlineStore.colaBascula.filter(r => r.sede_id === authStore.sedeActivaId && r._syncStatus === 'error').length
);

const registrosFiltrados = computed(() => {
  let lista = registrosCombinados.value;

  if (filtros.buscar) {
    const busqueda = filtros.buscar.toLowerCase();
    lista = lista.filter(
      (r) => r.ticket.toString().includes(busqueda) || r.productor.toLowerCase().includes(busqueda),
    );
  }

  if (filtros.ticket) {
    lista = lista.filter((r) => r.ticket.toString().includes(filtros.ticket));
  }

  if (filtros.boleta) {
    lista = lista.filter((r) => r.boleta?.toString().includes(filtros.boleta));
  }

  if (filtros.origen) {
    lista = lista.filter((r) => r.origen_nombre?.toLowerCase().includes(filtros.origen.toLowerCase()));
  }

  if (filtros.productor) {
    lista = lista.filter((r) => r.productor?.toLowerCase().includes(filtros.productor.toLowerCase()));
  }

  if (filtros.comprador) {
    lista = lista.filter((r) => r.comprador?.toLowerCase().includes(filtros.comprador.toLowerCase()));
  }

  if (filtros.hoy) {
    const hoy = new Date().toLocaleDateString();
    lista = lista.filter((r) => new Date(r.fecha).toLocaleDateString() === hoy);
  } else if (filtros.fechaInicio || filtros.fechaFin) {
    const inicio = filtros.fechaInicio ? new Date(filtros.fechaInicio) : null;
    const fin = filtros.fechaFin ? new Date(filtros.fechaFin + 'T23:59:59') : null;
    lista = lista.filter((r) => {
      const fechaReg = new Date(r.fecha);
      if (inicio && fechaReg < inicio) return false;
      if (fin && fechaReg > fin) return false;
      return true;
    });
  }

  return lista;
});

const conPesoNeto = computed(
  () => registrosBascula.value.filter((r) => r.pesoNeto && r.pesoNeto > 0).length,
);

const sinPesoNeto = computed(
  () => registrosBascula.value.filter((r) => !r.pesoNeto || r.pesoNeto === 0).length,
);

const totalToneladas = computed(() => {
  // Basado en peso_bruto según tu lógica actual
  const totalKg = registrosBascula.value.reduce((sum, r) => sum + (r.pesoBruto || 0), 0);
  return (totalKg / 1000).toFixed(2);
});

// --- CONFIGURACIÓN DE COLUMNAS ---
const columns: QTableProps['columns'] = [
  { name: 'idx', label: '#', field: 'id', align: 'left' },
  { name: 'ticket', label: 'No. Ticket', field: 'ticket', align: 'left', sortable: true },
  {
    name: 'boleta',
    label: 'No. Boleta',
    field: (row: RegistroBascula) => row.boleta || '-',
    align: 'left',
  },
  {
    name: 'fecha',
    label: 'Fecha',
    field: (row: RegistroBascula) => new Date(row.fecha).toLocaleDateString(),
    align: 'left',
  },
  { name: 'origen', label: 'Origen (Municipio)', field: 'origen_nombre', align: 'left' },
  { name: 'productor', label: 'Productor', field: 'productor', align: 'left' },
  { name: 'comprador', label: 'Comprador', field: 'comprador', align: 'left' },
  {
    name: 'pesoNeto',
    label: 'Peso Neto',
    field: (row: RegistroBascula) => row.pesoNeto || 0,
    align: 'right',
  },
  { name: 'acciones', label: '', field: 'id', align: 'center' },
];

// --- MÉTODOS ---

const cargarDatos = async () => {
  if (!isOnline.value) return;
  loading.value = true;
  try {
    const [resRegistros, resGranos, resTicket, resChoferes, resUltimoGrano] = await Promise.all([
      api.get('/api/bascula/registros'),
      api.get('/api/catalogos/granos'),
      api.get('/api/bascula/ultimo-ticket'),
      api.get('/api/bascula/choferes'),
      api.get('/api/bascula/ultimo-grano'),
    ]);
    registrosBascula.value = resRegistros.data;
    catalogoGranos.value = resGranos.data;
    ultimoTicket.value = resTicket.data;
    catalogoChoferes.value = resChoferes.data;
    ultimoGranoId.value = resUltimoGrano.data?.granoId ?? null;
  } catch {
    Notify.create({ type: 'negative', message: 'Error al cargar datos de báscula' });
  } finally {
    loading.value = false;
  }
};

const _onlineHandler = () => {
  isOnline.value = true;
  // Recargar datos del servidor al recuperar red
  void cargarDatos();
};
const _offlineHandler = () => { isOnline.value = false; };

onMounted(async () => {
  window.addEventListener('online', _onlineHandler);
  window.addEventListener('offline', _offlineHandler);
  await cargarDatos();
  await cargarCatalogosPrincipales();
  await cargarCamposConfig();
  await cargarProductores();
});

onBeforeUnmount(() => {
  window.removeEventListener('online', _onlineHandler);
  window.removeEventListener('offline', _offlineHandler);
});

// Watcher para recargar datos cuando cambia la sede activa (multisede)
const authStore = useAuthStore();
watch(
  () => authStore.sedeActivaId,
  async (nuevaSedeId, sedeAnterior) => {
    if (nuevaSedeId !== sedeAnterior && sedeAnterior !== undefined) {
      await cargarDatos();
      Notify.create({
        type: 'info',
        message: `Datos actualizados para: ${authStore.nombreSedeActiva}`,
        position: 'top',
      });
    }
  },
);

async function handleGuardarRegistro(nuevoRegistro: RegistroBascula & { _productor_nombre?: string; _productor_localId?: string }) {
  if (!window.navigator.onLine) {
    // Ticket temporal con prefijo OFL- — el sync lo reemplaza con el número real del servidor
    const ticketTemporal = 'OFL-' + Date.now();
    const pendiente: RegistroBasculaPendiente = {
      ticket_numero: ticketTemporal,
      fecha_hora: nuevoRegistro.fecha_hora ?? new Date().toISOString(),
      productor_id: nuevoRegistro.productor_id ?? null,
      chofer: nuevoRegistro.chofer ?? '',
      placas: nuevoRegistro.placas ?? '',
      peso_bruto_kg: nuevoRegistro.pesoBruto ?? nuevoRegistro.peso_bruto_kg ?? 0,
      grano_id: nuevoRegistro.grano_id ?? null,
      origen_id: nuevoRegistro.origen_id ?? null,
      comprador_id: nuevoRegistro.comprador_id ?? null,
      status: nuevoRegistro.status ?? 'PENDIENTE',
      datos_adicionales: nuevoRegistro.datos_adicionales ?? '',
      boleta_numero: null,
      usuario_registro_id: nuevoRegistro.usuario_registro_id ?? null,
      sede_id: authStore.sedeActivaId ?? 0,
      _localId: 'LOCAL_BASC_' + Date.now(),
      _syncStatus: 'pending',
      _fechaLocal: new Date().toISOString(),
      ...(nuevoRegistro._productor_localId ? { _productor_localId: nuevoRegistro._productor_localId } : {}),
      _productor_nombre: nuevoRegistro._productor_nombre ?? '',
      _origen_nombre: (catalogoOrigenes.value as { id: number; municipio: string }[]).find(o => o.id === nuevoRegistro.origen_id)?.municipio ?? '',
      _comprador_nombre: (catalogoCompradores.value as { id: string; nombre: string }[]).find(c => c.id === nuevoRegistro.comprador_id)?.nombre ?? '',
      _grano_nombre: (catalogoGranos.value as { id: number; nombre: string }[]).find(g => g.id === nuevoRegistro.grano_id)?.nombre ?? '',
    };
    offlineStore.agregarBascula(pendiente);
    showFormulario.value = false;
    Notify.create({ type: 'warning', icon: 'cloud_off', message: `Guardado sin red — ID temporal: ${ticketTemporal}` });
    return;
  }

  $q.loading.show({ message: 'Procesando registro...' });
  try {
    await api.post('/api/bascula/guardar', nuevoRegistro);
    await cargarDatos();
    showFormulario.value = false;
    Notify.create({ type: 'positive', message: '¡Ticket generado correctamente!' });
  } catch {
    Notify.create({ type: 'negative', message: 'Error al guardar el registro' });
  } finally {
    $q.loading.hide();
  }
}

function handleNuevoRegistro() {
  showFormulario.value = true;
}

function verDetalle(registro: RegistroBascula) {
  // Listo para hacer Analisis
  if (registro.status === 'PENDIENTE') {
    $q.dialog({
      title: '<span class="text-warning">⚠️ Esperando Análisis</span>',
      html: true,
      message: `
        <div class="q-py-sm">
          El ticket <b>#${registro.ticket}</b> aún no cuenta con registro de análisis técnicos.
          <br><br>
          Estatus: <span class="text-weight-bold text-orange">Esperando análisis.</span>
        </div>
      `,
      ok: { color: 'primary', label: 'Entendido', flat: true },
    });
    return;
  }

  //Listo para Autorizar Precio
  if (registro.status === 'ANALIZADO') {
    $q.dialog({
      title: '<span class="text-info">🔬 Análisis Completado</span>',
      html: true,
      message: `El análisis del ticket <b>#${registro.ticket}</b> ya fue registrado.<br><br>Estatus: <b>Esperando autorización de precio.</b>`,
      ok: { color: 'info', label: 'Ver Resultados' },
    }).onOk(() => {
      // <--- Quitamos el async de aquí
      if (typeof registro.id === 'number') {
        // Llamamos a la función y manejamos la promesa con .catch
        // Esto evita que .onOk reciba una promesa directamente
        mostrarResultadosTecnicos(registro.id).catch((err) => {
          console.error('Error al mostrar resultados:', err);
        });
      } else {
        $q.notify({
          type: 'negative',
          message: 'Error: El ID del registro no es válido.',
        });
      }
    });
    return;
  }

  // Listo para Aceptar Precio
  if (registro.status === 'AUTORIZADO') {
    $q.dialog({
      title: '<span class="text-primary">📄 Precio Autorizado</span>',
      html: true,
      message: `El precio ha sido asignado. Ya puede generar la boleta preliminar.<br><br>Ticket: <b>#${registro.ticket}</b>`,
    });
    return;
  }

  // Listo para Hacer Volcado
  if (registro.status === 'LISTO_VOLCADO') {
    $q.dialog({
      title: '<span class="text-primary">📄 Precio Aceptado</span>',
      html: true,
      message: `Precio fue aceptado, listo para hacer volcado.<br><br>Ticket: <b>#${registro.ticket}</b>`,
    });
    return;
  }

  // Listo para Hacer Pre-liquidación
  if (registro.status === 'VOLCADO') {
    $q.dialog({
      title: '<span class="text-primary">📄 Volcado fue Aceptado</span>',
      html: true,
      message: `Volcado fue aceptado, listo para hacer pre-liquidación.<br><br>Ticket: <b>#${registro.ticket}</b>`,
    });
    return;
  }

  // Volcado Rechazado
  if (registro.status === 'RECHAZADO') {
    $q.dialog({
      title: '<span class="text-primary">❌ Volcado fue Rechazado</span>',
      html: true,
      message: `😥Favor de revisar los motivos y evidencia<br><br>Ticket: <b>#${registro.ticket}</b>`,
    });
    return;
  }

  if (registro.status === 'BOLETA RECHAZADA') {
    $q.dialog({
      title: '<span class="text-primary">❌ Boleta fue Rechazada</span>',
      html: true,
      message: `😥Favor de revisar los motivos y evidencia<br><br>Ticket: <b>#${registro.ticket}</b>`,
    });
    return;
  }

  // Flujo finalizado
  if (registro.status === 'FINALIZADO') {
    $q.dialog({
      title: '<span class="text-primary">✅ Registro Completo</span>',
      html: true,
      message: `<br><b>Ticket:#${registro.ticket}<br>Boleta: ${registro.boleta}<br>Productor: ${registro.productor}<br>Peso Bruto: ${registro.pesoBruto} kg<br>Peso Neto: ${registro.pesoNeto} kg<br><br>El registro ha completado el flujo.<b>`,
    });
    return;
  }
}

/**
 * Muestra el modal informativo con los resultados del laboratorio.
 */
async function mostrarResultadosTecnicos(basculaId: number) {
  $q.loading.show({ message: 'Obteniendo informe completo...' });

  try {
    const response = await api.get(`/api/analisis/detalles/${basculaId}`);
    const r = response.data;

    const extra: {
      cafes_lisos: number;
      helados: number;
      alimonados: number;
      revolcados: number;
      exportacion: number;
      fotos: string[]; // <--- Importante: string[] en lugar de []
    } = {
      cafes_lisos: 0,
      helados: 0,
      alimonados: 0,
      revolcados: 0,
      exportacion: 0,
      fotos: [],
    };

    if (r.datos_adicionales) {
      try {
        const parsed = JSON.parse(r.datos_adicionales);
        // Asignamos los valores al objeto extra
        Object.assign(extra, parsed);
      } catch (e) {
        console.error('Error al procesar datos adicionales', e);
      }
    }

    // Cálculos de R2 (Suma de los campos específicos)
    const sumaR2 =
      Number(r.r2_arrugado || 0) + Number(r.r2_manchado || 0) + Number(r.r2_quebrado || 0);

    $q.dialog({
      title: `<div class="text-h6 text-primary row items-center">
                <q-icon name="analytics" class="q-mr-sm" />
                Informe de Calidad - Ticket #${r.ticket_numero}
              </div>`,
      html: true,
      style: 'width: 900px; max-width: 95vw;',
      message: `
        <div class="q-pa-none">
          <div class="bg-grey-2 q-pa-md rounded-borders row q-col-gutter-sm q-mb-md">
            <div class="col-6 col-sm-3"><strong>Fecha:</strong><br>${new Date(r.fecha).toLocaleString()}</div>
            <div class="col-6 col-sm-3"><strong>Ticket:</strong><br>#${r.ticket_numero}</div>
            <div class="col-6 col-sm-3"><strong>Chofer:</strong><br>${r.chofer || 'N/A'}</div>
            <div class="col-6 col-sm-3"><strong>Placas:</strong><br>${r.placas || 'N/A'}</div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-4">
              <div class="text-subtitle2 text-black-9 q-mb-xs">ANÁLISIS BASE</div>
              <q-list dense bordered separator>
                <q-item><q-item-section>Calibre: </q-item-section><q-item-section side class="text-bold">${r.calibre}</q-item-section></q-item>
                <q-item><q-item-section>Humedad: </q-item-section><q-item-section side class="text-bold">${r.humedad}%</q-item-section></q-item>
                <q-item><q-item-section>Impurezas: </q-item-section><q-item-section side>${r.impurezas}%</q-item-section></q-item>
                <q-item class="bg-blue-1"><q-item-section>Exportación: </q-item-section><q-item-section side class="text-blue-10 text-bold">${extra.exportacion}%</q-item-section></q-item>
              </q-list>
            </div>

            <div class="col-12 col-sm-4">
              <div class="text-subtitle2 text-black-9 q-mb-xs">DETALLE DE DAÑOS</div>
              <q-list dense bordered separator>
                <q-item><q-item-section>R1 (Insecto): </q-item-section><q-item-section side>${r.r1_danado_insecto}%</q-item-section></q-item>
                <q-item><q-item-section>R2 (Arrugado): </q-item-section><q-item-section side>${r.r2_arrugado}%</q-item-section></q-item>
                <q-item><q-item-section>R2 (Manchado):</q-item-section><q-item-section side>${r.r2_manchado}%</q-item-section></q-item>
                <q-item><q-item-section>R2 (Queb/Mxc): </q-item-section><q-item-section side>${r.r2_quebrado}%</q-item-section></q-item>
                <q-item class="bg-orange-1"><q-item-section class="text-bold">Suma R2: </q-item-section><q-item-section side class="text-bold">${sumaR2.toFixed(2)}%</q-item-section></q-item>
              </q-list>
            </div>

            <div class="col-12 col-sm-4">
              <div class="text-subtitle2 text-black-9 q-mb-xs">OTROS PARÁMETROS</div>
              <q-list dense bordered separator>
                <q-item><q-item-section>Cafés y Lisos: </q-item-section><q-item-section side>${extra.cafes_lisos}%</q-item-section></q-item>
                <q-item><q-item-section>Helados: </q-item-section><q-item-section side>${extra.helados}%</q-item-section></q-item>
                <q-item><q-item-section>Alimonados: </q-item-section><q-item-section side>${extra.alimonados}%</q-item-section></q-item>
                <q-item><q-item-section>Revolcados: </q-item-section><q-item-section side>${extra.revolcados}%</q-item-section></q-item>
                <q-item class="bg-red-1"><q-item-section class="text-bold text-red-9">Total Daños: </q-item-section><q-item-section side class="text-bold text-red-9">${calcularTotal(r)}%</q-item-section></q-item>
              </q-list>
            </div>
          </div>

          <div class="text-subtitle2 q-mt-lg q-mb-sm text-grey-8 row items-center">
            <q-icon name="photo_camera" class="q-mr-xs" /> Evidencia Fotográfica
          </div>
          <div class="row q-col-gutter-sm">
            ${
              extra.fotos.length > 0
                ? extra.fotos
                    .map(
                      (f: string, idx: number) => `  <div class="col-4 col-sm-2">
                    <img src="${f}"
                        style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px; border: 1px solid #ddd; cursor: pointer;"
                        onclick="verImagenAmpliada('${f}', ${idx + 1}, ${extra.fotos.length})">
                  </div>`,
                    )
                    .join('')
                : '<div class="col-12 text-center text-grey-6 q-pa-md border-dashed rounded-borders">Sin fotos en el registro</div>'
            }
          </div>
        </div>
      `,
      ok: { label: 'Cerrar Informe', color: 'primary', unelevated: true },
    });
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar el informe detallado.' });
  } finally {
    $q.loading.hide();
  }
}

// Función global para ver imagen ampliada (llamada desde el HTML del diálogo)
declare global {
  interface Window {
    verImagenAmpliada: (url: string, numero: number, total: number) => void;
  }
}

window.verImagenAmpliada = (url: string, numero: number, total: number) => {
  $q.dialog({
    title: `Foto ${numero} de ${total}`,
    message: `<div style="text-align: center;">
                <img src="${url}" style="max-width: 100%; max-height: 70vh; border-radius: 8px;" />
              </div>`,
    html: true,
    fullWidth: true,
    ok: { label: 'Cerrar', color: 'primary', flat: true },
  });
};

// Función auxiliar con tipado correcto para evitar el 'any'
function calcularTotal(r: DatosCalidad): string {
  const suma =
    Number(r.impurezas || 0) +
    Number(r.r1_danado_insecto || 0) +
    Number(r.r2_arrugado || 0) +
    Number(r.r2_manchado || 0) +
    Number(r.r2_quebrado || 0);

  return suma.toFixed(2);
}

function exportarExcel() {
  $q.notify({ type: 'info', icon: 'download', message: 'Preparando descarga de Excel...' });

  // 1. Encabezados
  const header = [
    '#',
    'No. Ticket',
    'No. Boleta',
    'Fecha',
    'Origen',
    'Productor',
    'Comprador',
    'Peso Neto (kg)',
  ];

  // 2. Mapeo de datos convirtiendo todo a String explícitamente
  const rows = registrosFiltrados.value.map((row) => [
    String(row.id ?? ''),
    String(row.ticket),
    String(row.boleta || '-'),
    new Date(row.fecha).toLocaleDateString(),
    String(row.origen_nombre || ''),
    String(row.productor || ''),
    String(row.comprador || ''),
    String(row.pesoNeto || 0),
  ]);

  // 3. Unir encabezados con filas
  const contentArray = [header, ...rows];

  // 4. Convertir a CSV plano
  // Usamos una función para limpiar comas internas en los textos y evitar romper el CSV
  const csvContent = contentArray
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');

  // 5. Descargar
  const status = exportFile(
    `Reporte_Bascula_${new Date().toISOString().slice(0, 10)}.csv`,
    '\ufeff' + csvContent,
    'text/csv',
  );

  if (status !== true) {
    $q.notify({
      type: 'negative',
      message: 'Error al generar el archivo',
    });
  }
}
</script>

<style scoped>
.border-blue {
  border: 1px solid #bfdbfe !important;
}
.border-green {
  border: 1px solid #bbf7d0 !important;
}
.border-yellow {
  border: 1px solid #fde68a !important;
}
.border-purple {
  border: 1px solid #e9d5ff !important;
}
.border-grey {
  border: 1px solid #d1d5db !important;
}
</style>
