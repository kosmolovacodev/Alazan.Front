<template>
  <div class="column bg-grey-2" style="min-height: 100%">
    <div class="q-pa-md text-white" style="background: #ff6900">
      <div class="text-h5 text-weight-bold text-center">ANÁLISIS DE CALIDAD</div>
      <div class="text-caption text-center q-mt-xs">Registro y consulta de análisis</div>
    </div>

    <!-- Filtros -->
    <q-card flat bordered class="q-mx-md q-mt-sm q-pa-sm">
      <div class="row q-col-gutter-sm items-end">
        <div class="col-12 col-md-2">
          <q-select
            v-model="filtroEstatus"
            :options="opcionesEstatus"
            label="Estatus"
            outlined
            dense
            emit-value
            map-options
          />
        </div>
        <div class="col-12 col-md-2">
          <q-select
            v-model="filtroGranoId"
            :options="opcionesGranoFiltro"
            label="Grano"
            outlined
            dense
            emit-value
            map-options
          />
        </div>
        <div class="col-12 col-md-3">
          <q-input v-model="filtroFechaInicio" type="date" label="Fecha Desde" outlined dense />
        </div>
        <div class="col-12 col-md-3">
          <q-input v-model="filtroFechaFin" type="date" label="Fecha Hasta" outlined dense />
        </div>
        <div class="col-12 col-md-2">
          <div class="row q-gutter-sm">
            <q-btn
              outline
              color="grey-8"
              icon="filter_alt_off"
              label="Limpiar"
              @click="limpiarFiltros"
            />
            <q-btn
              unelevated
              color="grey-7"
              icon="refresh"
              label="Actualizar"
              @click="cargarPendientes"
            />
          </div>
        </div>
      </div>
    </q-card>

    <!-- Sin resultados -->
    <div
      v-if="!listaPendientes || listaPendientes.length === 0"
      class="column items-center justify-center q-pa-xl"
      style="min-height: 40vh"
    >
      <div class="text-center">
        <q-icon name="search_off" size="64px" color="grey-5" class="q-mb-md" />
        <div class="text-h6 text-weight-bold text-grey-7 q-mb-xs">No se encontraron registros</div>
        <div class="text-body2 text-grey-5">Intenta cambiar el filtro de estatus o las fechas.</div>
        <q-btn
          label="Actualizar"
          icon="refresh"
          flat
          color="primary"
          class="q-mt-md"
          @click="cargarPendientes"
        />
      </div>
    </div>

    <!-- Contenido con registros -->
    <template v-else>
      <q-card flat bordered class="q-pa-sm q-mx-md q-mt-sm">
        <div class="row items-center justify-between">
          <div class="text-body2 text-grey-8">
            Registro {{ currentIndex + 1 }} de {{ listaPendientes?.length || 0 }}
          </div>

          <div class="row items-center q-gutter-sm">
            <q-btn
              round
              dense
              flat
              icon="chevron_left"
              :disable="currentIndex === 0"
              @click="prevRegistro"
            />
            <q-badge color="grey-3" text-color="grey-9" class="q-px-md q-py-sm">
              {{ currentIndex + 1 }} / {{ listaPendientes?.length || 0 }}
            </q-badge>
            <q-btn
              round
              dense
              flat
              icon="chevron_right"
              :disable="currentIndex === (listaPendientes?.length || 0) - 1"
              @click="nextRegistro"
            />
          </div>
        </div>
      </q-card>

      <div class="q-pa-md" style="flex: 1; overflow: auto">
        <div class="q-mx-auto" style="max-width: 980px; display: grid; gap: 16px">
          <q-card bordered>
            <q-card-section>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input
                    :model-value="analisisData.ticket"
                    label="TICKET"
                    outlined
                    dense
                    readonly
                    bg-color="grey-1"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    :model-value="analisisData.fechaHora"
                    label="FECHA Y HORA"
                    outlined
                    dense
                    readonly
                    bg-color="grey-1"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    :model-value="analisisData.chofer"
                    label="CHOFER"
                    outlined
                    dense
                    readonly
                    bg-color="grey-1"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    :model-value="analisisData.placas"
                    label="PLACAS"
                    outlined
                    dense
                    readonly
                    bg-color="grey-1"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    :model-value="registroActual?.grano || ''"
                    label="GRANO"
                    outlined
                    dense
                    readonly
                    bg-color="grey-1"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <q-card bordered>
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold text-grey-8 q-mb-md">
                Resultados de Análisis
              </div>

              <TablaAnalisisDesplegable
                :impurezas="analisisData.impurezas"
                :r1="analisisData.r1"
                :r2="analisisData.r2"
                :cafesLisos="analisisData.cafesLisos"
                :manchados="analisisData.manchados"
                :quebMxc="analisisData.quebMxc"
                :helados="analisisData.helados"
                :alimonados="analisisData.alimonados"
                :revolcados="analisisData.revolcados"
                :germinados="analisisData.germinados"
                :descuentosExportacion="descuentosExportacion"
                :camposExtras="camposExtras"
                :sumaR2="analisisData.sumaR2"
                :totalDanosNum="analisisData.totalDanosNum"
                :exportacion="analisisData.exportacion"
                :readOnly="!esEditable"
                :tipoGranoId="registroActual?.grano_id ?? 0"
                :frijolDataInicial="frijolData"
                :camposConfig="camposConfigActual"
                @input-change="onTablaInputChange"
                @frijol-data-change="onFrijolDataChange"
              />

              <div class="row q-col-gutter-md q-mt-md">
                <div v-if="campoPantallaVisible('calibre')" class="col-12 col-md-6">
                  <q-select
                    v-model="analisisData.calibre"
                    :options="listaCalibres"
                    option-label="nombre"
                    option-value="nombre"
                    label="CALIBRE *"
                    outlined
                    dense
                    emit-value
                    map-options
                    :loading="listaCalibres.length === 0"
                    :disable="!esEditable"
                  >
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">
                          No hay opciones disponibles
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>
                <div v-if="campoPantallaVisible('humedad')" class="col-12 col-md-6">
                  <q-input
                    v-model="analisisData.humedad"
                    type="number"
                    step="0.1"
                    inputmode="decimal"
                    label="HUMEDAD *"
                    outlined
                    dense
                    suffix="%"
                    placeholder="0.0"
                    :readonly="!esEditable"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <q-card bordered>
            <q-card-section>
              <div class="row items-center justify-between q-mb-md">
                <div class="text-subtitle1 text-weight-bold text-grey-8">
                  Evidencia Fotográfica <span class="text-negative">*</span>
                </div>
                <div class="row items-center q-gutter-sm">
                  <q-btn
                    color="positive"
                    unelevated
                    icon="photo_camera"
                    label="Tomar Foto"
                    @click="abrirCamara"
                    :disable="!esEditable"
                  />
                  <q-btn
                    color="primary"
                    unelevated
                    icon="upload_file"
                    label="Subir Foto"
                    @click="fileInputRef?.click()"
                    :disable="!esEditable"
                  />
                  <input
                    ref="fileInputRef"
                    type="file"
                    accept="image/*"
                    multiple
                    style="display: none"
                    @change="onFileSelected"
                  />
                </div>
              </div>

              <div
                v-if="uploadedPhotos.length === 0"
                class="q-pa-md bg-grey-3 text-center text-grey-7 rounded-borders"
              >
                Se requiere al menos 1 foto para guardar.
              </div>

              <div v-else class="row q-col-gutter-md">
                <div
                  v-for="(photo, idx) in uploadedPhotos"
                  :key="idx"
                  class="col-6 col-sm-4 col-md-3"
                >
                  <q-card bordered>
                    <q-img
                      :src="photo"
                      spinner-color="white"
                      style="height: 140px; max-width: 100%"
                    >
                      <div class="absolute-top-right q-pa-xs">
                        <q-btn
                          round
                          dense
                          color="negative"
                          icon="close"
                          size="sm"
                          @click="removePhoto(idx)"
                          :disable="!esEditable"
                        />
                      </div>
                    </q-img>
                  </q-card>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <div class="row justify-end q-mb-xl">
            <q-btn
              color="positive"
              unelevated
              class="q-px-xl q-py-md text-weight-bold"
              label="GUARDAR ANÁLISIS"
              @click="guardar"
              :disable="!esEditable"
            />
          </div>
        </div>
      </div>
    </template>
  </div>

  <!-- Diálogo de Cámara -->
  <q-dialog v-model="cameraDialog" persistent>
    <q-card style="width: 400px; max-width: 95vw">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Tomar Fotografía</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup @click="stopCamera" />
      </q-card-section>

      <q-card-section>
        <video
          ref="videoRef"
          autoplay
          playsinline
          style="width: 100%; border-radius: 8px; background: #000"
        ></video>
        <canvas ref="canvasRef" v-show="false"></canvas>
      </q-card-section>

      <q-card-actions align="center" class="q-pb-md">
        <q-btn color="primary" icon="photo_camera" label="Capturar" @click="captureImage" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, watchEffect, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import TablaAnalisisDesplegable from './TablaAnalisisDesplegable.vue';
import type { AxiosError } from 'axios';
import { useAuthStore } from 'src/stores/auth';
import { useOfflineStore } from 'src/stores/offlineStore';

interface CampoAnalisisConfig {
  id: number;
  claveCampo: string;
  nombreMostrar: string;
  visible: boolean;
  obligatorio: boolean;
  granoId: number | null;
  tipoDato?: string;
  afectaExportacion?: boolean;
}

interface RegistroBascula {
  id: number;
  ticket_numero: string;
  productor: string;
  telefono?: string;
  comprador: string;
  origen: string;
  fecha: string;
  chofer: string;
  placas: string;
  peso_bruto_kg: number;
  status: string;
  grano?: string;
  grano_id?: number;
  // Campos del análisis (vienen del LEFT JOIN)
  calibre?: string;
  humedad?: number | string;
  impurezas?: number | string;
  r1_danado_insecto?: number | string;
  r2_arrugado?: number | string;
  r2_manchado?: number | string;
  r2_quebrado?: number | string;
  datos_adicionales?: string;
}

interface FrijolRow {
  nombre: string;
  pesoGrs: number | string;
  porcentaje: number | string;
  color: string;
  colorOpciones: boolean;
  esTotal: boolean;
  esPlaga: boolean;
  plagaValor: string;
}

interface AnalisisData {
  ticket: string;
  fechaHora: string;
  chofer: string;
  placas: string;
  calibre: string;
  humedad: string;
  impurezas: string;
  r1: string;
  r2: string;
  cafesLisos: string;
  manchados: string;
  quebMxc: string;
  helados: string;
  alimonados: string;
  revolcados: string;
  germinados: string;
  sumaR2: number;
  totalDanosNum: number;
  exportacion: number;
}

// --- Props & Emits ---
const props = withDefaults(
  defineProps<{
    calibresDisponibles?: string[];
  }>(),
  {
    calibresDisponibles: () => ['44-46', '42-44', '40-42'],
  },
);

const emit = defineEmits<{
  (e: 'refresh'): void;
}>();

// --- Estado ---
const $q = useQuasar();
const offlineStore = useOfflineStore();
const loading = ref(false);
const currentIndex = ref(0);
// listaTodos: cache completo del servidor — nunca se filtra directamente
const listaTodos = ref<RegistroBascula[]>([]);
// listaPendientes: computed client-side sobre listaTodos según los filtros activos
const listaCalibres = ref<{ id: number; nombre: string }[]>([]);
const uploadedPhotos = ref<string[]>([]);
const frijolData = ref<FrijolRow[]>([]);

// Config de campos de análisis por grano
const camposAnalisisConfig = ref<CampoAnalisisConfig[]>([]);

// Filtra los campos de análisis para el grano del registro actual
const camposConfigActual = computed(() => {
  const granoId = registroActual.value?.grano_id ?? null;
  return camposAnalisisConfig.value.filter(c => c.granoId === granoId);
});

// Helper: true si el campo es visible según config (si no hay config, muestra todo)
function campoPantallaVisible(clave: string): boolean {
  if (camposConfigActual.value.length === 0) return true;
  const cfg = camposConfigActual.value.find(c => c.claveCampo === clave);
  return !cfg || cfg.visible;
}

// Claves que gestiona la UI fija (TablaAnalisisDesplegable + calibre/humedad independientes).
// Se incluyen variantes en camelCase, snake_case y singular/plural para tolerar
// distintos nombres que el usuario pudo haber configurado en BD.
const CAMPOS_PREDEFINIDOS_SET = new Set([
  // Campos del formulario de análisis estándar
  'calibre',
  'humedad',
  'impurezas', 'impureza',
  'r1',
  'r2', 'rezaga', 'rezagas',
  'cafeslisos', 'cafes_lisos', 'cafes_y_lisos', 'cafesylisos',
  'manchados', 'manchado',
  'quebmxc', 'queb_mxc', 'queb_mxg_mitd_cam', 'quebmxgmitdcam',
  'helados', 'helado',
  'alimonados', 'alimonado',
  'revolcados', 'revolcado',
  'germinados', 'germinado',
  'exportacion',
  'sumar2', 'suma_r2', 'suma_rezagas', 'sumarezagas',
  'totaldanos', 'total_danos', 'total_danos_num', 'totaldanosnum',
  // Campos frijol
  'frijol_impurezas', 'frijol_piedras', 'frijol_mitades', 'frijol_oscuros',
  'frijol_arrugados', 'frijol_manchados', 'frijol_verdes', 'frijol_tierra',
  'frijol_otras_variedades', 'frijol_granos_pequenos', 'frijol_danos_campo',
  'frijol_plaga_viva', 'frijol_plaga_muerta',
]);

// Comprobación case-insensitive para tolerar cualquier capitalización
function esCampoPredefinido(clave: string): boolean {
  return CAMPOS_PREDEFINIDOS_SET.has(clave.toLowerCase().replace(/\s+/g, '_'));
}

// Campos que descuentan del % de exportación — solo los NO predefinidos (predefined ya están en totalDanosNum)
// Aparecen entre "Total Daños" y "Exportación" (ej: C#-1%, C#-2%)
const descuentosExportacion = computed(() =>
  camposConfigActual.value
    .filter(c => c.visible && c.afectaExportacion && !esCampoPredefinido(c.claveCampo))
    .map(c => ({
      clave: c.claveCampo,
      label: c.nombreMostrar,
      valor: datosPersonalizados.value[c.claveCampo] ?? '',
    }))
);

// Campos extra: los que no son predefinidos, no afectan exportación y no son porcentaje de análisis.
// También incluye campos guardados históricamente que ya no están en la configuración actual.
const camposExtras = computed(() => {
  // 1. Desde la configuración activa
  const fromConfig = camposConfigActual.value
    .filter(
      c => c.visible &&
      !esCampoPredefinido(c.claveCampo) &&
      !c.afectaExportacion &&
      c.tipoDato !== 'porcentaje',
    )
    .map(c => ({
      clave: c.claveCampo,
      label: c.nombreMostrar,
      valor: datosPersonalizados.value[c.claveCampo] ?? '',
    }));

  // Claves ya mostradas (config + descuentos) para evitar duplicados
  const yaVistas = new Set([
    ...fromConfig.map(c => c.clave),
    ...descuentosExportacion.value.map(d => d.clave),
  ]);

  // 2. Campos históricos guardados en datos_adicionales que ya no están en config actual
  const fromSaved = Object.entries(datosPersonalizados.value)
    .filter(([clave, valor]) =>
      valor !== '' &&
      !esCampoPredefinido(clave) &&
      !yaVistas.has(clave),
    )
    .map(([clave, valor]) => ({
      clave,
      label: clave.toUpperCase().replace(/_/g, ' '),
      valor: String(valor),
    }));

  return [...fromConfig, ...fromSaved];
});

// Valores de campos personalizados (guardados en datos_adicionales)
const datosPersonalizados = ref<Record<string, string>>({});

// Cámara con getUserMedia
const cameraDialog = ref(false);
const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const stream = ref<MediaStream | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

// Filtros
const filtroEstatus = ref('TODOS');
const filtroFechaInicio = ref('');
const filtroFechaFin = ref('');
const filtroGranoId = ref<number | null>(null);

const opcionesEstatus = [
  { label: 'Pendientes', value: 'PENDIENTE' },
  { label: 'Analizados', value: 'NO_PENDIENTE' },
  { label: 'Todos', value: 'TODOS' },
];

// Granos únicos presentes en la lista cargada
const opcionesGranoFiltro = computed(() => {
  const mapa = new Map<number, string>();
  for (const r of listaTodos.value) {
    if (r.grano_id != null && r.grano) mapa.set(r.grano_id, r.grano);
  }
  return [
    { label: 'Todos los granos', value: null as number | null },
    ...[...mapa.entries()].map(([id, nombre]) => ({ label: nombre, value: id })),
  ];
});

// listaPendientes: filtrado client-side — no toca el servidor
const listaPendientes = computed(() => {
  let lista = listaTodos.value;

  if (filtroEstatus.value && filtroEstatus.value !== 'TODOS') {
    if (filtroEstatus.value === 'NO_PENDIENTE') {
      lista = lista.filter(r => r.status !== 'PENDIENTE');
    } else {
      lista = lista.filter(r => r.status === filtroEstatus.value);
    }
  }

  if (filtroGranoId.value !== null) {
    lista = lista.filter(r => r.grano_id === filtroGranoId.value);
  }

  if (filtroFechaInicio.value) {
    const inicio = new Date(filtroFechaInicio.value);
    lista = lista.filter(r => new Date(r.fecha) >= inicio);
  }

  if (filtroFechaFin.value) {
    const fin = new Date(filtroFechaFin.value + 'T23:59:59');
    lista = lista.filter(r => new Date(r.fecha) <= fin);
  }

  return lista;
});

// Resetear índice al cambiar los filtros para no quedar fuera de rango
watch([filtroEstatus, filtroFechaInicio, filtroFechaFin, filtroGranoId], () => {
  currentIndex.value = 0;
});

function limpiarFiltros() {
  filtroEstatus.value = 'TODOS';
  filtroFechaInicio.value = '';
  filtroFechaFin.value = '';
  filtroGranoId.value = null;
  // No llama al servidor — el computed se recalcula solo
}

const analisisData = reactive<AnalisisData>({
  ticket: '',
  fechaHora: '',
  chofer: '',
  placas: '',
  calibre: props.calibresDisponibles?.[0] || '44-46',
  humedad: '',
  impurezas: '',
  r1: '',
  r2: '',
  cafesLisos: '',
  manchados: '',
  quebMxc: '',
  helados: '',
  alimonados: '',
  revolcados: '',
  germinados: '',
  sumaR2: 0,
  totalDanosNum: 0,
  exportacion: 0,
});

async function cargarCalibres(granoId?: number) {
  try {
    const params: Record<string, unknown> = {};
    if (granoId) params.granoId = granoId;

    const response = await api.get('/api/catalogos/calibres', { params });
    listaCalibres.value = response.data;

    // Si el calibre actual no existe en la nueva lista, resetear al primero disponible
    const calibreActualExiste = listaCalibres.value.some(
      (c: { nombre: string }) => c.nombre === analisisData.calibre,
    );
    if (listaCalibres.value.length > 0 && !calibreActualExiste) {
      analisisData.calibre = listaCalibres.value[0]?.nombre || '';
    }
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cargar catálogo de calibres' });
  }
}

// --- Lógica de Carga API ---
// Carga TODOS los registros del servidor (sin filtros) — el filtrado es client-side
async function cargarPendientes() {
  if (!window.navigator.onLine) return; // Sin red, trabajar con lo que hay en memoria
  loading.value = true;
  try {
    const response = await api.get('/api/analisis/pendientes-analisis', {
      params: { estatus: 'TODOS' },
    });
    listaTodos.value = response.data;
    currentIndex.value = 0;
  } catch {
    if (window.navigator.onLine) {
      $q.notify({ type: 'negative', message: 'Error al cargar tickets pendientes' });
    }
  } finally {
    loading.value = false;
  }
}

async function cargarConfigCampos() {
  try {
    const sedeId = authStore.sedeActivaId ?? 0;
    const { data } = await api.get<{ campos: CampoAnalisisConfig[] }>('/api/configuracion-recepcion', {
      params: { sedeId }
    });
    camposAnalisisConfig.value = (data.campos ?? [])
      .filter(c => (c as unknown as { pantalla: string }).pantalla === 'ANALISIS')
      .map(c => ({ ...c, visible: !!c.visible, obligatorio: !!c.obligatorio, afectaExportacion: !!c.afectaExportacion, granoId: c.granoId ?? null }));
  } catch {
    // Si falla la carga de config, la pantalla sigue funcionando con todos los campos visibles
  }
}

onMounted(async () => {
  await Promise.all([cargarPendientes(), cargarConfigCampos()]);
  const granoId = registroActual.value?.grano_id;
  void cargarCalibres(granoId ?? undefined);
});

// Watcher para recargar datos cuando cambia la sede activa (multisede)
const authStore = useAuthStore();
watch(
  () => authStore.sedeActivaId,
  async (nuevaSedeId, sedeAnterior) => {
    if (nuevaSedeId !== sedeAnterior && sedeAnterior !== undefined) {
      await cargarPendientes();
      $q.notify({
        type: 'info',
        message: `Análisis actualizados para: ${authStore.nombreSedeActiva}`,
        position: 'top',
      });
    }
  },
);

// --- Computados ---
const registroActual = computed(() => {
  if (!listaPendientes.value.length) return null;
  return listaPendientes.value[currentIndex.value];
});

const esEditable = computed(() => {
  const r = registroActual.value;
  if (!r) return false;
  return r.status === 'PENDIENTE';
});

// Recargar calibres cuando cambia el registro actual (diferente grano_id)
watch(
  () => registroActual.value?.grano_id,
  (nuevoGranoId) => {
    void cargarCalibres(nuevoGranoId ?? undefined);
  },
);

// --- Watches ---
watch(
  [currentIndex, listaPendientes],
  () => {
    const r = registroActual.value; // Eliminamos el "as any"
    if (!r) return;

    // 1. Datos básicos del encabezado
    analisisData.ticket = r.ticket_numero || '';
    analisisData.fechaHora = r.fecha
      ? new Date(r.fecha).toLocaleString()
      : new Date().toLocaleString();
    analisisData.chofer = r.chofer || '';
    analisisData.placas = r.placas || '';

    // 2. Cargar valores técnicos de la base de datos de forma segura
    analisisData.calibre = r.calibre || '44-46';
    analisisData.humedad = r.humedad?.toString() || '';
    analisisData.impurezas = r.impurezas?.toString() || '';
    analisisData.r1 = r.r1_danado_insecto?.toString() || '';
    analisisData.r2 = r.r2_arrugado?.toString() || '';
    analisisData.manchados = r.r2_manchado?.toString() || '';
    analisisData.quebMxc = r.r2_quebrado?.toString() || '';

    // 3. Procesar JSON de datos adicionales
    if (r.datos_adicionales) {
      try {
        const extra = JSON.parse(r.datos_adicionales);
        analisisData.cafesLisos = extra.cafes_lisos?.toString() || '';
        analisisData.helados = extra.helados?.toString() || '';
        analisisData.alimonados = extra.alimonados?.toString() || '';
        analisisData.revolcados = extra.revolcados?.toString() || '';
        analisisData.germinados = extra.germinados?.toString() || '';

        uploadedPhotos.value = Array.isArray(extra.fotos) ? [...extra.fotos] : [];

        // Cargar datos de frijol si existen
        frijolData.value = Array.isArray(extra.frijol_datos) ? extra.frijol_datos : [];

        // Cargar campos personalizados (cualquier clave que no sea de las reservadas del núcleo)
        const reservadas = new Set(['exportacion', 'cafes_lisos', 'helados', 'alimonados', 'revolcados', 'fotos', 'frijol_datos', 'germinados']);
        datosPersonalizados.value = {};
        for (const key of Object.keys(extra)) {
          if (!reservadas.has(key)) datosPersonalizados.value[key] = String(extra[key] ?? '');
        }
      } catch (e) {
        console.error('Error al parsear datos adicionales:', e);
        uploadedPhotos.value = [];
        frijolData.value = [];
        datosPersonalizados.value = {};
      }
    } else {
      // Si no hay análisis previo, aseguramos que los campos calculados inicien limpios
      analisisData.cafesLisos = '';
      analisisData.helados = '';
      analisisData.alimonados = '';
      analisisData.revolcados = '';
      analisisData.germinados = '';
      uploadedPhotos.value = [];
      frijolData.value = [];
      datosPersonalizados.value = {};
    }
  },
  { immediate: true },
);

// Cálculos automáticos
watchEffect(() => {
  const suma =
    num(analisisData.r2) +
    num(analisisData.cafesLisos) +
    num(analisisData.manchados) +
    num(analisisData.quebMxc) +
    num(analisisData.helados) +
    num(analisisData.alimonados) +
    num(analisisData.revolcados) +
    num(analisisData.germinados);
  analisisData.sumaR2 = round2(suma);
});

watchEffect(() => {
  // Total de Daños = Rezaga (sumaR2) + Impurezas
  // R1 (Dañado Insecto) es informativo pero no suma al total de daños
  analisisData.totalDanosNum = round2(
    num(analisisData.impurezas) + analisisData.sumaR2,
  );
});

watchEffect(() => {
  // EXPORTACIÓN = 100 - Total de Daños - suma de campos con afectaExportacion
  const sumaDescuentos = descuentosExportacion.value.reduce(
    (s, d) => s + (parseFloat(d.valor) || 0),
    0,
  );
  analisisData.exportacion = round2(Math.max(0, 100 - analisisData.totalDanosNum - sumaDescuentos));
});

// --- Funciones Auxiliares ---
function num(v: string | number) {
  const n = typeof v === 'number' ? v : parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

function round2(v: number) {
  return parseFloat(v.toFixed(2));
}

function limpiarFormulario() {
  analisisData.humedad = '';
  analisisData.impurezas = '';
  analisisData.r1 = '';
  analisisData.r2 = '';
  analisisData.cafesLisos = '';
  analisisData.manchados = '';
  analisisData.quebMxc = '';
  analisisData.helados = '';
  analisisData.alimonados = '';
  analisisData.revolcados = '';
  analisisData.germinados = '';

  // Limpiar el array de fotos, datos de frijol y campos personalizados
  uploadedPhotos.value = [];
  frijolData.value = [];
  datosPersonalizados.value = {};
}

function onTablaInputChange(campo: string, valor: string) {
  if (campo in analisisData) {
    (analisisData[campo as keyof AnalisisData] as unknown) = valor;
  } else {
    // Campos personalizados (ej: cal_1, cal_2) se guardan en datosPersonalizados
    datosPersonalizados.value[campo] = valor;
  }
}

function onFrijolDataChange(data: FrijolRow[]) {
  frijolData.value = data;
}

// --- Navegación ---
function prevRegistro() {
  if (currentIndex.value > 0) {
    currentIndex.value--;
    limpiarFormulario();
  }
}

function nextRegistro() {
  if (currentIndex.value < listaPendientes.value.length - 1) {
    currentIndex.value++;
    limpiarFormulario();
  }
}

// --- Cámara con getUserMedia ---
async function abrirCamara() {
  // navigator.mediaDevices solo existe en contextos seguros (HTTPS o localhost).
  // Al acceder por IP en HTTP, el navegador lo deja como undefined.
  if (!navigator.mediaDevices?.getUserMedia) {
    $q.dialog({
      title: 'Cámara no disponible',
      message:
        'El navegador bloquea el acceso a la cámara en conexiones HTTP por IP. ' +
        'Usa "Subir Foto" para adjuntar imágenes, o accede al sistema por HTTPS.',
      ok: { label: 'Entendido', color: 'primary', flat: true },
    });
    return;
  }

  try {
    cameraDialog.value = true;
    stream.value = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false,
    });
    if (videoRef.value) {
      videoRef.value.srcObject = stream.value;
    }
  } catch (err) {
    console.error('Error al acceder a la cámara:', err);
    $q.notify({ type: 'negative', message: 'No se pudo acceder a la cámara. Usa "Subir Foto".' });
    cameraDialog.value = false;
  }
}

function captureImage() {
  if (videoRef.value && canvasRef.value) {
    const video = videoRef.value;
    const canvas = canvasRef.value;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const fotoBase64 = canvas.toDataURL('image/jpeg', 0.8);
      uploadedPhotos.value.push(fotoBase64);
      stopCamera();
      cameraDialog.value = false;
      $q.notify({ type: 'positive', message: 'Foto capturada.' });
    }
  }
}

function stopCamera() {
  if (stream.value) {
    stream.value.getTracks().forEach((track) => track.stop());
    stream.value = null;
  }
}

function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;
  for (const file of Array.from(input.files)) {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        uploadedPhotos.value.push(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  }
  input.value = '';
}

function removePhoto(index: number) {
  uploadedPhotos.value.splice(index, 1);
}

// --- Guardar ---
async function guardar() {
  const esFrijol = registroActual.value?.grano_id === 1;

  // Acumular todos los campos faltantes para mostrarlos juntos
  const faltantes: string[] = [];

  if (!analisisData.humedad) faltantes.push('HUMEDAD');
  if (!analisisData.calibre) faltantes.push('CALIBRE');
  // IMPUREZA tiene * fijo en la tabla normal (granos que no son frijol)
  if (!esFrijol && analisisData.impurezas === '') faltantes.push('IMPUREZA');
  if (uploadedPhotos.value.length === 0) faltantes.push('EVIDENCIA FOTOGRÁFICA');

  // Campos adicionales obligatorios según configuración
  const campoADato: Record<string, string> = {
    impurezas: analisisData.impurezas,
    r1: analisisData.r1,
    r2: analisisData.r2,
    cafesLisos: analisisData.cafesLisos,
    manchados: analisisData.manchados,
    quebMxc: analisisData.quebMxc,
    helados: analisisData.helados,
    alimonados: analisisData.alimonados,
    revolcados: analisisData.revolcados,
    germinados: analisisData.germinados,
    humedad: analisisData.humedad,
    calibre: analisisData.calibre,
  };

  for (const campo of camposConfigActual.value) {
    if (!campo.obligatorio || !campo.visible) continue;
    if (['humedad', 'calibre', 'impurezas'].includes(campo.claveCampo)) continue;
    const valor = esCampoPredefinido(campo.claveCampo)
      ? (campoADato[campo.claveCampo] ?? '')
      : (datosPersonalizados.value[campo.claveCampo] ?? '');
    if (valor === '') faltantes.push(campo.nombreMostrar);
  }

  if (faltantes.length > 0) {
    $q.notify({
      type: 'warning',
      message: `Te faltan los siguientes campos obligatorios:\n• ${faltantes.join('\n• ')}`,
      multiLine: true,
      timeout: 5000,
    });
    return;
  }

  const r = registroActual.value;
  if (!r) return;

  const yaExisteAnalisis = !!r.calibre || !!r.datos_adicionales;

  const payload = {
    bascula_id: r.id,
    calibre: analisisData.calibre,
    humedad: num(analisisData.humedad),
    impurezas: num(analisisData.impurezas),
    r1_danado_insecto: num(analisisData.r1),
    r2_quebrado: num(analisisData.quebMxc),
    r2_manchado: num(analisisData.manchados),
    r2_arrugado: num(analisisData.r2),
    analista_usuario_id: 1,
    grano_id: r.grano_id || null,
    observaciones: `Análisis para ticket ${r.ticket_numero}`,
    datos_adicionales: JSON.stringify({
      exportacion: analisisData.exportacion,
      cafes_lisos: num(analisisData.cafesLisos),
      helados: num(analisisData.helados),
      alimonados: num(analisisData.alimonados),
      revolcados: num(analisisData.revolcados),
      germinados: num(analisisData.germinados),
      fotos: uploadedPhotos.value,
      ...(r.grano_id === 1 && frijolData.value.length > 0
        ? { frijol_datos: frijolData.value }
        : {}),
      ...datosPersonalizados.value,
    }),
  };

  // ── OFFLINE PATH ──────────────────────────────────────────────────────────────
  if (!window.navigator.onLine) {
    offlineStore.agregarAnalisis({
      ...payload,
      _localId: 'LOCAL_ANAL_' + Date.now(),
      _syncStatus: 'pending',
      _esActualizacion: yaExisteAnalisis,
      _ticketNumero: r.ticket_numero,
    });
    $q.notify({
      type: 'warning',
      icon: 'cloud_off',
      message: `Sin conexión — análisis del ticket ${r.ticket_numero} guardado localmente. Se sincronizará al volver la red.`,
      timeout: 4000,
    });
    return;
  }

  // ── ONLINE PATH ───────────────────────────────────────────────────────────────
  $q.loading.show({ message: 'Procesando análisis...' });

  try {
    if (yaExisteAnalisis) {
      await api.put(`/api/analisis/actualizar/${r.id}`, payload);
      $q.notify({ type: 'positive', message: `Análisis del ticket ${r.ticket_numero} actualizado.` });
    } else {
      await api.post('/api/analisis/guardar', payload);
      $q.notify({ type: 'positive', message: `Ticket ${r.ticket_numero} guardado con éxito.` });
    }

    emit('refresh');
    await cargarPendientes();
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message: string }>;
    $q.notify({
      type: 'negative',
      message: axiosError.response?.data?.message || 'Error al procesar el análisis.',
    });
  } finally {
    $q.loading.hide();
  }
}
</script>

<style scoped>
.hidden {
  display: none;
}

.q-img__image {
  object-fit: cover !important;
}

/* Asegura que el card de la foto no colapse */
.q-card .q-img {
  min-height: 100px;
  background-color: #f0f0f0; /* Color de fondo mientras carga */
}
</style>
