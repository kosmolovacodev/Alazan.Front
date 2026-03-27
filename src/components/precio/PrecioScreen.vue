<template>
  <q-page class="bg-grey-2">
    <!-- Header -->
    <div
      class="q-px-lg q-py-md bg-white row items-center justify-between"
      style="border-bottom: 1px solid #e5e7eb"
    >
      <div>
        <div class="text-h5 text-weight-bold text-grey-9">GESTIÓN DE PRECIOS</div>
        <div class="text-body2 text-grey-7 q-mt-xs">
          {{
            precioTab === 'autorizar'
              ? 'Autoriza precios de boletas pendientes'
              : 'Renegociación de precios con productores'
          }}
        </div>
      </div>

      <q-btn
        color="blue-7"
        unelevated
        icon="filter_alt"
        :label="`Filtros`"
        @click="mostrarFiltros = !mostrarFiltros"
      >
        <q-icon
          :name="mostrarFiltros ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
          class="q-ml-sm"
        />
      </q-btn>
    </div>

    <div class="q-pa-lg" style="max-width: 1400px; margin: 0 auto">
      <!-- KPIs -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="bg-blue-1">
            <q-card-section>
              <div class="text-caption text-grey-7">Total Boletas</div>
              <div class="text-h5 text-blue-10">{{ totalBoletas }}</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="bg-green-1">
            <q-card-section>
              <div class="text-caption text-grey-7">Precio Promedio</div>
              <div class="text-h5 text-green-10">${{ formatearPrecio(precioPromedio) }}</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card v-if="precioTab === 'autorizar'" flat bordered class="bg-yellow-1">
            <q-card-section>
              <div class="text-caption text-grey-7">Boletas Críticas</div>
              <div class="text-h5 text-yellow-10">{{ boletasCriticas }}</div>
            </q-card-section>
          </q-card>

          <q-card v-else flat bordered class="bg-orange-1">
            <q-card-section>
              <div class="text-caption text-grey-7">En Renegociación</div>
              <div class="text-h5 text-orange-10">{{ totalBoletas }}</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="bg-purple-1">
            <q-card-section>
              <div class="text-caption text-grey-7">Total Toneladas</div>
              <div class="text-h5 text-purple-10">{{ totalToneladas.toFixed(2) }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Tabs -->
      <q-card flat bordered class="q-mb-md bg-white">
        <q-tabs
          v-model="precioTab"
          dense
          align="left"
          indicator-color="orange-6"
          active-color="orange-6"
          class="text-grey-8"
        >
          <q-tab name="autorizar">
            <div class="row items-center no-wrap">
              <span>Autorizar Precio</span>
              <q-badge
                v-if="conteoPendienteAutorizar > 0"
                color="orange-2"
                text-color="orange-10"
                class="q-ml-sm"
              >
                {{ conteoPendienteAutorizar }}
              </q-badge>
            </div>
          </q-tab>

          <q-tab name="renegociar">
            <div class="row items-center no-wrap">
              <span>Renegociar Precio</span>
              <q-badge
                v-if="conteoPendienteNegociar > 0"
                color="orange-2"
                text-color="orange-10"
                class="q-ml-sm"
              >
                {{ conteoPendienteNegociar }}
              </q-badge>
            </div>
          </q-tab>
        </q-tabs>
      </q-card>

      <!-- Filtros -->
      <q-slide-transition>
        <div v-show="mostrarFiltros" class="q-mb-md">
          <q-card flat bordered class="bg-white">
            <q-card-section>
              <div class="row q-col-gutter-md items-end">
                <div class="col-12 col-md-2">
                  <q-input v-model="fechaInicio" dense outlined type="date" label="Fecha Inicio">
                    <template #prepend>
                      <q-icon name="event" />
                    </template>
                  </q-input>
                </div>

                <div class="col-12 col-md-2">
                  <q-input v-model="fechaFin" dense outlined type="date" label="Fecha Fin">
                    <template #prepend>
                      <q-icon name="event" />
                    </template>
                  </q-input>
                </div>

                <div class="col-12 col-md-2">
                  <q-select
                    v-model="filtroComprador"
                    dense
                    outlined
                    label="Comprador"
                    :options="opcionesComprador"
                    emit-value
                    map-options
                    clearable
                  />
                </div>

                <div class="col-12 col-md-2">
                  <q-select
                    v-model="filtroOrigen"
                    dense
                    outlined
                    label="Origen"
                    :options="opcionesOrigen"
                    emit-value
                    map-options
                    clearable
                  />
                </div>

                <div class="col-12 col-md-2">
                  <q-select
                    v-model="filtroEstatus"
                    dense
                    outlined
                    label="Estatus"
                    :options="opcionesEstatus"
                    emit-value
                    map-options
                    clearable
                  />
                </div>

                <div class="col-12 col-md-2">
                  <q-input
                    v-model="busqueda"
                    dense
                    outlined
                    label="Buscar"
                    placeholder="No. Boleta o Productor..."
                  >
                    <template #prepend>
                      <q-icon name="search" />
                    </template>
                  </q-input>
                </div>

                <div class="col-12 col-md-2">
                  <div class="row q-col-gutter-sm">
                    <div class="col-6">
                      <q-btn
                        outline
                        color="grey-8"
                        icon="filter_alt_off"
                        label="Limpiar"
                        class="full-width"
                        @click="limpiarFiltros"
                      />
                    </div>
                    <div class="col-6">
                      <q-btn
                        unelevated
                        color="green-7"
                        icon="table_view"
                        label="Excel"
                        class="full-width"
                        @click="emitExportExcel"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-slide-transition>

      <!-- Tabla -->
      <q-card flat bordered class="bg-white">
        <q-table
          :rows="boletasFiltradas"
          :columns="columns"
          row-key="ticket"
          flat
          bordered
          separator="horizontal"
          :rows-per-page-options="[10, 25, 50, 0]"
          :pagination="{ rowsPerPage: 0 }"
          no-data-label="Sin resultados"
        >
          <template #body="props">
            <q-tr :props="props" class="cursor-pointer" @click="emitSeleccionarBoleta(props.row)">
              <q-td key="noBoleta" :props="props">
                <span class="text-weight-medium">{{ props.row.noBoleta }}</span>
              </q-td>

              <q-td key="fecha" :props="props">
                {{ props.row.fecha }}
              </q-td>

              <q-td key="comprador" :props="props">
                {{ props.row.comprador }}
              </q-td>

              <q-td key="pesoBruto" :props="props">
                {{ props.row.pesoBruto != null ? `${props.row.pesoBruto} kg` : 'N/A' }}
              </q-td>

              <q-td key="descuento" :props="props">
                {{ Math.round(props.row.descuento || 0) }}
              </q-td>

              <q-td key="precioSugerido" :props="props">
                <div class="row items-center no-wrap q-gutter-sm">
                  <q-badge color="orange-2" text-color="orange-10">
                    {{ props.row.precioSugeridoCodigo || 'N/A' }}
                  </q-badge>
                  <span v-if="props.row.precioAutorizado && props.row.precioAutorizado !== props.row.precioSugerido" class="text-weight-bold text-green-8">
                    ${{ formatearPrecio(props.row.precioAutorizado) }}
                    <span class="text-caption text-grey-5 q-ml-xs">(sug. ${{ formatearPrecio(props.row.precioSugerido) }})</span>
                  </span>
                  <span v-else class="text-weight-bold">
                    ${{ formatearPrecio(props.row.precioSugerido) }}
                  </span>
                </div>
              </q-td>

              <q-td v-if="precioTab === 'autorizar'" key="tiempoEspera" :props="props">
                <span :class="claseTiempo(calcularTiempoEspera(props.row))">
                  {{ formatearTiempoEspera(calcularTiempoEspera(props.row)) }}
                </span>
              </q-td>

              <q-td key="estatus" :props="props">
                <q-badge
                  :color="
                    props.row.estatus === 'Sin Precio'
                      ? 'orange-2'
                      : props.row.estatus === 'Precio Rechazado'
                        ? 'red-2'
                        : props.row.estatus === 'En Renegociacion'
                          ? 'blue-2'
                          : 'purple-2'
                  "
                  :text-color="
                    props.row.estatus === 'Sin Precio'
                      ? 'orange-10'
                      : props.row.estatus === 'Precio Rechazado'
                        ? 'red-10'
                        : props.row.estatus === 'En Renegociacion'
                          ? 'blue-10'
                          : 'purple-10'
                  "
                >
                  {{ props.row.estatus }}
                </q-badge>
              </q-td>
            </q-tr>
          </template>

          <template #no-data>
            <div class="q-pa-lg text-grey-7 text-center">
              {{
                precioTab === 'autorizar'
                  ? 'No hay boletas pendientes de autorización'
                  : 'No hay boletas pendientes de renegociación'
              }}
            </div>
          </template>
        </q-table>
      </q-card>

      <!-- Resumen inferior -->
      <div class="row items-center justify-between q-mt-md text-grey-7">
        <div class="text-body2">
          Mostrando {{ boletasFiltradas.length }} boletas
          <span v-if="busqueda"> (filtrado)</span>
        </div>

        <div
          v-if="precioTab === 'autorizar' && boletasFiltradas.length > 0"
          class="row items-center q-gutter-sm text-blue-8"
        >
          <q-icon name="fiber_manual_record" class="pulse-dot" />
          <span class="text-body2">
            Autorización automática después de {{ tiempoAutorizacionAutomatica }} minutos
          </span>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { BoletaPrecio, PrecioTab } from 'src/types/precio';
import type { QTableColumn } from 'quasar';

const columns = computed((): QTableColumn[] => {
  // Definimos el tipo de retorno
  const base: QTableColumn[] = [
    // Definimos el tipo del array base
    {
      name: 'noBoleta',
      label: 'No. Boleta',
      field: 'noBoleta',
      align: 'left', // Al estar tipado como QTableColumn, ya no necesitas 'as const'
      sortable: true,
    },
    { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left', sortable: true },
    {
      name: 'comprador',
      label: 'Comprador',
      field: 'comprador',
      align: 'left',
      sortable: true,
    },
    { name: 'pesoBruto', label: 'Peso Bruto', field: 'pesoBruto', align: 'left' },
    {
      name: 'descuento',
      label: 'Descuento (kg/ton)',
      field: 'descuento',
      align: 'left',
      sortable: true,
    },
    {
      name: 'precioSugerido',
      label: 'Precio Sugerido',
      field: 'precioSugerido ',
      align: 'left',
      sortable: true,
      format: (val: number | string | null) => {
        const num = Number(val);
        return !isNaN(num) && num !== 0 ? num.toFixed(2) : '0.00';
      },
    },
  ];

  if (precioTab.value === 'autorizar') {
    base.push({
      name: 'tiempoEspera',
      label: 'Tiempo Espera',
      field: 'tiempoEspera',
      align: 'left',
    });
  }

  base.push({
    name: 'estatus',
    label: 'Estatus',
    field: 'estatus',
    align: 'left',
    sortable: true,
  });

  return base;
});

interface Props {
  boletasPrecios: BoletaPrecio[];
  tickTiempo: number;
  tiempoAutorizacionAutomatica: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'seleccionarBoleta', boleta: BoletaPrecio, tab: PrecioTab): void;
  (e: 'exportExcel'): void;
}>();

const precioTab = ref<PrecioTab>('autorizar');

watch(precioTab, () => {
  filtroEstatus.value = '';
});

const fechaInicio = ref<string>('');
const fechaFin = ref<string>('');
const busqueda = ref<string>('');
const filtroComprador = ref<string>('');
const filtroOrigen = ref<string>('');
const filtroEstatus = ref<string>('');
const mostrarFiltros = ref<boolean>(true);

const conteoPendienteAutorizar = computed(
  () => props.boletasPrecios.filter((b) => b.estatus === 'Pendiente por Autorizar').length,
);

const conteoPendienteNegociar = computed(
  () => props.boletasPrecios.filter((b) => b.estatus === 'En Renegociacion').length,
);

const opcionesComprador = computed(() => {
  const uniq = Array.from(new Set(props.boletasPrecios.map((b) => b.comprador).filter(Boolean)));
  return uniq.map((v) => ({ label: v, value: v }));
});

const opcionesOrigen = computed(() => {
  const uniq = Array.from(
    new Set(props.boletasPrecios.map((b) => b.origen).filter(Boolean) as string[]),
  );
  return uniq.map((v) => ({ label: v, value: v }));
});

const opcionesEstatus = computed(() => {
  if (precioTab.value === 'autorizar') {
    return [
      { label: 'Todos', value: '' },
      { label: 'Sin Precio', value: 'Sin Precio' },
      { label: 'Precio Autorizado', value: 'Precio Autorizado' },
      //{ label: 'Pendiente por Autorizar', value: 'Pendiente por Autorizar' },
      //{ label: 'Precio Autorizado CC', value: 'Autorizado CC' },
      //{ label: 'Precio Autorizado CG', value: 'Precio Autorizado' },
      //{ label: 'Precio Aceptado', value: 'Precio Aceptado' },
    ];
  }
  return [
    { label: 'Todos', value: '' },
    { label: 'En Renegociacion', value: 'En Renegociacion' },
    //{ label: 'Precio Autorizado CC', value: 'Autorizado CC' },
    { label: 'Precio Rechazado', value: 'Precio Rechazado' },
  ];
});

function limpiarFiltros() {
  fechaInicio.value = '';
  fechaFin.value = '';
  busqueda.value = '';
  filtroComprador.value = '';
  filtroOrigen.value = '';
  filtroEstatus.value = '';
}

function emitSeleccionarBoleta(boleta: BoletaPrecio) {
  emit('seleccionarBoleta', boleta, precioTab.value);
}

function emitExportExcel() {
  emit('exportExcel');
}

function calcularTiempoEspera(boleta: BoletaPrecio): number {
  void props.tickTiempo;
  if (!boleta.tiempoRegistro) return 0;

  const ahora = Date.now();
  const registro = new Date(boleta.tiempoRegistro).getTime();
  return Math.floor((ahora - registro) / 60000);
}

function formatearTiempoEspera(minutos: number): string {
  if (minutos === 0) return 'Recién registrado';
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return `${horas}h ${mins}m`;
}

function claseTiempo(minutos: number): string {
  const t = props.tiempoAutorizacionAutomatica;
  if (minutos >= t) return 'text-negative text-weight-bold';
  if (minutos >= t * 0.75) return 'text-orange-8 text-weight-medium';
  return 'text-positive';
}

// Formatear precio: si el valor es > 1000 (garbanzo, en unidades) divide entre 1000,
// si es <= 1000 (frijol, ya en pesos como 25.50) lo muestra tal cual.
function formatearPrecio(v: number | string | null | undefined): string {
  if (v === null || v === undefined) return '0.00';
  const raw = Number(v);
  if (isNaN(raw)) return '0.00';
  const num = raw > 1000 ? raw / 1000 : raw;
  return num.toFixed(2);
}

const boletasFiltradas = computed(() => {
  const base = props.boletasPrecios
    .filter((boleta) => {
      // Filtro base por tab
      const estatusAutorizar = [
        'Sin Precio',
        'Pendiente por Autorizar',
        'Precio Autorizado',
        'Precio Autorizado CG',
        'Autorizado CC',
      ];
      const estatusRenegociar = [
        'Pendiente por Renegociar',
        'En Renegociacion',
        'Precio Rechazado',
      ];
      const enTab =
        precioTab.value === 'autorizar'
          ? estatusAutorizar.includes(boleta.estatus || '')
          : estatusRenegociar.includes(boleta.estatus || '');
      if (!enTab) return false;

      // Filtro por estatus específico
      if (filtroEstatus.value && boleta.estatus !== filtroEstatus.value) return false;

      return true;
    })
    .filter((boleta) => {
      if (busqueda.value) {
        const b = busqueda.value.trim().toLowerCase();
        const matchNoBoleta = (boleta.noBoleta || '').includes(busqueda.value);
        const matchProd = (boleta.productor || '').toLowerCase().includes(b);
        if (!matchNoBoleta && !matchProd) return false;
      }

      if (filtroComprador.value && boleta.comprador !== filtroComprador.value) return false;
      if (filtroOrigen.value && boleta.origen !== filtroOrigen.value) return false;

      return true;
    });

  return base;
});

const totalBoletas = computed(() => boletasFiltradas.value.length);

const totalToneladas = computed(() =>
  boletasFiltradas.value.reduce((sum, b) => sum + (b.tonsAprox || 0), 0),
);

const precioPromedio = computed(() => {
  if (boletasFiltradas.value.length === 0) return 0;
  const s = boletasFiltradas.value.reduce((sum, b) => sum + (b.precioSugerido || 0), 0);
  return s / boletasFiltradas.value.length;
});

const boletasCriticas = computed(() => {
  if (precioTab.value !== 'autorizar') return 0;
  const limite = props.tiempoAutorizacionAutomatica * 0.75;
  return boletasFiltradas.value.filter((b) => calcularTiempoEspera(b) >= limite).length;
});
</script>

<style scoped>
.pulse-dot {
  animation: pulse 1.1s infinite;
}
@keyframes pulse {
  0% {
    opacity: 0.2;
    transform: scale(0.9);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
  100% {
    opacity: 0.2;
    transform: scale(0.9);
  }
}
</style>
