<template>
  <q-page padding class="bg-grey-2">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 text-grey-8 text-weight-bold">
        <q-icon name="receipt_long" class="q-mr-sm" size="md" />
        Boletas - Confirmacion de Precio
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

    <!-- Dashboard KPIs -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-2">
        <q-card
          bordered
          flat
          class="bg-green-1 border-green cursor-pointer"
          @click="filtroEstatus = 'AUTORIZADOS'"
        >
          <q-card-section class="q-py-sm">
            <div class="text-caption text-green-9 text-weight-medium">Precio Autorizado</div>
            <div class="text-h4 text-weight-bold text-green-9">{{ resumen.precioAutorizado }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-2">
        <q-card
          bordered
          flat
          class="bg-orange-1 border-orange cursor-pointer"
          @click="filtroEstatus = 'Pendiente'"
        >
          <q-card-section class="q-py-sm">
            <div class="text-caption text-orange-9 text-weight-medium">Pendiente Autorizacion</div>
            <div class="text-h4 text-weight-bold text-orange-9">
              {{ resumen.pendienteAutorizacion }}
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-2">
        <q-card
          bordered
          flat
          class="bg-blue-1 border-blue cursor-pointer"
          @click="filtroEstatus = 'Precio Aceptado'"
        >
          <q-card-section class="q-py-sm">
            <div class="text-caption text-blue-9 text-weight-medium">Finalizadas</div>
            <div class="text-h4 text-weight-bold text-blue-9">{{ resumen.finalizadas }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-2">
        <q-card
          bordered
          flat
          class="bg-red-1 border-red cursor-pointer"
          @click="filtroEstatus = 'En Renegociacion'"
        >
          <q-card-section class="q-py-sm">
            <div class="text-caption text-red-9 text-weight-medium">En Renegociacion</div>
            <div class="text-h4 text-weight-bold text-red-9">{{ resumen.enRenegociacion }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-2">
        <q-card
          bordered
          flat
          class="bg-purple-1 border-purple cursor-pointer"
          @click="filtroEstatus = ''"
        >
          <q-card-section class="q-py-sm">
            <div class="text-caption text-purple-9 text-weight-medium">Total Boletas</div>
            <div class="text-h4 text-weight-bold text-purple-9">{{ resumen.total }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Filtros -->
    <q-card v-show="mostrarFiltros" bordered flat class="q-pa-md q-mb-md shadow-1 border-grey">
      <div class="text-subtitle2 q-mb-md text-grey-8 text-center text-uppercase">
        Filtros de Busqueda
      </div>
      <div class="row q-col-gutter-md q-mb-sm">
        <div class="col-12 col-md-2">
          <q-input
            v-model="filtros.buscar"
            outlined
            dense
            label="Buscar"
            placeholder="Ticket o Boleta"
            clearable
          >
            <template #prepend><q-icon name="search" /></template>
          </q-input>
        </div>
        <div class="col-12 col-md-2">
          <q-select
            v-model="filtroEstatus"
            :options="opcionesEstatus"
            outlined
            dense
            label="Estatus"
            emit-value
            map-options
            clearable
          />
        </div>
        <div class="col-12 col-md-2">
          <q-select
            v-model="filtros.comprador"
            :options="opcionesComprador"
            outlined
            dense
            label="Comprador"
            emit-value
            map-options
            clearable
          />
        </div>
        <div class="col-12 col-md-2">
          <q-select
            v-model="filtros.calibre"
            :options="opcionesCalibre"
            outlined
            dense
            label="Calibre"
            emit-value
            map-options
            clearable
          />
        </div>
        <div class="col-12 col-md-2">
          <q-input v-model="filtros.fechaInicio" outlined dense type="date" label="Fecha Desde" />
        </div>
        <div class="col-12 col-md-2">
          <q-input v-model="filtros.fechaFin" outlined dense type="date" label="Fecha Hasta" />
        </div>
      </div>
      <div class="row justify-end q-gutter-sm">
        <q-btn
          outline
          color="grey-8"
          icon="filter_alt_off"
          label="Limpiar"
          @click="limpiarFiltros"
        />
        <q-btn
          color="positive"
          unelevated
          icon="description"
          label="Exportar Excel"
          @click="exportarExcel"
        />
      </div>
    </q-card>

    <!-- Tabla de Boletas -->
    <q-card bordered flat class="shadow-1 border-grey">
      <q-table
        :rows="boletasFiltradas"
        :columns="columns"
        row-key="id"
        flat
        :pagination="{ rowsPerPage: 0 }"
        :loading="loading"
      >
        <template v-slot:body-cell-estatus="props">
          <q-td :props="props">
            <span v-if="props.value === 'Precio Autorizado'" class="text-blue text-weight-bold">
              👍 Precio Autorizado
            </span>
            <span v-else-if="props.value === 'Sin Precio'" class="text-orange text-weight-bold">
              ⏳ Sin Precio
            </span>
            <span v-else-if="props.value === 'Precio Aceptado'" class="text-green text-weight-bold">
              ✅ Precio Aceptado
            </span>
            <span v-else-if="props.value === 'En Renegociacion'" class="text-red text-weight-bold">
              🔄 En Renegociación
            </span>
            <span v-else-if="props.value === 'Precio Rechazado'" class="text-red text-weight-bold">
              ❌ Precio Rechazado
            </span>
            <span v-else>
              {{ props.value }}
            </span>
          </q-td>
        </template>

        <template v-slot:body-cell-precio="props">
          <q-td :props="props" class="text-weight-bold"> ${{ formatNumber(props.value) }} </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn
              flat
              round
              dense
              icon="visibility"
              color="primary"
              @click="verDetalle(props.row)"
            >
              <q-tooltip>Ver Boleta</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width row flex-center q-pa-xl text-grey-6">
            <q-icon name="receipt_long" size="md" class="q-mr-sm" />
            No hay boletas que mostrar.
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- Modal de Detalle de Boleta -->
    <q-dialog v-model="mostrarModal" persistent maximized>
      <q-card class="bg-grey-1">
        <!-- Header del Modal -->
        <q-toolbar class="bg-primary text-white">
          <q-toolbar-title>
            BOLETA - CONFIRMACION DE PRECIO
            <q-select
              v-model="boletaSeleccionadaId"
              :options="opcionesBoletasModal"
              dense
              outlined
              dark
              emit-value
              map-options
              class="q-ml-md"
              style="min-width: 200px; display: inline-block"
              @update:model-value="cambiarBoleta"
            />
          </q-toolbar-title>
          <q-btn flat round dense icon="close" @click="cerrarModal" />
        </q-toolbar>

        <!-- Info superior -->
        <q-card-section class="bg-white q-py-sm">
          <div class="row q-col-gutter-md">
            <div class="col-auto">
              <q-badge
                :color="getColorEstatus(boletaSeleccionada?.estatus || '')"
                :text-color="getTextColorEstatus(boletaSeleccionada?.estatus || '')"
                class="q-pa-sm"
              >
                {{ boletaSeleccionada?.estatus }}
              </q-badge>
            </div>
            <div class="col-auto">
              <span class="text-grey-7">Ticket:</span>
              <span class="text-weight-bold q-ml-xs">{{ boletaSeleccionada?.ticket }}</span>
            </div>
            <div class="col-auto">
              <span class="text-grey-7">Productor:</span>
              <span class="text-weight-bold q-ml-xs">{{ boletaSeleccionada?.productor }}</span>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <!-- Contenido Principal -->
        <q-card-section class="scroll" style="max-height: calc(100vh - 200px)">
          <div class="row q-col-gutter-md">
            <!-- Panel Izquierdo: Boleta Preliminar / Boleta -->
            <div
              :class="
                boletaSeleccionada?.estatus === 'Precio Aceptado' ? 'col-12' : 'col-12 col-md-7'
              "
            >
              <q-card bordered>
                <q-card-section
                  :class="
                    boletaSeleccionada?.estatus === 'Precio Aceptado'
                      ? 'bg-green-7 text-white'
                      : 'bg-orange-7 text-white'
                  "
                >
                  <div class="row items-center justify-between">
                    <div class="text-h6 text-weight-bold">
                      {{
                        boletaSeleccionada?.estatus === 'Precio Aceptado'
                          ? 'BOLETA'
                          : 'BOLETA PRELIMINAR'
                      }}
                    </div>
                    <div
                      v-if="boletaSeleccionada?.estatus === 'Precio Aceptado'"
                      class="text-caption"
                    >
                      Precio aceptado por productor
                    </div>
                    <div class="row q-gutter-sm">
                      <q-btn flat dense icon="print" label="Imprimir" @click="imprimirBoleta" />
                      <q-btn
                        flat
                        dense
                        icon="download"
                        label="Descargar"
                        @click="descargarBoleta"
                      />
                    </div>
                  </div>
                </q-card-section>

                <q-card-section>
                  <!-- Datos de la Boleta -->
                  <div class="row q-col-gutter-sm">
                    <div class="col-6 col-md-4">
                      <div class="text-caption text-grey-7">FOLIO / BOLETA</div>
                      <div class="text-weight-bold">{{ boletaSeleccionada?.noBoleta }}</div>
                    </div>
                    <div class="col-6 col-md-4">
                      <div class="text-caption text-grey-7">PRODUCTOR</div>
                      <div class="text-weight-bold">{{ boletaSeleccionada?.productor }}</div>
                    </div>
                    <div class="col-6 col-md-4">
                      <div class="text-caption text-grey-7">FECHA Y HORA</div>
                      <div class="text-weight-bold">{{ boletaSeleccionada?.fecha }}</div>
                    </div>
                    <div class="col-6 col-md-4">
                      <div class="text-caption text-grey-7">TELEFONO</div>
                      <div class="text-weight-bold">
                        {{ boletaSeleccionada?.telefono || 'N/A' }}
                      </div>
                    </div>
                    <div class="col-6 col-md-4">
                      <div class="text-caption text-grey-7">COMPRADOR</div>
                      <div class="text-weight-bold">{{ boletaSeleccionada?.comprador }}</div>
                    </div>
                    <div class="col-6 col-md-4">
                      <div class="text-caption text-grey-7">ORIGEN</div>
                      <div class="text-weight-bold">{{ boletaSeleccionada?.origen }}</div>
                    </div>
                    <div class="col-6 col-md-4">
                      <div class="text-caption text-grey-7">CALIBRE</div>
                      <div class="text-weight-bold text-blue-9">
                        {{ boletaSeleccionada?.calibre }}
                      </div>
                    </div>
                    <div class="col-6 col-md-4">
                      <div class="text-caption text-grey-7">HUMEDAD</div>
                      <div class="text-weight-bold">{{ boletaSeleccionada?.humedad }}%</div>
                    </div>
                    <div class="col-6 col-md-4">
                      <div class="text-caption text-grey-7">PRECIO / KG</div>
                      <div class="text-weight-bold text-green-9 text-h6">
                        ${{ formatNumber(boletaSeleccionada?.precio) }}
                      </div>
                    </div>
                    <div class="col-6 col-md-4">
                      <div class="text-caption text-grey-7">PESO BRUTO</div>
                      <div class="text-weight-bold">{{ boletaSeleccionada?.pesoBruto }} kg</div>
                    </div>
                    <div class="col-6 col-md-4">
                      <div class="text-caption text-grey-7">DESCUENTO (KG/TON)</div>
                      <div class="text-weight-bold">
                        {{ Math.round(boletaSeleccionada?.descuento || 0) }}
                      </div>
                    </div>
                    <div class="col-6 col-md-4">
                      <div class="text-caption text-grey-7">TON. APROX</div>
                      <div class="text-weight-bold">
                        {{ boletaSeleccionada?.tonsAprox }}
                      </div>
                    </div>
                  </div>

                  <q-separator class="q-my-md" />

                  <!-- Analisis de Calidad -->
                  <div class="text-subtitle2 text-weight-bold q-mb-sm">ANALISIS DE CALIDAD</div>
                  <TablaAnalisisDesplegable
                    :tipo-grano-id="boletaSeleccionada?.granoId || 0"
                    :impurezas="boletaSeleccionada?.impurezas || 0"
                    :r1="boletaSeleccionada?.r1 || 0"
                    :r2="boletaSeleccionada?.r2 || 0"
                    :cafes-lisos="boletaSeleccionada?.cafesLisos || 0"
                    :manchados="boletaSeleccionada?.manchados || 0"
                    :queb-mxc="boletaSeleccionada?.quebMxc || 0"
                    :helados="boletaSeleccionada?.helados || 0"
                    :alimonados="boletaSeleccionada?.alimonados || 0"
                    :revolcados="boletaSeleccionada?.revolcados || 0"
                    :suma-r2="boletaSeleccionada?.sumaR2 || 0"
                    :total-danos-num="calcularTotalDanos"
                    :exportacion="boletaSeleccionada?.exportacion || 0"
                    :calibre="boletaSeleccionada?.calibre || ''"
                    :read-only="true"
                    :frijol-data-inicial="frijolDataInicial"
                  />

                  <!-- Fotos -->
                  <div class="q-mt-md">
                    <div class="text-subtitle2 text-weight-bold q-mb-sm">
                      <q-icon name="photo_camera" class="q-mr-xs" />
                      FOTOS DEL ANALISIS
                    </div>
                    <div v-if="fotosAnalisis.length > 0" class="row q-col-gutter-sm">
                      <div v-for="(foto, idx) in fotosAnalisis" :key="idx" class="col-4 col-md-2">
                        <div
                          class="rounded-borders cursor-pointer overflow-hidden bg-grey-3"
                          style="width: 100%; height: 120px; position: relative"
                          @click="verFoto(foto)"
                        >
                          <img
                            :src="foto"
                            style="width: 100%; height: 100%; object-fit: cover; display: block"
                          />
                        </div>
                      </div>
                    </div>
                    <div v-else class="text-grey-6 text-center q-pa-md bg-grey-3 rounded-borders">
                      Sin fotos disponibles
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Panel Derecho: Confirmacion (solo si no está aceptado) -->
            <div v-if="boletaSeleccionada?.estatus !== 'Precio Aceptado'" class="col-12 col-md-5">
              <q-card bordered>
                <q-card-section class="bg-blue-7 text-white">
                  <div class="text-h6 text-weight-bold text-center">CONFIRMACION DEL PRODUCTOR</div>
                </q-card-section>

                <q-card-section>
                  <div class="text-center q-py-lg">
                    <q-icon name="help_outline" size="xl" color="grey-6" />
                    <div class="text-h6 q-mt-md">Productor Acepto Precio?</div>
                    <div class="text-body2 text-grey-7 q-mb-lg">
                      Precio ofrecido:
                      <span class="text-weight-bold text-green-9"
                        >${{ formatNumber(boletaSeleccionada?.precio) }}</span
                      >
                      / kg
                    </div>

                    <div class="row justify-center q-gutter-md">
                      <q-btn
                        color="positive"
                        unelevated
                        size="lg"
                        icon="check"
                        label="SI, ACEPTA"
                        class="q-px-xl"
                        :disable="
                          !['Precio Autorizado', 'Precio Autorizado CG', 'Autorizado CC'].includes(
                            boletaSeleccionada?.estatus || '',
                          )
                        "
                        @click="confirmarPrecio(true)"
                      />
                      <q-btn
                        color="negative"
                        unelevated
                        size="lg"
                        icon="close"
                        label="NO, RECHAZA"
                        class="q-px-xl"
                        :disable="
                          !['Precio Autorizado', 'Precio Autorizado CG', 'Autorizado CC'].includes(
                            boletaSeleccionada?.estatus || '',
                          )
                        "
                        @click="confirmarPrecio(false)"
                      />
                    </div>

                    <div
                      v-if="
                        !['Precio Autorizado', 'Precio Autorizado CG', 'Autorizado CC'].includes(
                          boletaSeleccionada?.estatus || '',
                        )
                      "
                      class="text-caption text-grey-6 q-mt-md"
                    >
                      * Solo se puede confirmar cuando el precio esta autorizado
                    </div>
                  </div>

                  <q-separator class="q-my-md" />

                  <!-- Firmas -->
                  <div class="text-subtitle2 text-weight-bold q-mb-md">FIRMAS</div>
                  <div class="row q-col-gutter-md">
                    <div class="col-4 text-center">
                      <div class="bg-grey-3 q-pa-md rounded-borders" style="min-height: 80px">
                        <q-icon name="draw" size="md" color="grey-5" />
                      </div>
                      <div class="text-caption text-grey-7 q-mt-xs">Analista</div>
                    </div>
                    <div class="col-4 text-center">
                      <div class="bg-grey-3 q-pa-md rounded-borders" style="min-height: 80px">
                        <q-icon name="draw" size="md" color="grey-5" />
                      </div>
                      <div class="text-caption text-grey-7 q-mt-xs">Recepcionista</div>
                    </div>
                    <div class="col-4 text-center">
                      <div class="bg-grey-3 q-pa-md rounded-borders" style="min-height: 80px">
                        <q-icon name="draw" size="md" color="grey-5" />
                      </div>
                      <div class="text-caption text-grey-7 q-mt-xs">Autorizo</div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Modal de Rechazo eliminado: ahora el rechazo es directo con confirmación -->
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue';
import { api } from 'src/boot/axios';
import { Notify, useQuasar, exportFile } from 'quasar';
import { useAuthStore } from 'src/stores/auth';
import type { QTableColumn } from 'quasar';
import TablaAnalisisDesplegable from 'src/pages/analisis/TablaAnalisisDesplegable.vue';

const $q = useQuasar();
const authStore = useAuthStore();

interface Boleta {
  id: number;
  ticket: string | number;
  noBoleta: string;
  fecha: string;
  productor: string;
  origen: string;
  calibre: string;
  pesoBruto: number;
  precio: number;
  estatus: string;
  comprador?: string;
  telefono?: string;
  humedad?: number;
  descuento?: number;
  tonsAprox?: number;
  impurezas?: number;
  r1?: number;
  sumaR2?: number;
  r2?: number;
  cafesLisos?: number;
  manchados?: number;
  quebMxc?: number;
  helados?: number;
  alimonados?: number;
  revolcados?: number;
  exportacion?: number;
  datosAdicionales?: string;
  granoId?: number;
  tipoGrano?: string;
}

// Estado
const boletas = ref<Boleta[]>([]);
const loading = ref(false);
const mostrarFiltros = ref(true);
const mostrarModal = ref(false);
const boletaSeleccionada = ref<Boleta | null>(null);
const boletaSeleccionadaId = ref<number | null>(null);

const resumen = ref({
  total: 0,
  precioAutorizado: 0,
  pendienteAutorizacion: 0,
  finalizadas: 0,
  enRenegociacion: 0,
});

const filtros = reactive({
  buscar: '',
  comprador: '',
  calibre: '',
  fechaInicio: '',
  fechaFin: '',
});

const filtroEstatus = ref('');

// Columnas de la tabla
const columns: QTableColumn[] = [
  { name: 'ticket', label: 'No. Ticket', field: 'ticket', align: 'left', sortable: true },
  { name: 'noBoleta', label: 'No. Boleta', field: 'noBoleta', align: 'left', sortable: true },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left', sortable: true },
  { name: 'productor', label: 'Productor', field: 'productor', align: 'left' },
  { name: 'origen', label: 'Origen', field: 'origen', align: 'left' },
  { name: 'calibre', label: 'Calibre', field: 'calibre', align: 'left' },
  {
    name: 'pesoBruto',
    label: 'Peso Bruto',
    // Cambiamos row: any por row: Boleta
    field: (row: Boleta) => `${row.pesoBruto} kg`,
    // field: (row: Boleta) => `${formatNumber(row.pesoBruto)} kg`,
    align: 'right',
  },
  { name: 'precio', label: 'Precio/kg', field: 'precio', align: 'right' },
  { name: 'estatus', label: 'Estatus', field: 'estatus', align: 'center' },
  { name: 'acciones', label: 'Accion', field: 'id', align: 'center' },
];

// Opciones de filtros
const opcionesEstatus = [
  { label: 'Todos', value: '' },
  { label: 'Sin Precio', value: 'Sin Precio' },
  { label: 'Precio Autorizado', value: 'AUTORIZADOS' },
  { label: 'Precio Aceptado', value: 'Precio Aceptado' },
  { label: 'En Renegociacion', value: 'En Renegociacion' },
  { label: 'Precio Rechazado', value: 'Precio Rechazado' },
];

const opcionesComprador = computed(() => {
  const uniq = [...new Set(boletas.value.map((b) => b.comprador).filter(Boolean))];
  return uniq.map((v) => ({ label: v, value: v }));
});

const opcionesCalibre = computed(() => {
  const uniq = [...new Set(boletas.value.map((b) => b.calibre).filter(Boolean))];
  return uniq.map((v) => ({ label: v, value: v }));
});

const opcionesBoletasModal = computed(() => {
  return boletas.value.map((b) => ({
    label: `Boleta ${b.noBoleta} - ${b.productor}`,
    value: b.id,
  }));
});

// Filtrado de boletas
const boletasFiltradas = computed(() => {
  let lista = boletas.value;

  if (filtros.buscar) {
    const busqueda = filtros.buscar.toLowerCase();
    lista = lista.filter(
      (b) =>
        b.ticket?.toString().includes(busqueda) ||
        b.noBoleta?.toString().includes(busqueda) ||
        b.productor?.toLowerCase().includes(busqueda),
    );
  }

  if (filtroEstatus.value) {
    if (filtroEstatus.value === 'AUTORIZADOS') {
      lista = lista.filter((b) =>
        ['Precio Autorizado', 'Precio Autorizado CG', 'Autorizado CC'].includes(b.estatus),
      );
    } else {
      lista = lista.filter((b) => b.estatus === filtroEstatus.value);
    }
  }

  if (filtros.comprador) {
    lista = lista.filter((b) => b.comprador === filtros.comprador);
  }

  if (filtros.calibre) {
    lista = lista.filter((b) => b.calibre === filtros.calibre);
  }

  if (filtros.fechaInicio || filtros.fechaFin) {
    const inicio = filtros.fechaInicio ? new Date(filtros.fechaInicio) : null;
    const fin = filtros.fechaFin ? new Date(filtros.fechaFin + 'T23:59:59') : null;
    lista = lista.filter((b) => {
      const fechaBoleta = new Date(b.fecha);
      if (inicio && fechaBoleta < inicio) return false;
      if (fin && fechaBoleta > fin) return false;
      return true;
    });
  }

  return lista;
});

// Fotos del analisis
const fotosAnalisis = computed(() => {
  if (!boletaSeleccionada.value?.datosAdicionales) return [];
  try {
    const datos = JSON.parse(boletaSeleccionada.value.datosAdicionales);
    return datos.fotos || [];
  } catch {
    return [];
  }
});

// Calcular total de danos
const calcularTotalDanos = computed(() => {
  if (!boletaSeleccionada.value) return 0;
  const imp = Number(boletaSeleccionada.value.impurezas || 0);
  const r1 = Number(boletaSeleccionada.value.r1 || 0);
  const sumaR2 = Number(boletaSeleccionada.value.sumaR2 || 0);
  return Math.round(imp + r1 + sumaR2);
});

// Datos de frijol parseados de datosAdicionales
const frijolDataInicial = computed(() => {
  if (!boletaSeleccionada.value?.datosAdicionales) return undefined;
  try {
    const datos = JSON.parse(boletaSeleccionada.value.datosAdicionales);
    return datos.frijol_datos || undefined;
  } catch {
    return undefined;
  }
});

// Funciones de carga
async function cargarBoletas() {
  loading.value = true;
  try {
    const { data } = await api.get('/api/boleta', {
      params: { sedeId: authStore.sedeActivaId || 0 },
    });
    boletas.value = data;
  } catch (error) {
    console.error('Error al cargar boletas:', error);
    Notify.create({ type: 'negative', message: 'Error al cargar boletas' });
  } finally {
    loading.value = false;
  }
}

async function cargarResumen() {
  try {
    const { data } = await api.get('/api/boleta/resumen', {
      params: { sedeId: authStore.sedeActivaId || 0 },
    });
    resumen.value = data;
  } catch (error) {
    console.error('Error al cargar resumen:', error);
  }
}

// Funciones de UI
function formatNumber(v: number | string | null | undefined): string {
  if (v === null || v === undefined) return '0.00';
  const num = Number(v);
  if (isNaN(num)) return '0.00';
  return num.toFixed(2);
}

function getColorEstatus(estatus: string): string {
  switch (estatus) {
    case 'Precio Autorizado':
    case 'Precio Autorizado CG':
      return 'green-2';
    case 'Autorizado CC':
      return 'teal-2';
    case 'Precio Aceptado':
      return 'blue-2';
    case 'Sin Precio':
      return 'blue-2';
    case 'Pendiente por Autorizar':
      return 'orange-2';
    case 'En Renegociacion':
      return 'red-2';
    case 'Precio Rechazado':
      return 'red-3';
    default:
      return 'grey-3';
  }
}

function getTextColorEstatus(estatus: string): string {
  switch (estatus) {
    case 'Precio Autorizado':
    case 'Precio Autorizado CG':
      return 'green-10';
    case 'Autorizado CC':
      return 'teal-10';
    case 'Precio Aceptado':
      return 'blue-10';
    case 'Sin Precio':
      return 'blue-9';
    case 'Pendiente por Autorizar':
      return 'orange-10';
    case 'En Renegociacion':
      return 'red-10';
    case 'Precio Rechazado':
      return 'red-11';
    default:
      return 'grey-8';
  }
}

function limpiarFiltros() {
  filtros.buscar = '';
  filtros.comprador = '';
  filtros.calibre = '';
  filtros.fechaInicio = '';
  filtros.fechaFin = '';
  filtroEstatus.value = '';
}

function verDetalle(boleta: Boleta) {
  // Cambiado de any
  boletaSeleccionada.value = boleta;
  boletaSeleccionadaId.value = boleta.id;
  mostrarModal.value = true;
}
function cambiarBoleta(id: number) {
  const boleta = boletas.value.find((b) => b.id === id);
  if (boleta) {
    boletaSeleccionada.value = boleta;
  }
}

function cerrarModal() {
  mostrarModal.value = false;
  boletaSeleccionada.value = null;
  boletaSeleccionadaId.value = null;
}

function verFoto(url: string) {
  $q.dialog({
    title: 'Foto del Analisis',
    message: `<div style="text-align: center;"><img src="${url}" style="max-width: 100%; max-height: 70vh; border-radius: 8px;" /></div>`,
    html: true,
    fullWidth: true,
    ok: { label: 'Cerrar', color: 'primary', flat: true },
  });
}

async function confirmarPrecio(acepta: boolean) {
  if (!boletaSeleccionada.value) return;

  if (!acepta) {
    // Rechazo directo sin ventana de confirmación intermedia
    void (async () => {
      $q.loading.show({ message: 'Procesando rechazo...' });
      try {
        await api.post(
          '/api/boleta/confirmar-productor',
          {
            boletaId: boletaSeleccionada.value?.id,
            acepta: false,
            motivoRechazo: 'Rechazado por el productor', // Agregamos un motivo por defecto
          },
          { params: { sedeId: authStore.sedeActivaId || 0 } },
        );

        Notify.create({
          type: 'info',
          message: 'Precio rechazado. Boleta enviada a renegociación.',
          icon: 'thumb_down',
        });

        cerrarModal();
        await cargarBoletas();
        await cargarResumen();
      } catch (error) {
        console.error('Error al rechazar precio:', error);
        Notify.create({
          type: 'negative',
          message: 'Error al procesar el rechazo del precio',
        });
      } finally {
        $q.loading.hide();
      }
    })();
    return;
  }

  // Lógica para ACEPTACIÓN
  $q.loading.show({ message: 'Procesando...' });
  try {
    await api.post(
      '/api/boleta/confirmar-productor',
      {
        boletaId: boletaSeleccionada.value.id,
        acepta: true,
      },
      { params: { sedeId: authStore.sedeActivaId || 0 } },
    );

    Notify.create({ type: 'positive', message: 'Precio aceptado. Boleta lista para volcado.' });
    cerrarModal();
    await cargarBoletas();
    await cargarResumen();
  } catch (error) {
    console.error('Error al confirmar precio:', error);
    Notify.create({ type: 'negative', message: 'Error al confirmar precio' });
  } finally {
    $q.loading.hide();
  }
}

function imprimirBoleta() {
  Notify.create({ type: 'info', message: 'Funcion de impresion en desarrollo' });
}

function descargarBoleta() {
  Notify.create({ type: 'info', message: 'Funcion de descarga en desarrollo' });
}

function exportarExcel() {
  const header = [
    'No. Ticket',
    'No. Boleta',
    'Fecha',
    'Productor',
    'Origen',
    'Calibre',
    'Peso Bruto',
    'Precio/kg',
    'Estatus',
  ];
  const rows = boletasFiltradas.value.map((row) => [
    row.ticket,
    row.noBoleta,
    row.fecha,
    row.productor,
    row.origen,
    row.calibre,
    row.pesoBruto,
    row.precio,
    row.estatus,
  ]);

  const csvContent = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const status = exportFile(
    `Boletas_${new Date().toISOString().slice(0, 10)}.csv`,
    '\ufeff' + csvContent,
    'text/csv',
  );

  if (status !== true) {
    Notify.create({ type: 'negative', message: 'Error al generar el archivo' });
  }
}

// Lifecycle
onMounted(async () => {
  await cargarBoletas();
  await cargarResumen();
});

// Watcher para cambio de sede
watch(
  () => authStore.sedeActivaId,
  async () => {
    await cargarBoletas();
    await cargarResumen();
  },
);
</script>

<style scoped>
.border-green {
  border: 1px solid #bbf7d0 !important;
}
.border-orange {
  border: 1px solid #fed7aa !important;
}
.border-blue {
  border: 1px solid #bfdbfe !important;
}
.border-red {
  border: 1px solid #fecaca !important;
}
.border-purple {
  border: 1px solid #e9d5ff !important;
}
.border-grey {
  border: 1px solid #d1d5db !important;
}
</style>
