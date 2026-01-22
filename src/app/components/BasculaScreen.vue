<template>
  <BasculaFormulario
    v-if="showFormulario"
    :onBack="handleCancelarFormulario"
    :onGuardar="handleGuardarRegistro"
    :camposConfig="camposConfigComputed"
    :listaProductores="listaProductoresComputed"
    :ultimoTicket="ultimoTicket"
    :catalogoOrigenes="catalogoOrigenes"
    :catalogoCompradores="catalogoCompradores"
    :catalogoGranos="catalogoGranos"
  />

  <div v-else>
    <div class="row items-center justify-between q-mb-md">
      <div class="row items-center q-gutter-sm">
        <q-btn flat round icon="arrow_back" color="grey-8" @click="onBack" />
        <div class="text-h5 text-grey-8">Báscula - Recepción de Granos</div>
      </div>

      <q-btn
        color="primary"
        unelevated
        icon="filter_alt"
        :label="'Filtros'"
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
        <q-card bordered flat class="bg-blue-1" style="border: 1px solid #bfdbfe">
          <q-card-section>
            <div class="text-caption text-grey-7">Total del Día</div>
            <div class="text-h4 text-weight-bold text-blue-9">{{ registrosBascula.length }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card bordered flat class="bg-green-1" style="border: 1px solid #bbf7d0">
          <q-card-section>
            <div class="text-caption text-grey-7">Con Peso Neto</div>
            <div class="text-h4 text-weight-bold text-green-9">{{ conPesoNeto }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card bordered flat class="bg-yellow-1" style="border: 1px solid #fde68a">
          <q-card-section>
            <div class="text-caption text-grey-7">Sin Peso Neto</div>
            <div class="text-h4 text-weight-bold text-yellow-9">{{ sinPesoNeto }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card bordered flat class="bg-purple-1" style="border: 1px solid #e9d5ff">
          <q-card-section>
            <div class="text-caption text-grey-7">Total Toneladas</div>
            <div class="text-h4 text-weight-bold text-purple-9">{{ totalToneladas }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-card
      bordered
      flat
      class="q-pa-md q-mb-md"
      style="border: 2px solid #d1d5db"
      v-show="mostrarFiltros"
    >
      <div class="text-subtitle1 text-center q-mb-md">Filtros</div>

      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-md-2">
          <q-input v-model="filtros.ticket" outlined dense placeholder="Captura Ticket" />
        </div>
        <div class="col-12 col-md-2">
          <q-input v-model="filtros.boleta" outlined dense placeholder="Captura Boleta" />
        </div>
        <div class="col-12 col-md-2">
          <q-input v-model="filtros.origen" outlined dense placeholder="Captura Origen" />
        </div>
        <div class="col-12 col-md-3">
          <q-input v-model="filtros.productor" outlined dense placeholder="Captura Productor" />
        </div>
        <div class="col-12 col-md-3">
          <q-input v-model="filtros.comprador" outlined dense placeholder="Captura Comprador" />
        </div>
      </div>

      <div class="row q-col-gutter-md items-center">
        <div class="col-12 col-md-2">
          <q-checkbox v-model="filtros.hoy" label="Hoy" />
        </div>

        <div class="col-12 col-md-6 row items-center q-gutter-sm">
          <div class="text-body2">Fecha:</div>
          <q-input v-model="filtros.fechaIni" outlined dense type="date" style="max-width: 180px" />
          <div class="text-body2">:</div>
          <q-input v-model="filtros.fechaFin" outlined dense type="date" style="max-width: 180px" />
        </div>

        <div class="col-12 col-md-4 row justify-end">
          <q-btn
            color="positive"
            unelevated
            icon="table_view"
            label="Exportar Excel"
            @click="exportarExcel"
          />
        </div>
      </div>
    </q-card>

    <div class="row justify-end q-mb-md">
      <q-btn round color="black" text-color="white" icon="add" @click="handleNuevoRegistro" />
    </div>

    <q-card bordered flat style="border: 2px solid #d1d5db">
      <q-table
        :rows="registrosBascula"
        :columns="columns"
        row-key="id"
        flat
        :pagination="{ rowsPerPage: 10 }"
      >
        <template #no-data>
          <div class="q-pa-lg text-center text-grey-6">
            <div class="text-h6 q-mb-xs">No hay registros</div>
            <div class="text-body2">
              Haz clic en el botón <strong>+</strong> para crear el primer registro
            </div>
          </div>
        </template>

        <template #body-cell-accion="propsRow">
          <q-td :props="propsRow">
            <q-btn
              flat
              round
              dense
              icon="visibility"
              color="grey-8"
              @click="onVerDetalle(propsRow.row)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { Notify } from 'quasar';
import BasculaFormulario from './BasculaFormulario.vue';

type CampoConfig = { habilitado: boolean; nombre: string; obligatorio: boolean };

interface BasculaScreenProps {
  onBack?: () => void;
  onNuevoRegistro?: () => void;
  onVerDetalle?: (registro: any) => void;
  onGuardarRegistro?: (registro: any) => void;
  registros?: any[];
  camposConfig?: Record<string, CampoConfig>;
  listaProductores?: Array<{ nombre: string; tipo: string; telefono: string; atiende?: string }>;
  catalogoOrigenes?: string[];
  catalogoCompradores?: string[];
  catalogoGranos?: string[];
}

/** * SOLUCIÓN: Definimos los objetos de configuración directamente en withDefaults
 * o fuera del bloque setup si tu compilador lo permite.
 * Aquí lo hacemos directo para asegurar compatibilidad con tu script setup.
 */
const props = withDefaults(defineProps<BasculaScreenProps>(), {
  onBack: () => {},
  onNuevoRegistro: () => {},
  onVerDetalle: () => {},
  onGuardarRegistro: () => {},
  registros: () => [],
  camposConfig: () => ({
    productor: { habilitado: true, nombre: 'Productor', obligatorio: true },
    tProductor: { habilitado: true, nombre: 'T. Productor', obligatorio: false },
    atienda: { habilitado: true, nombre: 'Atiende', obligatorio: false },
    celular: { habilitado: true, nombre: 'Celular', obligatorio: false },
    origen: { habilitado: true, nombre: 'Origen', obligatorio: false },
    chofer: { habilitado: true, nombre: 'Chofer', obligatorio: false },
    placas: { habilitado: true, nombre: 'Placas', obligatorio: false },
    tonAprox: { habilitado: true, nombre: 'Ton. Aprox', obligatorio: false },
    has: { habilitado: true, nombre: 'HAS', obligatorio: false },
    comprador: { habilitado: false, nombre: 'Comprador', obligatorio: false },
    observaciones: { habilitado: false, nombre: 'Observaciones', obligatorio: false },
    pesoBruto: { habilitado: true, nombre: 'Peso Bruto', obligatorio: true },
  }),
  listaProductores: () => [
    { nombre: 'Juan Pérez Martínez', tipo: 'fisica', telefono: '6441234567' },
    { nombre: 'María García López', tipo: 'fisica', telefono: '6447654321' },
    {
      nombre: 'Agronegocios del Norte SA de CV',
      tipo: 'moral',
      telefono: '6449876543',
      atiende: 'Ing. Carlos Ramírez López',
    },
    {
      nombre: 'Productores Unidos de Sonora SPR',
      tipo: 'moral',
      telefono: '6445556789',
      atiende: 'Lic. Ana Martínez Ruiz',
    },
  ],
  catalogoOrigenes: () => [],
  catalogoCompradores: () => [],
  catalogoGranos: () => [],
});

const showFormulario = ref(false);
const registrosBascula = ref<any[]>(props.registros || []);
const mostrarFiltros = ref(true);

const filtros = reactive({
  ticket: '',
  boleta: '',
  origen: '',
  productor: '',
  comprador: '',
  hoy: false,
  fechaIni: '',
  fechaFin: '',
});

watch(
  () => props.registros,
  (v) => {
    if (Array.isArray(v)) registrosBascula.value = v;
  },
  { deep: true },
);

/**
 * Usamos el valor de props o el objeto directo si props viene vacío
 */
const camposConfigComputed = computed(() => props.camposConfig);
const listaProductoresComputed = computed(() => props.listaProductores);

function handleNuevoRegistro() {
  showFormulario.value = true;
  props.onNuevoRegistro?.();
}

function handleGuardarRegistro(registro: any) {
  registrosBascula.value = [...registrosBascula.value, registro];
  showFormulario.value = false;
  props.onGuardarRegistro?.(registro);
}

function handleCancelarFormulario() {
  showFormulario.value = false;
}

function onVerDetalle(registro: any) {
  props.onVerDetalle?.(registro);
}

const ultimoTicket = computed(() => {
  const list = registrosBascula.value;
  if (!list.length) return 999;
  const nums = list.map((r) => parseInt(r?.ticket) || 0);
  return Math.max(...nums);
});

const conPesoNeto = computed(
  () => registrosBascula.value.filter((r) => r?.pesoNeto && r.pesoNeto !== '-').length,
);

const sinPesoNeto = computed(
  () => registrosBascula.value.filter((r) => !r?.pesoNeto || r.pesoNeto === '-').length,
);

const totalToneladas = computed(() => {
  const t = registrosBascula.value.reduce((sum, r) => {
    const raw = r?.pesoBruto ? String(r.pesoBruto).replace(/,/g, '') : '0';
    const peso = parseFloat(raw);
    return sum + (Number.isNaN(peso) ? 0 : peso / 1000);
  }, 0);
  return t.toFixed(2);
});

function exportarExcel() {
  Notify.create({
    type: 'info',
    message: 'Exportar Excel: pendiente de implementar.',
  });
}

const columns = [
  { name: 'idx', label: '#', field: (_: any, idx: number) => idx + 1, align: 'left' },
  { name: 'ticket', label: 'No. Ticket', field: 'ticket', align: 'left' },
  { name: 'boleta', label: 'No. Boleta', field: (r: any) => r.boleta || '-', align: 'left' },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left' },
  { name: 'origen', label: 'Origen (Municipio)', field: 'origen', align: 'left' },
  { name: 'productor', label: 'Productor', field: 'productor', align: 'left' },
  { name: 'comprador', label: 'Comprador', field: 'comprador', align: 'left' },
  { name: 'pesoNeto', label: 'Peso Neto', field: (r: any) => r.pesoNeto || '-', align: 'left' },
  { name: 'accion', label: '', field: 'accion', align: 'center' },
];
</script>
